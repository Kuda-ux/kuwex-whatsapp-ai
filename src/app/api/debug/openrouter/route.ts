import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const envModel = process.env.OPENROUTER_MODEL || '(not set, using default)';

  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY not set', keyLength: 0 });
  }

  try {
    // Test the actual chatCompletion function (with retry/fallback logic)
    const result = await chatCompletion([
      { role: 'system', content: 'You are a helpful assistant. Reply in one sentence.' },
      { role: 'user', content: 'Say hello and confirm you are working.' },
    ]);

    return NextResponse.json({
      envModel,
      keyPrefix: apiKey.substring(0, 8) + '...',
      keyLength: apiKey.length,
      aiResponse: result.text,
      tokensUsed: result.tokensUsed,
      isGenericFallback: result.text.includes('technical issue') || result.text.includes('connect you with'),
    });
  } catch (err) {
    return NextResponse.json({ error: 'chatCompletion failed', details: String(err) });
  }
}
