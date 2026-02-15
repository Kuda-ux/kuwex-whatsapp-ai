import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = createServerClient();
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (phone) {
    const { data, error } = await db
      .from('conversations')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Return recent conversations grouped by customer
  const { data, error } = await db
    .from('customers')
    .select(`
      id,
      phone_number,
      display_name,
      last_message_at,
      is_escalated,
      total_messages,
      clients ( business_name )
    `)
    .order('last_message_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
