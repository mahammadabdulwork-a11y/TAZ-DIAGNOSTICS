-- TAZ COMPANY / TAZ DIAGNOSTIC
-- Migration: 002_whatsapp_reminders.sql
-- Live Monthly WhatsApp Retest Reminder System Schema

-- 1. Patient WhatsApp Consent Tracking
CREATE TABLE IF NOT EXISTS whatsapp_consents (
  id BIGSERIAL PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opt_out_timestamp TIMESTAMPTZ,
  channel VARCHAR(30) NOT NULL DEFAULT 'WhatsApp',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WhatsApp Scheduled Retest Reminders
CREATE TABLE IF NOT EXISTS whatsapp_reminders (
  id VARCHAR(60) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  patient_name VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  previous_report_id VARCHAR(60) NOT NULL,
  previous_test_date DATE NOT NULL,
  next_reminder_date DATE NOT NULL,
  test_list TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, DUE TODAY, SENT, DELIVERED, READ, FAILED, OPTED OUT, PAUSED
  opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  cycle_month VARCHAR(20), -- e.g. 2026-10 (prevents duplicate sending in the same month)
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  whatsapp_message_id VARCHAR(120),
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. WhatsApp Message History & Webhook Event Logs
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id BIGSERIAL PRIMARY KEY,
  reminder_id VARCHAR(60) REFERENCES whatsapp_reminders(id) ON DELETE SET NULL,
  patient_id VARCHAR(50),
  phone VARCHAR(40) NOT NULL,
  direction VARCHAR(20) NOT NULL DEFAULT 'OUTBOUND', -- OUTBOUND, INBOUND
  template_name VARCHAR(120),
  message_body TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'SENT', -- SENT, DELIVERED, READ, FAILED, RECEIVED
  whatsapp_message_id VARCHAR(120),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. WhatsApp Configuration & Meta Cloud API Credentials
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id SERIAL PRIMARY KEY,
  phone_number_id VARCHAR(120),
  business_account_id VARCHAR(120),
  access_token TEXT,
  template_name VARCHAR(120) DEFAULT 'taz_monthly_retest_reminder',
  template_language VARCHAR(20) DEFAULT 'en',
  webhook_verify_token VARCHAR(120) DEFAULT 'taz_diagnostic_webhook_secure_token',
  test_mode BOOLEAN NOT NULL DEFAULT TRUE,
  daily_cron_time VARCHAR(30) DEFAULT '0 9 * * *',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_date_status ON whatsapp_reminders(next_reminder_date, status);
CREATE INDEX IF NOT EXISTS idx_reminders_patient ON whatsapp_reminders(patient_id);
