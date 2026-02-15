import { NextResponse } from 'next/server';
import { getDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

    const [customers, messages, messagesToday, escalations, intents] = await Promise.all([
      db.execute('SELECT COUNT(*) as cnt FROM customers'),
      db.execute('SELECT COUNT(*) as cnt FROM conversations'),
      db.execute({ sql: "SELECT COUNT(*) as cnt FROM conversations WHERE created_at >= ?", args: [oneDayAgo] }),
      db.execute("SELECT COUNT(*) as cnt FROM escalations WHERE status = 'pending'"),
      db.execute('SELECT detected_intent FROM intent_logs'),
    ]);

    const intentBreakdown: Record<string, number> = {};
    intents.rows.forEach((row) => {
      const i = (row.detected_intent as string) || 'unknown';
      intentBreakdown[i] = (intentBreakdown[i] || 0) + 1;
    });

    return NextResponse.json({
      totalCustomers: Number(customers.rows[0]?.cnt) || 0,
      totalMessages: Number(messages.rows[0]?.cnt) || 0,
      messagesToday: Number(messagesToday.rows[0]?.cnt) || 0,
      pendingEscalations: Number(escalations.rows[0]?.cnt) || 0,
      intentBreakdown,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({
      totalCustomers: 0, totalMessages: 0, messagesToday: 0, pendingEscalations: 0, intentBreakdown: {},
    });
  }
}
