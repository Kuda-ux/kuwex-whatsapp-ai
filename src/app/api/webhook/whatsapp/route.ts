import { NextRequest, NextResponse } from 'next/server';
import { extractMessageData } from '@/lib/whatsapp';
import { processIncomingMessage } from '@/lib/pipeline';
import { getDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET — Meta webhook verification OR debug viewer
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Debug mode: show recent webhook activity
  if (searchParams.get('debug') === '1') {
    try {
      const db = getDb();
      const clients = await db.execute('SELECT id, business_name, whatsapp_phone_number_id, is_active FROM clients');
      const recentMsgs = await db.execute('SELECT id, phone_number, role, message_text, detected_intent, created_at FROM conversations ORDER BY created_at DESC LIMIT 10');
      return NextResponse.json({
        status: 'debug',
        registeredClients: clients.rows,
        recentMessages: recentMsgs.rows,
        envCheck: {
          hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
          hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
          hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
          hasVerifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
          openRouterModel: process.env.OPENROUTER_MODEL || 'not set',
        },
      });
    } catch (err) {
      return NextResponse.json({ error: String(err) });
    }
  }

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'kuwex-wa-verify-2024';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('Webhook verification failed:', { mode, token });
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST — Incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[WEBHOOK] Incoming payload:', JSON.stringify(body).substring(0, 500));

    const msg = extractMessageData(body);

    if (!msg) {
      console.log('[WEBHOOK] No text message found — status update or media');
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    console.log('[WEBHOOK] Extracted:', {
      from: msg.phoneNumber,
      phoneNumberId: msg.phoneNumberId,
      text: msg.messageText.substring(0, 100),
      name: msg.displayName,
    });

    await processIncomingMessage(msg);

    console.log('[WEBHOOK] Processed successfully for', msg.phoneNumber);
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err) {
    console.error('[WEBHOOK] Error:', err);
    // Always return 200 to Meta to prevent retries
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
