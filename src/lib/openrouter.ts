export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  tokensUsed: number;
}

const PRIMARY_MODEL = 'meta-llama/llama-3.1-8b-instruct';
const FALLBACK_MODEL = 'openrouter/free';

async function callOpenRouter(apiKey: string, model: string, messages: ChatMessage[]): Promise<{ ok: boolean; text?: string; tokensUsed?: number; error?: string }> {
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
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`OpenRouter error [${model}]:`, res.status, errBody);
    return { ok: false, error: `${res.status}: ${errBody}` };
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    console.error(`OpenRouter empty response [${model}]:`, JSON.stringify(data));
    return { ok: false, error: 'Empty response from model' };
  }

  return { ok: true, text, tokensUsed: data.usage?.total_tokens || 0 };
}

export async function chatCompletion(messages: ChatMessage[]): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || PRIMARY_MODEL;

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not set');
    return {
      text: 'I apologize, I\'m having a brief technical issue. Please try again in a moment, or type "human" to speak with our team directly.',
      tokensUsed: 0,
    };
  }

  try {
    // Try primary model
    const primary = await callOpenRouter(apiKey, model, messages);
    if (primary.ok) {
      return { text: primary.text!, tokensUsed: primary.tokensUsed! };
    }

    // If primary fails, try fallback model
    console.warn(`Primary model ${model} failed, trying fallback ${FALLBACK_MODEL}...`);
    const fallback = await callOpenRouter(apiKey, FALLBACK_MODEL, messages);
    if (fallback.ok) {
      return { text: fallback.text!, tokensUsed: fallback.tokensUsed! };
    }

    console.error('Both primary and fallback models failed');
    return {
      text: 'I apologize, I\'m having a brief technical issue. Please try again in a moment, or type "human" to speak with our team directly.',
      tokensUsed: 0,
    };
  } catch (err) {
    console.error('OpenRouter fetch error:', err);
    return {
      text: 'I apologize, I\'m having a brief technical issue. Please try again in a moment, or type "human" to speak with our team directly.',
      tokensUsed: 0,
    };
  }
}

export function buildSystemPrompt(intent: string, client: {
  business_name: string;
  brand_tone: string;
  services_description: string;
}): string {
  const base = `You are the AI sales assistant for ${client.business_name}. You ARE the business — speak as "we" and "our", never refer to yourself as an AI or bot.

Tone: ${client.brand_tone}

BUSINESS DETAILS (use this to answer questions):
${client.services_description}

CRITICAL RULES:
- You MUST answer using the business details above. NEVER say "let me connect you with sales" or "I'll pass you to someone" unless the customer explicitly asks for a human.
- Keep messages concise — this is WhatsApp (under 150 words)
- Be confident, knowledgeable, and specific about services and pricing
- Use 1-2 emojis max
- Always guide toward a next step (booking a call, sharing project details, or making a deposit)
- If asked about pricing, give the actual prices from the business details above
- If asked about services, describe them specifically from the details above
- Ask clarifying questions to understand the client's needs before recommending solutions
`;

  switch (intent) {
    case 'pricing':
      return base + '\nFocus: Help with pricing questions. Frame costs as investments. Present 2-3 options when possible. Be transparent — no hidden fees.';
    case 'booking':
      return base + '\nFocus: Help schedule appointments/demos. Collect: preferred date/time, name, and contact. Confirm details before finalizing.';
    case 'support':
      return base + '\nFocus: Resolve customer issues empathetically. Acknowledge the problem first. Offer clear solutions or escalate to human if complex.';
    default:
      return base + '\nFocus: Engage the prospect warmly. Understand their needs. Highlight relevant services with specific details from the business info. Guide toward a consultation or booking a call. NEVER deflect to a human unless asked.';
  }
}
