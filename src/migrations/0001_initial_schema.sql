-- Create audits table if it doesn't exist
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  auditor_id UUID REFERENCES auditors(id) ON DELETE SET NULL,
  custom_audit_id TEXT UNIQUE
);

-- Create index on custom_audit_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_audits_custom_audit_id ON audits(custom_audit_id);

-- Enable RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Add policies for audits table
CREATE POLICY "Enable read access for all users" ON audits FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON audits FOR INSERT TO authenticated_user WITH CHECK (true);
CREATE POLICY "Enable update for owners" ON audits FOR UPDATE USING (auth.uid() = (SELECT user_id FROM auditors WHERE id = auditor_id));
CREATE POLICY "Enable delete for owners" ON audits FOR DELETE USING (auth.uid() = (SELECT user_id FROM auditors WHERE id = auditor_id));
