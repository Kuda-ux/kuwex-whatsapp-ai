export interface IntentResult {
  intent: string;
  confidence: number;
}

const INTENT_RULES: { intent: string; keywords: string[]; confidence: number }[] = [
  {
    intent: 'human_escalation',
    keywords: ['human', 'agent', 'real person', 'call me', 'speak to someone', 'talk to someone', 'manager', 'supervisor', 'operator'],
    confidence: 1.0,
  },
  {
    intent: 'pricing',
    keywords: ['price', 'pricing', 'cost', 'how much', 'rate', 'fee', 'charge', 'quote', 'budget', 'afford', 'package', 'plan'],
    confidence: 0.85,
  },
  {
    intent: 'booking',
    keywords: ['book', 'booking', 'appointment', 'schedule', 'meeting', 'demo', 'consultation', 'calendar', 'available', 'slot'],
    confidence: 0.85,
  },
  {
    intent: 'support',
    keywords: ['help', 'issue', 'problem', 'broken', 'not working', 'error', 'bug', 'fix', 'complaint', 'refund', 'cancel'],
    confidence: 0.8,
  },
];

export function detectIntent(messageText: string): IntentResult {
  const lower = messageText.toLowerCase().trim();

  for (const rule of INTENT_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { intent: rule.intent, confidence: rule.confidence };
    }
  }

  return { intent: 'sales', confidence: 0.7 };
}
