import { getDb } from './supabase';
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
  const db = getDb();

  // 1. Lookup client by phone_number_id
  const clientResult = await db.execute({
    sql: 'SELECT * FROM clients WHERE whatsapp_phone_number_id = ? AND is_active = 1 LIMIT 1',
    args: [msg.phoneNumberId],
  });

  if (clientResult.rows.length === 0) {
    console.log(`No active client for phone_number_id: ${msg.phoneNumberId}`);
    return;
  }

  const client = clientResult.rows[0] as Record<string, unknown>;

  // 2. Upsert customer
  const existingCustomer = await db.execute({
    sql: 'SELECT id, total_messages FROM customers WHERE client_id = ? AND phone_number = ? LIMIT 1',
    args: [client.id as string, msg.phoneNumber],
  });

  let customerId: string;

  if (existingCustomer.rows.length > 0) {
    customerId = existingCustomer.rows[0].id as string;
    await db.execute({
      sql: `UPDATE customers SET last_message_at = datetime('now'), total_messages = total_messages + 1,
            display_name = COALESCE(?, display_name), updated_at = datetime('now')
            WHERE id = ?`,
      args: [msg.displayName || null, customerId],
    });
  } else {
    customerId = crypto.randomUUID().replace(/-/g, '');
    await db.execute({
      sql: `INSERT INTO customers (id, client_id, phone_number, display_name) VALUES (?, ?, ?, ?)`,
      args: [customerId, client.id as string, msg.phoneNumber, msg.displayName || null],
    });
  }

  // 3. Store user message
  await db.execute({
    sql: `INSERT INTO conversations (client_id, customer_id, phone_number, role, message_text, whatsapp_message_id)
          VALUES (?, ?, ?, 'user', ?, ?)`,
    args: [client.id as string, customerId, msg.phoneNumber, msg.messageText, msg.messageId],
  });

  // 4. Check if already escalated
  const escCheck = await db.execute({
    sql: 'SELECT is_escalated FROM customers WHERE client_id = ? AND phone_number = ? LIMIT 1',
    args: [client.id as string, msg.phoneNumber],
  });

  if (escCheck.rows.length > 0 && escCheck.rows[0].is_escalated === 1) {
    const reply = `Thank you for your message. Your conversation has been assigned to a team member at ${client.business_name}. They will respond to you shortly.`;
    await sendWhatsAppMessage({
      to: msg.phoneNumber,
      text: reply,
      phoneNumberId: msg.phoneNumberId,
      accessToken: client.whatsapp_access_token as string,
    });
    return;
  }

  // 5. Get conversation history
  const historyResult = await db.execute({
    sql: `SELECT role, message_text FROM conversations
          WHERE phone_number = ? AND client_id = ?
          ORDER BY created_at DESC LIMIT 10`,
    args: [msg.phoneNumber, client.id as string],
  });

  const history: ChatMessage[] = [...historyResult.rows]
    .reverse()
    .map((r) => ({
      role: r.role as 'user' | 'assistant',
      content: r.message_text as string,
    }));

  // 6. Detect intent
  const { intent, confidence } = detectIntent(msg.messageText);

  // 7. Log intent
  await db.execute({
    sql: `INSERT INTO intent_logs (client_id, phone_number, message_text, detected_intent, confidence)
          VALUES (?, ?, ?, ?, ?)`,
    args: [client.id as string, msg.phoneNumber, msg.messageText, intent, confidence],
  });

  // 8. Handle human escalation
  if (intent === 'human_escalation') {
    await db.execute({
      sql: `UPDATE customers SET is_escalated = 1, escalated_at = datetime('now')
            WHERE client_id = ? AND phone_number = ?`,
      args: [client.id as string, msg.phoneNumber],
    });

    await db.execute({
      sql: `INSERT INTO escalations (client_id, customer_id, phone_number, reason, trigger_message)
            VALUES (?, ?, ?, 'Customer requested human agent', ?)`,
      args: [client.id as string, customerId, msg.phoneNumber, msg.messageText],
    });

    const escalationReply = `I understand you'd like to speak with a real person. Let me connect you with our team right away.\n\nSomeone from ${client.business_name} will reach out to you shortly. Thank you for your patience!`;

    await sendWhatsAppMessage({
      to: msg.phoneNumber,
      text: escalationReply,
      phoneNumberId: msg.phoneNumberId,
      accessToken: client.whatsapp_access_token as string,
    });

    await db.execute({
      sql: `INSERT INTO conversations (client_id, customer_id, phone_number, role, message_text, detected_intent)
            VALUES (?, ?, ?, 'assistant', ?, ?)`,
      args: [client.id as string, customerId, msg.phoneNumber, escalationReply, intent],
    });

    return;
  }

  // 9. Build prompt and call AI
  const systemPrompt = buildSystemPrompt(intent, {
    business_name: client.business_name as string,
    brand_tone: (client.brand_tone as string) || 'professional and friendly',
    services_description: (client.services_description as string) || 'General business services',
  });

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
  ];

  const aiResult = await chatCompletion(messages);

  // 10. Store AI response
  await db.execute({
    sql: `INSERT INTO conversations (client_id, customer_id, phone_number, role, message_text, detected_intent, tokens_used)
          VALUES (?, ?, ?, 'assistant', ?, ?, ?)`,
    args: [client.id as string, customerId, msg.phoneNumber, aiResult.text, intent, aiResult.tokensUsed],
  });

  // 11. Send WhatsApp reply
  await sendWhatsAppMessage({
    to: msg.phoneNumber,
    text: aiResult.text,
    phoneNumberId: msg.phoneNumberId,
    accessToken: client.whatsapp_access_token as string,
  });
}
