import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = createServerClient();

  // Messages per day (last 14 days)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  const { data: recentMessages } = await db
    .from('conversations')
    .select('created_at, role, detected_intent')
    .gte('created_at', fourteenDaysAgo)
    .order('created_at', { ascending: true });

  // Group by day
  const dailyMap: Record<string, { user: number; assistant: number }> = {};
  (recentMessages || []).forEach((row: { created_at: string; role: string }) => {
    const day = row.created_at.substring(0, 10);
    if (!dailyMap[day]) dailyMap[day] = { user: 0, assistant: 0 };
    if (row.role === 'user') dailyMap[day].user++;
    else if (row.role === 'assistant') dailyMap[day].assistant++;
  });

  const dailyMessages = Object.entries(dailyMap).map(([date, counts]) => ({
    date,
    incoming: counts.user,
    outgoing: counts.assistant,
  }));

  // Intent distribution
  const intentMap: Record<string, number> = {};
  (recentMessages || []).forEach((row: { detected_intent: string | null; role: string }) => {
    if (row.role === 'user' || !row.detected_intent) return;
    intentMap[row.detected_intent] = (intentMap[row.detected_intent] || 0) + 1;
  });

  const intentDistribution = Object.entries(intentMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Recent escalations
  const { data: escalations } = await db
    .from('escalations')
    .select('id, phone_number, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Response rate (conversations with both user and assistant messages)
  const { count: totalUserMsgs } = await db
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'user');

  const { count: totalAiMsgs } = await db
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'assistant');

  const responseRate = totalUserMsgs && totalUserMsgs > 0
    ? Math.round(((totalAiMsgs || 0) / totalUserMsgs) * 100)
    : 0;

  return NextResponse.json({
    dailyMessages,
    intentDistribution,
    escalations: escalations || [],
    responseRate: Math.min(responseRate, 100),
  });
}
