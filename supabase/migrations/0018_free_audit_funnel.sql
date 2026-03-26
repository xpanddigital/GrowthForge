-- ============================================
-- MIGRATION 0018: FREE AUDIT SIGNUP FUNNEL
-- Adds prospect tracking, GHL CRM sync fields,
-- and free audit flagging for the conversion funnel.
-- ============================================

-- Users: track signup source and GHL CRM link
ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'direct';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Clients: flag auto-created prospect clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_by_signup BOOLEAN NOT NULL DEFAULT false;

-- Audits: flag free audits (vs standard dashboard-triggered)
ALTER TABLE audits ADD COLUMN IF NOT EXISTS is_free_audit BOOLEAN NOT NULL DEFAULT false;
