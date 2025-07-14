-- Migrate mock location data to real database with proper UUIDs
-- Insert sample datacenters with generated UUIDs
INSERT INTO public.datacenters (name, location, address, timezone, is_active) VALUES
('Quebec Data Center', 'Quebec, Canada', '123 Tech Boulevard, Quebec City, QC, Canada', 'America/Toronto', true),
('Dallas Data Center', 'Dallas, United States', '456 Innovation Drive, Dallas, TX, USA', 'America/Chicago', true),
('Houston Data Center', 'Houston, United States', '789 Enterprise Way, Houston, TX, USA', 'America/Chicago', true),
('Enebakk Data Center', 'Enebakk, Norway', '321 Nordic Street, Enebakk, Norway', 'Europe/Oslo', true),
('Rjukan Data Center', 'Rjukan, Norway', '654 Mountain View, Rjukan, Norway', 'Europe/Oslo', true);

-- Store datacenter IDs for reference
CREATE TEMP TABLE datacenter_refs AS
SELECT id, name, 
  CASE 
    WHEN name = 'Quebec Data Center' THEN 'quebec-canada'
    WHEN name = 'Dallas Data Center' THEN 'dallas-usa'
    WHEN name = 'Houston Data Center' THEN 'houston-usa'
    WHEN name = 'Enebakk Data Center' THEN 'enebakk-norway'
    WHEN name = 'Rjukan Data Center' THEN 'rjukan-norway'
  END as ref_key
FROM public.datacenters 
WHERE name IN ('Quebec Data Center', 'Dallas Data Center', 'Houston Data Center', 'Enebakk Data Center', 'Rjukan Data Center');

-- Insert data halls using proper foreign key references
INSERT INTO public.data_halls (datacenter_id, name, floor, capacity, current_usage, is_active)
SELECT dr.id, dh.name, dh.floor, dh.capacity, dh.current_usage, dh.is_active
FROM datacenter_refs dr
CROSS JOIN (VALUES
  ('quebec-canada', 'Island 1', 1, 100, 25, true),
  ('quebec-canada', 'Island 8', 1, 100, 30, true),
  ('quebec-canada', 'Island 9', 1, 100, 15, true),
  ('quebec-canada', 'Island 10', 2, 100, 45, true),
  ('quebec-canada', 'Island 11', 2, 100, 20, true),
  ('quebec-canada', 'Island 12', 2, 100, 35, true),
  ('quebec-canada', 'Green Nitrogen', 3, 80, 40, true),
  ('dallas-usa', 'Island 1', 1, 120, 60, true),
  ('dallas-usa', 'Island 2', 1, 120, 45, true),
  ('dallas-usa', 'Island 3', 2, 120, 30, true),
  ('dallas-usa', 'Island 4', 2, 120, 55, true),
  ('houston-usa', 'H20 Lab', 1, 50, 25, true),
  ('enebakk-norway', 'Island 1', 1, 80, 35, true),
  ('rjukan-norway', 'Island 1', 1, 60, 20, true)
) AS dh(datacenter_ref, name, floor, capacity, current_usage, is_active)
WHERE dr.ref_key = dh.datacenter_ref;

-- Function to generate cabinet data for data halls
DO $$
DECLARE
  hall_record RECORD;
  i INTEGER;
  cabinet_name TEXT;
BEGIN
  FOR hall_record IN 
    SELECT id, name FROM public.data_halls 
    WHERE created_at >= CURRENT_DATE
  LOOP
    FOR i IN 1..5 LOOP
      cabinet_name := 'Cabinet-' || LPAD(i::TEXT, 3, '0');
      
      INSERT INTO public.cabinets (
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
        hall_record.id,
        cabinet_name,
        CASE WHEN i <= 2 THEN 'A' ELSE 'B' END,
        ((i - 1) % 3) + 1,
        42, -- Standard rack units
        FLOOR(RANDOM() * 30) + 5, -- Random usage between 5-35
        10000, -- 10kW capacity
        FLOOR(RANDOM() * 6000) + 1000, -- Random power usage 1-7kW
        true
      );
    END LOOP;
  END LOOP;
END
$$;

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