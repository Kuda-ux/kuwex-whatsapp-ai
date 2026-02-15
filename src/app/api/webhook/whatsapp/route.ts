import { NextRequest, NextResponse } from 'next/server';
import { extractMessageData } from '@/lib/whatsapp';
import { processIncomingMessage } from '@/lib/pipeline';

// GET — Meta webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

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

    // Extract message data
    const msg = extractMessageData(body);

    if (!msg) {
      // Status update or non-text message — acknowledge silently
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    // Process asynchronously so we return 200 to Meta quickly
    // Vercel edge functions handle this via waitUntil, but for
    // serverless functions we process inline (Meta allows up to 15s)
    await processIncomingMessage(msg);

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err) {
    console.error('Webhook POST error:', err);
    // Always return 200 to Meta to prevent retries
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
