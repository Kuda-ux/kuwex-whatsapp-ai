import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute('SELECT * FROM clients ORDER BY created_at DESC');

    // Map is_active from integer to boolean for frontend
    const data = result.rows.map((row) => ({
      ...row,
      is_active: row.is_active === 1,
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error('Clients GET error:', err);
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    if (!body.business_name || !body.whatsapp_phone_number_id || !body.whatsapp_access_token) {
      return NextResponse.json({ error: 'business_name, whatsapp_phone_number_id, and whatsapp_access_token are required' }, { status: 400 });
    }

    const id = crypto.randomUUID().replace(/-/g, '');

    await db.execute({
      sql: `INSERT INTO clients (id, business_name, whatsapp_phone_number_id, whatsapp_access_token,
              brand_tone, services_description, default_language, escalation_email, escalation_whatsapp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.business_name,
        body.whatsapp_phone_number_id,
        body.whatsapp_access_token,
        body.brand_tone || 'professional and friendly',
        body.services_description || null,
        body.default_language || 'en',
        body.escalation_email || null,
        body.escalation_whatsapp || null,
      ],
    });

    // Fetch the inserted row
    const result = await db.execute({ sql: 'SELECT * FROM clients WHERE id = ?', args: [id] });
    const row = result.rows[0];

    return NextResponse.json({ ...row, is_active: row.is_active === 1 }, { status: 201 });
  } catch (err) {
    console.error('Clients POST error:', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
