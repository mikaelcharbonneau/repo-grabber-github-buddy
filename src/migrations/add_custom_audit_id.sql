-- Add custom_audit_id column to audits table
ALTER TABLE audits 
ADD COLUMN IF NOT EXISTS custom_audit_id TEXT UNIQUE;
