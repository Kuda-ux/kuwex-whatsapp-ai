export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  tokensUsed: number;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not set');
    return {
      text: 'I apologize, I\'m having a brief technical issue. Please try again in a moment, or type "human" to speak with our team directly.',
      tokensUsed: 0,
    };
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
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('OpenRouter error:', res.status, errBody);
      return {
        text: 'Thank you for your message! Let me connect you with our team for the best assistance.',
        tokensUsed: 0,
      };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || 'Thank you for your message! Our team will get back to you shortly.';
    const tokensUsed = data.usage?.total_tokens || 0;

    return { text, tokensUsed };
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
  const base = `You are a helpful AI sales assistant for ${client.business_name}.\nTone: ${client.brand_tone}\n\nServices:\n${client.services_description}\n\nRules:\n- Keep messages SHORT — this is WhatsApp (under 150 words)\n- Be warm, professional, and helpful\n- Use 1-2 emojis max\n- Always guide toward a next step (booking, purchase, or human agent)\n`;

  switch (intent) {
    case 'pricing':
      return base + '\nFocus: Help with pricing questions. Frame costs as investments. Present 2-3 options when possible. Be transparent — no hidden fees.';
    case 'booking':
      return base + '\nFocus: Help schedule appointments/demos. Collect: preferred date/time, name, and contact. Confirm details before finalizing.';
    case 'support':
      return base + '\nFocus: Resolve customer issues empathetically. Acknowledge the problem first. Offer clear solutions or escalate to human if complex.';
    default:
      return base + '\nFocus: Engage the prospect warmly. Understand their needs. Highlight relevant services. Guide toward a consultation or purchase.';
  }
}
