-- Create datacenters table
CREATE TABLE IF NOT EXISTS datacenters (
  id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create datahalls table
CREATE TABLE IF NOT EXISTS datahalls (
  id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
  name text NOT NULL,
  datacenter_id uuid REFERENCES datacenters(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (name, datacenter_id)
);

-- Create tile_locations table
CREATE TABLE IF NOT EXISTS tile_locations (
  id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
  name text NOT NULL,
  datahall_id uuid REFERENCES datahalls(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (name, datahall_id)
);

-- Enable RLS
ALTER TABLE datacenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE datahalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tile_locations ENABLE ROW LEVEL SECURITY;

-- Policies for read access (adjust as needed)
CREATE POLICY "Enable read for all" ON datacenters FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON datahalls FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON tile_locations FOR SELECT USING (true); 