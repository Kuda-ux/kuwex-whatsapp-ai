import { NextResponse } from 'next/server';
import { getDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

    const [recentMsgs, escalationsResult, userCount, aiCount] = await Promise.all([
      db.execute({
        sql: 'SELECT created_at, role, detected_intent FROM conversations WHERE created_at >= ? ORDER BY created_at ASC',
        args: [fourteenDaysAgo],
      }),
      db.execute('SELECT id, phone_number, reason, status, created_at FROM escalations ORDER BY created_at DESC LIMIT 10'),
      db.execute("SELECT COUNT(*) as cnt FROM conversations WHERE role = 'user'"),
      db.execute("SELECT COUNT(*) as cnt FROM conversations WHERE role = 'assistant'"),
    ]);

    // Group by day
    const dailyMap: Record<string, { user: number; assistant: number }> = {};
    recentMsgs.rows.forEach((row) => {
      const day = (row.created_at as string).substring(0, 10);
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
    recentMsgs.rows.forEach((row) => {
      if (row.role === 'user' || !row.detected_intent) return;
      const intent = row.detected_intent as string;
      intentMap[intent] = (intentMap[intent] || 0) + 1;
    });

    const intentDistribution = Object.entries(intentMap).map(([name, value]) => ({
      name,
      value,
    }));

    const totalUser = Number(userCount.rows[0]?.cnt) || 0;
    const totalAi = Number(aiCount.rows[0]?.cnt) || 0;
    const responseRate = totalUser > 0 ? Math.min(Math.round((totalAi / totalUser) * 100), 100) : 0;

    return NextResponse.json({
      dailyMessages,
      intentDistribution,
      escalations: escalationsResult.rows,
      responseRate,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({
      dailyMessages: [], intentDistribution: [], escalations: [], responseRate: 0,
    });
  }
}
