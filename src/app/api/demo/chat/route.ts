import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/supabase';
import { detectIntent } from '@/lib/intent';
import { buildSystemPrompt, chatCompletion, ChatMessage } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message, clientId, sessionPhone } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const db = getDb();

    // 1. Get client (use provided clientId or first active client)
    let clientResult;
    if (clientId) {
      clientResult = await db.execute({
        sql: 'SELECT * FROM clients WHERE id = ? AND is_active = 1 LIMIT 1',
        args: [clientId],
      });
    } else {
      clientResult = await db.execute('SELECT * FROM clients WHERE is_active = 1 ORDER BY created_at ASC LIMIT 1');
    }

    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'No active client found. Add a client first.' }, { status: 404 });
    }

    const client = clientResult.rows[0] as Record<string, unknown>;
    const demoPhone = sessionPhone || 'demo-' + Date.now();

    // 2. Upsert demo customer
    const existingCustomer = await db.execute({
      sql: 'SELECT id FROM customers WHERE client_id = ? AND phone_number = ? LIMIT 1',
      args: [client.id as string, demoPhone],
    });

    let customerId: string;
    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].id as string;
      await db.execute({
        sql: `UPDATE customers SET last_message_at = datetime('now'), total_messages = total_messages + 1, updated_at = datetime('now') WHERE id = ?`,
        args: [customerId],
      });
    } else {
      customerId = crypto.randomUUID().replace(/-/g, '');
      await db.execute({
        sql: 'INSERT INTO customers (id, client_id, phone_number, display_name) VALUES (?, ?, ?, ?)',
        args: [customerId, client.id as string, demoPhone, 'Demo User'],
      });
    }

    // 3. Store user message
    await db.execute({
      sql: `INSERT INTO conversations (client_id, customer_id, phone_number, role, message_text, whatsapp_message_id)
            VALUES (?, ?, ?, 'user', ?, ?)`,
      args: [client.id as string, customerId, demoPhone, message, 'demo-' + Date.now()],
    });

    // 4. Detect intent
    const { intent, confidence } = detectIntent(message);

    // 5. Log intent
    await db.execute({
      sql: 'INSERT INTO intent_logs (client_id, phone_number, message_text, detected_intent, confidence) VALUES (?, ?, ?, ?, ?)',
      args: [client.id as string, demoPhone, message, intent, confidence],
    });

    // 6. Check escalation
    if (intent === 'human_escalation') {
      await db.execute({
        sql: `UPDATE customers SET is_escalated = 1, escalated_at = datetime('now') WHERE id = ?`,
        args: [customerId],
      });
      await db.execute({
        sql: `INSERT INTO escalations (client_id, customer_id, phone_number, reason, trigger_message) VALUES (?, ?, ?, 'Customer requested human agent', ?)`,
        args: [client.id as string, customerId, demoPhone, message],
      });

      const escalationReply = `I understand you'd like to speak with a real person. Let me connect you with our team right away.\n\nSomeone from ${client.business_name} will reach out to you shortly. Thank you for your patience!`;

      await db.execute({
        sql: `INSERT INTO conversations (client_id, customer_id, phone_number, role, message_text, detected_intent) VALUES (?, ?, ?, 'assistant', ?, ?)`,
        args: [client.id as string, customerId, demoPhone, escalationReply, intent],
      });

      return NextResponse.json({
        reply: escalationReply,
        intent,
        confidence,
        sessionPhone: demoPhone,
        clientName: client.business_name,
        tokensUsed: 0,
      });
    }

    // 7. Get conversation history
    const historyResult = await db.execute({
      sql: 'SELECT role, message_text FROM conversations WHERE phone_number = ? AND client_id = ? ORDER BY created_at DESC LIMIT 10',
      args: [demoPhone, client.id as string],
    });

    const history: ChatMessage[] = [...historyResult.rows]
      .reverse()
      .map((r) => ({
        role: r.role as 'user' | 'assistant',
        content: r.message_text as string,
      }));

    // 8. Build prompt and call AI
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

    // 9. Store AI response
    await db.execute({
      sql: `INSERT INTO conversations (client_id, customer_id, phone_number, role, message_text, detected_intent, tokens_used) VALUES (?, ?, ?, 'assistant', ?, ?, ?)`,
      args: [client.id as string, customerId, demoPhone, aiResult.text, intent, aiResult.tokensUsed],
    });

    return NextResponse.json({
      reply: aiResult.text,
      intent,
      confidence,
      sessionPhone: demoPhone,
      clientName: client.business_name,
      tokensUsed: aiResult.tokensUsed,
    });
  } catch (err) {
    console.error('Demo chat error:', err);
    return NextResponse.json({ error: 'Failed to process message: ' + String(err) }, { status: 500 });
  }
}
