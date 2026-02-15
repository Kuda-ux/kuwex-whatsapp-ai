import { createServerClient } from './supabase';
import { detectIntent } from './intent';
import { buildSystemPrompt, chatCompletion, ChatMessage } from './openrouter';
import { sendWhatsAppMessage } from './whatsapp';

interface MessageContext {
  phoneNumber: string;
  messageText: string;
  messageId: string;
  timestamp: string;
  displayName: string;
  phoneNumberId: string;
}

export async function processIncomingMessage(msg: MessageContext): Promise<void> {
  const db = createServerClient();

  // 1. Lookup client by phone_number_id
  const { data: client, error: clientErr } = await db
    .from('clients')
    .select('*')
    .eq('whatsapp_phone_number_id', msg.phoneNumberId)
    .eq('is_active', true)
    .single();

  if (clientErr || !client) {
    console.log(`No active client for phone_number_id: ${msg.phoneNumberId}`);
    return;
  }

  // 2. Upsert customer
  const { data: upsertResult } = await db.rpc('upsert_customer', {
    p_client_id: client.id,
    p_phone_number: msg.phoneNumber,
    p_display_name: msg.displayName,
  });

  const customerId = upsertResult as string;
  if (!customerId) {
    console.error('Failed to upsert customer');
    return;
  }

  // 3. Store user message
  await db.from('conversations').insert({
    client_id: client.id,
    customer_id: customerId,
    phone_number: msg.phoneNumber,
    role: 'user',
    message_text: msg.messageText,
    whatsapp_message_id: msg.messageId,
  });

  // 4. Check if already escalated
  const { data: customerRow } = await db
    .from('customers')
    .select('is_escalated')
    .eq('client_id', client.id)
    .eq('phone_number', msg.phoneNumber)
    .single();

  if (customerRow?.is_escalated) {
    const reply = `Thank you for your message. Your conversation has been assigned to a team member at ${client.business_name}. They will respond to you shortly.`;
    await sendWhatsAppMessage({
      to: msg.phoneNumber,
      text: reply,
      phoneNumberId: msg.phoneNumberId,
      accessToken: client.whatsapp_access_token,
    });
    return;
  }

  // 5. Get conversation history
  const { data: historyRows } = await db
    .from('conversations')
    .select('role, message_text')
    .eq('phone_number', msg.phoneNumber)
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const history: ChatMessage[] = (historyRows || [])
    .reverse()
    .map((r: { role: string; message_text: string }) => ({
      role: r.role as 'user' | 'assistant',
      content: r.message_text,
    }));

  // 6. Detect intent
  const { intent, confidence } = detectIntent(msg.messageText);

  // 7. Log intent
  await db.from('intent_logs').insert({
    client_id: client.id,
    phone_number: msg.phoneNumber,
    message_text: msg.messageText,
    detected_intent: intent,
    confidence,
  });

  // 8. Handle human escalation
  if (intent === 'human_escalation') {
    await db
      .from('customers')
      .update({ is_escalated: true, escalated_at: new Date().toISOString() })
      .eq('client_id', client.id)
      .eq('phone_number', msg.phoneNumber);

    await db.from('escalations').insert({
      client_id: client.id,
      customer_id: customerId,
      phone_number: msg.phoneNumber,
      reason: 'Customer requested human agent',
      trigger_message: msg.messageText,
    });

    const escalationReply = `I understand you'd like to speak with a real person. Let me connect you with our team right away.\n\nSomeone from ${client.business_name} will reach out to you shortly. Thank you for your patience!`;

    await sendWhatsAppMessage({
      to: msg.phoneNumber,
      text: escalationReply,
      phoneNumberId: msg.phoneNumberId,
      accessToken: client.whatsapp_access_token,
    });

    await db.from('conversations').insert({
      client_id: client.id,
      customer_id: customerId,
      phone_number: msg.phoneNumber,
      role: 'assistant',
      message_text: escalationReply,
      detected_intent: intent,
    });

    return;
  }

  // 9. Build prompt and call AI
  const systemPrompt = buildSystemPrompt(intent, {
    business_name: client.business_name,
    brand_tone: client.brand_tone || 'professional and friendly',
    services_description: client.services_description || 'General business services',
  });

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
  ];

  const aiResult = await chatCompletion(messages);

  // 10. Store AI response
  await db.from('conversations').insert({
    client_id: client.id,
    customer_id: customerId,
    phone_number: msg.phoneNumber,
    role: 'assistant',
    message_text: aiResult.text,
    detected_intent: intent,
    tokens_used: aiResult.tokensUsed,
  });

  // 11. Send WhatsApp reply
  await sendWhatsAppMessage({
    to: msg.phoneNumber,
    text: aiResult.text,
    phoneNumberId: msg.phoneNumberId,
    accessToken: client.whatsapp_access_token,
  });
}
