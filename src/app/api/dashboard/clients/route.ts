import { NextRequest, NextResponse } from 'next/server';
import { type InValue } from '@libsql/client';
import { getDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute('SELECT * FROM clients ORDER BY created_at DESC');

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

    const result = await db.execute({ sql: 'SELECT * FROM clients WHERE id = ?', args: [id] });
    const row = result.rows[0];

    return NextResponse.json({ ...row, is_active: row.is_active === 1 }, { status: 201 });
  } catch (err) {
    console.error('Clients POST error:', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Client id is required' }, { status: 400 });
    }

    const fields: string[] = [];
    const args: InValue[] = [];

    if (body.business_name !== undefined) { fields.push('business_name = ?'); args.push(body.business_name); }
    if (body.whatsapp_phone_number_id !== undefined) { fields.push('whatsapp_phone_number_id = ?'); args.push(body.whatsapp_phone_number_id); }
    if (body.whatsapp_access_token !== undefined) { fields.push('whatsapp_access_token = ?'); args.push(body.whatsapp_access_token); }
    if (body.brand_tone !== undefined) { fields.push('brand_tone = ?'); args.push(body.brand_tone); }
    if (body.services_description !== undefined) { fields.push('services_description = ?'); args.push(body.services_description); }
    if (body.default_language !== undefined) { fields.push('default_language = ?'); args.push(body.default_language); }
    if (body.escalation_email !== undefined) { fields.push('escalation_email = ?'); args.push(body.escalation_email); }
    if (body.escalation_whatsapp !== undefined) { fields.push('escalation_whatsapp = ?'); args.push(body.escalation_whatsapp); }
    if (body.is_active !== undefined) { fields.push('is_active = ?'); args.push(body.is_active ? 1 : 0); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    fields.push("updated_at = datetime('now')");
    args.push(body.id);

    await db.execute({
      sql: `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const result = await db.execute({ sql: 'SELECT * FROM clients WHERE id = ?', args: [body.id] });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({ ...row, is_active: row.is_active === 1 });
  } catch (err) {
    console.error('Clients PUT error:', err);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client id is required' }, { status: 400 });
    }

    const existing = await db.execute({ sql: 'SELECT id FROM clients WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await db.execute({ sql: 'DELETE FROM intent_logs WHERE client_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM escalations WHERE client_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM conversations WHERE client_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM customers WHERE client_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM clients WHERE id = ?', args: [id] });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Clients DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
