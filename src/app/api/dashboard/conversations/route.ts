import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (phone) {
      const result = await db.execute({
        sql: 'SELECT * FROM conversations WHERE phone_number = ? ORDER BY created_at ASC LIMIT ?',
        args: [phone, limit],
      });
      return NextResponse.json(result.rows);
    }

    // Return recent conversations grouped by customer with client name
    const result = await db.execute({
      sql: `SELECT cu.id, cu.phone_number, cu.display_name, cu.last_message_at,
              cu.is_escalated, cu.total_messages, c.business_name
            FROM customers cu
            LEFT JOIN clients c ON cu.client_id = c.id
            ORDER BY cu.last_message_at DESC LIMIT ?`,
      args: [limit],
    });

    // Format to match the frontend's expected shape
    const data = result.rows.map((row) => ({
      id: row.id,
      phone_number: row.phone_number,
      display_name: row.display_name,
      last_message_at: row.last_message_at,
      is_escalated: row.is_escalated === 1,
      total_messages: row.total_messages,
      clients: { business_name: row.business_name },
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error('Conversations error:', err);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}
