-- Create datacenters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.datacenters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create datahalls table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.datahalls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  datacenter_id UUID REFERENCES public.datacenters(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create auditors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auditors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing foreign key constraints that might be causing issues
ALTER TABLE public.audits 
  DROP CONSTRAINT IF EXISTS audits_datacenter_id_fkey,
  DROP CONSTRAINT IF EXISTS audits_datahall_id_fkey,
  DROP CONSTRAINT IF EXISTS audits_auditor_id_fkey;

-- Re-add foreign key constraints with proper ON DELETE behavior
ALTER TABLE public.audits
  ADD CONSTRAINT audits_datacenter_id_fkey 
    FOREIGN KEY (datacenter_id) REFERENCES public.datacenters(id) 
    ON DELETE SET NULL,
  ADD CONSTRAINT audits_datahall_id_fkey 
    FOREIGN KEY (datahall_id) REFERENCES public.datahalls(id) 
    ON DELETE SET NULL,
  ADD CONSTRAINT audits_auditor_id_fkey 
    FOREIGN KEY (auditor_id) REFERENCES public.auditors(id) 
    ON DELETE SET NULL;
