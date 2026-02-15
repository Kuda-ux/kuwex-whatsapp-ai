import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = createServerClient();
  const { data, error } = await db
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const db = createServerClient();
  const body = await req.json();

  const { data, error } = await db.from('clients').insert({
    business_name: body.business_name,
    whatsapp_phone_number_id: body.whatsapp_phone_number_id,
    whatsapp_access_token: body.whatsapp_access_token,
    brand_tone: body.brand_tone || 'professional and friendly',
    services_description: body.services_description,
    default_language: body.default_language || 'en',
    escalation_email: body.escalation_email,
    escalation_whatsapp: body.escalation_whatsapp,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
