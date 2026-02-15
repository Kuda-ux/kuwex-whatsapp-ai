import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = createServerClient();

  const [customers, messages, messagesToday, escalations, intents] = await Promise.all([
    db.from('customers').select('id', { count: 'exact', head: true }),
    db.from('conversations').select('id', { count: 'exact', head: true }),
    db.from('conversations').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    db.from('escalations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('intent_logs').select('detected_intent'),
  ]);

  const intentBreakdown: Record<string, number> = {};
  (intents.data || []).forEach((row: { detected_intent: string }) => {
    const i = row.detected_intent || 'unknown';
    intentBreakdown[i] = (intentBreakdown[i] || 0) + 1;
  });

  return NextResponse.json({
    totalCustomers: customers.count || 0,
    totalMessages: messages.count || 0,
    messagesToday: messagesToday.count || 0,
    pendingEscalations: escalations.count || 0,
    intentBreakdown,
  });
}
