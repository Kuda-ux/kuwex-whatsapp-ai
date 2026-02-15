-- ============================================
-- Kuwex WhatsApp AI Sales Automation
-- Supabase PostgreSQL Schema
-- Multi-tenant SaaS for African SMEs
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CLIENTS (One row per business customer)
-- ============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    whatsapp_phone_number_id VARCHAR(50) NOT NULL UNIQUE,
    whatsapp_access_token TEXT NOT NULL,
    brand_tone TEXT DEFAULT 'professional and friendly',
    services_description TEXT,
    default_language VARCHAR(10) DEFAULT 'en',
    escalation_email VARCHAR(255),
    escalation_whatsapp VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_phone_number_id ON clients(whatsapp_phone_number_id);

-- ============================================
-- 2. CUSTOMERS (End-users messaging via WhatsApp)
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    display_name VARCHAR(255),
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    is_escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMPTZ,
    total_messages INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, phone_number)
);

CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_client ON customers(client_id);
CREATE INDEX idx_customers_escalated ON customers(is_escalated) WHERE is_escalated = TRUE;

-- ============================================
-- 3. CONVERSATIONS (Full message history)
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    message_text TEXT NOT NULL,
    whatsapp_message_id VARCHAR(100),
    detected_intent VARCHAR(50),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_phone ON conversations(phone_number, created_at DESC);
CREATE INDEX idx_conversations_customer ON conversations(customer_id, created_at DESC);
CREATE INDEX idx_conversations_client ON conversations(client_id);
CREATE INDEX idx_conversations_intent ON conversations(detected_intent);

-- ============================================
-- 4. ESCALATIONS (Human handoff tracking)
-- ============================================
CREATE TABLE escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    reason TEXT,
    trigger_message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved', 'expired')),
    assigned_to VARCHAR(255),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escalations_status ON escalations(status) WHERE status = 'pending';
CREATE INDEX idx_escalations_client ON escalations(client_id);

-- ============================================
-- 5. INTENT LOGS (Analytics & optimization)
-- ============================================
CREATE TABLE intent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    message_text TEXT,
    detected_intent VARCHAR(50),
    confidence DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intent_logs_intent ON intent_logs(detected_intent);
CREATE INDEX idx_intent_logs_client ON intent_logs(client_id);

-- ============================================
-- 6. UPSERT CUSTOMER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION upsert_customer(
    p_client_id UUID,
    p_phone_number VARCHAR(20),
    p_display_name VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
BEGIN
    INSERT INTO customers (client_id, phone_number, display_name)
    VALUES (p_client_id, p_phone_number, p_display_name)
    ON CONFLICT (client_id, phone_number)
    DO UPDATE SET
        last_message_at = NOW(),
        total_messages = customers.total_messages + 1,
        display_name = COALESCE(EXCLUDED.display_name, customers.display_name),
        updated_at = NOW()
    RETURNING id INTO v_customer_id;

    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. AUTO-UPDATE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ANALYTICS VIEWS
-- ============================================
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    c.id AS client_id,
    c.business_name,
    (SELECT COUNT(*) FROM customers cu WHERE cu.client_id = c.id) AS total_customers,
    (SELECT COUNT(*) FROM conversations co WHERE co.client_id = c.id) AS total_messages,
    (SELECT COUNT(*) FROM conversations co WHERE co.client_id = c.id AND co.created_at > NOW() - INTERVAL '24 hours') AS messages_today,
    (SELECT COUNT(*) FROM escalations e WHERE e.client_id = c.id AND e.status = 'pending') AS pending_escalations,
    (SELECT COUNT(DISTINCT il.detected_intent) FROM intent_logs il WHERE il.client_id = c.id) AS unique_intents
FROM clients c
WHERE c.is_active = TRUE;

CREATE OR REPLACE VIEW v_intent_breakdown AS
SELECT
    client_id,
    detected_intent,
    COUNT(*) AS count,
    ROUND(AVG(confidence), 2) AS avg_confidence,
    DATE_TRUNC('day', created_at) AS day
FROM intent_logs
GROUP BY client_id, detected_intent, DATE_TRUNC('day', created_at)
ORDER BY day DESC, count DESC;

-- ============================================
-- 9. ROW LEVEL SECURITY (Supabase)
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API routes)
CREATE POLICY "Service role full access" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON escalations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON intent_logs FOR ALL USING (true) WITH CHECK (true);
