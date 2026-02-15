import { NextResponse } from 'next/server';
import { getDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    business_name TEXT NOT NULL,
    whatsapp_phone_number_id TEXT NOT NULL UNIQUE,
    whatsapp_access_token TEXT NOT NULL,
    brand_tone TEXT DEFAULT 'professional and friendly',
    services_description TEXT,
    default_language TEXT DEFAULT 'en',
    escalation_email TEXT,
    escalation_whatsapp TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    display_name TEXT,
    first_seen_at TEXT DEFAULT (datetime('now')),
    last_message_at TEXT DEFAULT (datetime('now')),
    is_escalated INTEGER DEFAULT 0,
    escalated_at TEXT,
    total_messages INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(client_id, phone_number)
);

CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    message_text TEXT NOT NULL,
    whatsapp_message_id TEXT,
    detected_intent TEXT,
    tokens_used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS escalations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    reason TEXT,
    trigger_message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved', 'expired')),
    assigned_to TEXT,
    resolved_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS intent_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    message_text TEXT,
    detected_intent TEXT,
    confidence REAL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clients_phone_number_id ON clients(whatsapp_phone_number_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_client ON customers(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(phone_number, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_intent ON conversations(detected_intent);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_client ON escalations(client_id);
CREATE INDEX IF NOT EXISTS idx_intent_logs_intent ON intent_logs(detected_intent);
CREATE INDEX IF NOT EXISTS idx_intent_logs_client ON intent_logs(client_id);
`;

export async function POST() {
  try {
    const db = getDb();

    // Execute each statement separately
    const statements = SCHEMA.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const stmt of statements) {
      await db.execute(stmt);
    }

    return NextResponse.json({ success: true, message: 'Database schema initialized successfully', tables: ['clients', 'customers', 'conversations', 'escalations', 'intent_logs'] });
  } catch (err) {
    console.error('DB init error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  // Also allow GET for easy browser access
  return POST();
}
