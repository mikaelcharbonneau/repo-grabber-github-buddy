-- Migrate mock location data to real database
-- Insert sample datacenters
INSERT INTO public.datacenters (id, name, location, address, timezone, is_active) VALUES
('quebec-canada', 'Quebec Data Center', 'Quebec, Canada', '123 Tech Boulevard, Quebec City, QC, Canada', 'America/Toronto', true),
('dallas-usa', 'Dallas Data Center', 'Dallas, United States', '456 Innovation Drive, Dallas, TX, USA', 'America/Chicago', true),
('houston-usa', 'Houston Data Center', 'Houston, United States', '789 Enterprise Way, Houston, TX, USA', 'America/Chicago', true),
('enebakk-norway', 'Enebakk Data Center', 'Enebakk, Norway', '321 Nordic Street, Enebakk, Norway', 'Europe/Oslo', true),
('rjukan-norway', 'Rjukan Data Center', 'Rjukan, Norway', '654 Mountain View, Rjukan, Norway', 'Europe/Oslo', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  address = EXCLUDED.address,
  timezone = EXCLUDED.timezone,
  is_active = EXCLUDED.is_active;

-- Insert data halls for Quebec
INSERT INTO public.data_halls (id, datacenter_id, name, floor, capacity, current_usage, is_active) VALUES
('island-1-quebec', 'quebec-canada', 'Island 1', 1, 100, 25, true),
('island-8-quebec', 'quebec-canada', 'Island 8', 1, 100, 30, true),
('island-9-quebec', 'quebec-canada', 'Island 9', 1, 100, 15, true),
('island-10-quebec', 'quebec-canada', 'Island 10', 2, 100, 45, true),
('island-11-quebec', 'quebec-canada', 'Island 11', 2, 100, 20, true),
('island-12-quebec', 'quebec-canada', 'Island 12', 2, 100, 35, true),
('green-nitrogen-quebec', 'quebec-canada', 'Green Nitrogen', 3, 80, 40, true),

-- Insert data halls for Dallas
('island-1-dallas', 'dallas-usa', 'Island 1', 1, 120, 60, true),
('island-2-dallas', 'dallas-usa', 'Island 2', 1, 120, 45, true),
('island-3-dallas', 'dallas-usa', 'Island 3', 2, 120, 30, true),
('island-4-dallas', 'dallas-usa', 'Island 4', 2, 120, 55, true),

-- Insert data halls for Houston
('h20-lab-houston', 'houston-usa', 'H20 Lab', 1, 50, 25, true),

-- Insert data halls for Enebakk
('island-1-enebakk', 'enebakk-norway', 'Island 1', 1, 80, 35, true),

-- Insert data halls for Rjukan
('island-1-rjukan', 'rjukan-norway', 'Island 1', 1, 60, 20, true)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  current_usage = EXCLUDED.current_usage,
  is_active = EXCLUDED.is_active;

-- Function to generate cabinet data for a data hall
CREATE OR REPLACE FUNCTION generate_cabinets_for_hall(hall_id TEXT, hall_name TEXT, cabinet_count INTEGER DEFAULT 5)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
  cabinet_name TEXT;
  cabinet_id TEXT;
BEGIN
  FOR i IN 1..cabinet_count LOOP
    cabinet_name := 'Cabinet-' || LPAD(i::TEXT, 3, '0');
    cabinet_id := hall_id || '-c' || LPAD(i::TEXT, 3, '0');
    
    INSERT INTO public.cabinets (
      id, 
      data_hall_id, 
      name, 
      row_position, 
      column_position, 
      capacity, 
      current_usage, 
      power_capacity, 
      current_power_usage, 
      is_active
    ) VALUES (
      cabinet_id,
      hall_id,
      cabinet_name,
      CASE WHEN i <= (cabinet_count/2) THEN 'A' ELSE 'B' END,
      ((i - 1) % (cabinet_count/2)) + 1,
      42, -- Standard rack units
      FLOOR(RANDOM() * 30) + 5, -- Random usage between 5-35
      10000, -- 10kW capacity
      FLOOR(RANDOM() * 6000) + 1000, -- Random power usage 1-7kW
      true
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      row_position = EXCLUDED.row_position,
      column_position = EXCLUDED.column_position,
      capacity = EXCLUDED.capacity,
      current_usage = EXCLUDED.current_usage,
      power_capacity = EXCLUDED.power_capacity,
      current_power_usage = EXCLUDED.current_power_usage,
      is_active = EXCLUDED.is_active;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate cabinets for all data halls
SELECT generate_cabinets_for_hall('island-1-quebec', 'Island 1', 5);
SELECT generate_cabinets_for_hall('island-8-quebec', 'Island 8', 5);
SELECT generate_cabinets_for_hall('island-9-quebec', 'Island 9', 5);
SELECT generate_cabinets_for_hall('island-10-quebec', 'Island 10', 5);
SELECT generate_cabinets_for_hall('island-11-quebec', 'Island 11', 5);
SELECT generate_cabinets_for_hall('island-12-quebec', 'Island 12', 5);
SELECT generate_cabinets_for_hall('green-nitrogen-quebec', 'Green Nitrogen', 5);

SELECT generate_cabinets_for_hall('island-1-dallas', 'Island 1', 5);
SELECT generate_cabinets_for_hall('island-2-dallas', 'Island 2', 5);
SELECT generate_cabinets_for_hall('island-3-dallas', 'Island 3', 5);
SELECT generate_cabinets_for_hall('island-4-dallas', 'Island 4', 5);

SELECT generate_cabinets_for_hall('h20-lab-houston', 'H20 Lab', 5);
SELECT generate_cabinets_for_hall('island-1-enebakk', 'Island 1', 5);
SELECT generate_cabinets_for_hall('island-1-rjukan', 'Island 1', 5);

-- Clean up the temporary function
DROP FUNCTION generate_cabinets_for_hall(TEXT, TEXT, INTEGER);

-- Create data import/export functions
CREATE OR REPLACE FUNCTION public.export_location_data()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'datacenters', (
      SELECT json_agg(
        json_build_object(
          'id', d.id,
          'name', d.name,
          'location', d.location,
          'address', d.address,
          'timezone', d.timezone,
          'is_active', d.is_active,
          'data_halls', (
            SELECT json_agg(
              json_build_object(
                'id', dh.id,
                'name', dh.name,
                'floor', dh.floor,
                'capacity', dh.capacity,
                'current_usage', dh.current_usage,
                'is_active', dh.is_active,
                'cabinets', (
                  SELECT json_agg(
                    json_build_object(
                      'id', c.id,
                      'name', c.name,
                      'row_position', c.row_position,
                      'column_position', c.column_position,
                      'capacity', c.capacity,
                      'current_usage', c.current_usage,
                      'power_capacity', c.power_capacity,
                      'current_power_usage', c.current_power_usage,
                      'is_active', c.is_active
                    )
                  )
                  FROM public.cabinets c
                  WHERE c.data_hall_id = dh.id
                  AND c.is_active = true
                )
              )
            )
            FROM public.data_halls dh
            WHERE dh.datacenter_id = d.id
            AND dh.is_active = true
          )
        )
      )
      FROM public.datacenters d
      WHERE d.is_active = true
    ),
    'exported_at', NOW(),
    'version', '1.0'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create bulk operations function for managing large datasets
CREATE OR REPLACE FUNCTION public.bulk_update_cabinet_status(
  cabinet_ids UUID[],
  new_status BOOLEAN
)
RETURNS TABLE(updated_count INTEGER, failed_ids UUID[]) AS $$
DECLARE
  update_count INTEGER;
  failed_list UUID[] := '{}';
  cabinet_id UUID;
BEGIN
  update_count := 0;
  
  FOREACH cabinet_id IN ARRAY cabinet_ids
  LOOP
    BEGIN
      UPDATE public.cabinets 
      SET is_active = new_status, updated_at = NOW()
      WHERE id = cabinet_id;
      
      IF FOUND THEN
        update_count := update_count + 1;
      ELSE
        failed_list := array_append(failed_list, cabinet_id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      failed_list := array_append(failed_list, cabinet_id);
    END;
  END LOOP;
  
  RETURN QUERY SELECT update_count, failed_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for bulk incident management
CREATE OR REPLACE FUNCTION public.bulk_close_incidents(
  incident_ids UUID[],
  closed_by UUID,
  resolution_note TEXT DEFAULT 'Bulk closure'
)
RETURNS TABLE(closed_count INTEGER, failed_ids UUID[]) AS $$
DECLARE
  close_count INTEGER;
  failed_list UUID[] := '{}';
  incident_id UUID;
BEGIN
  close_count := 0;
  
  FOREACH incident_id IN ARRAY incident_ids
  LOOP
    BEGIN
      UPDATE public.incidents 
      SET 
        status = 'closed',
        resolved_at = NOW(),
        updated_at = NOW(),
        recommendation = COALESCE(recommendation, resolution_note)
      WHERE id = incident_id AND status != 'closed';
      
      IF FOUND THEN
        close_count := close_count + 1;
      ELSE
        failed_list := array_append(failed_list, incident_id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      failed_list := array_append(failed_list, incident_id);
    END;
  END LOOP;
  
  RETURN QUERY SELECT close_count, failed_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;