import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY not set', keyLength: 0 });
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://kuwex.co.zw',
        'X-Title': 'Kuwex WhatsApp AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Reply in one sentence.' },
          { role: 'user', content: 'Say hello' },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    const status = res.status;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });

    const body = await res.text();
    let parsed;
    try { parsed = JSON.parse(body); } catch { parsed = body; }

    return NextResponse.json({
      status,
      ok: res.ok,
      model,
      keyPrefix: apiKey.substring(0, 8) + '...',
      keyLength: apiKey.length,
      responseHeaders: headers,
      responseBody: parsed,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Fetch failed', details: String(err) });
  }
}
