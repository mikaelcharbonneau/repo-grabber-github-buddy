-- Add custom_audit_id column to audits table
ALTER TABLE audits 
ADD COLUMN IF NOT EXISTS custom_audit_id TEXT UNIQUE;

-- Create an index on custom_audit_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_audits_custom_audit_id ON audits(custom_audit_id);

-- Add any other missing columns that might be needed
ALTER TABLE audits
ADD COLUMN IF NOT EXISTS datacenter_id UUID REFERENCES datacenters(id),
ADD COLUMN IF NOT EXISTS datahall_id UUID REFERENCES datahalls(id),
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;