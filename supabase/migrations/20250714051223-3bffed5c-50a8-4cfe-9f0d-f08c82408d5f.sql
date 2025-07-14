-- Populate datacenters with real sample data
INSERT INTO public.datacenters (id, name, location, address, timezone, is_active) VALUES
('dc-houston-01', 'Houston Primary DC', 'Houston, TX', '12345 Technology Blvd, Houston, TX 77002', 'America/Chicago', true),
('dc-atlanta-01', 'Atlanta Secondary DC', 'Atlanta, GA', '5678 Data Center Dr, Atlanta, GA 30309', 'America/New_York', true),
('dc-denver-01', 'Denver Edge DC', 'Denver, CO', '9012 Mountain View Rd, Denver, CO 80202', 'America/Denver', true),
('dc-seattle-01', 'Seattle Cloud DC', 'Seattle, WA', '3456 Pacific Ave, Seattle, WA 98101', 'America/Los_Angeles', true),
('dc-chicago-01', 'Chicago Regional DC', 'Chicago, IL', '7890 Lakefront Dr, Chicago, IL 60601', 'America/Chicago', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  address = EXCLUDED.address,
  timezone = EXCLUDED.timezone,
  updated_at = now();

-- Populate data halls for each datacenter
INSERT INTO public.data_halls (id, name, datacenter_id, floor, capacity, current_usage, is_active) VALUES
-- Houston Primary DC
('hall-houston-a', 'Hall A - Critical Systems', 'dc-houston-01', 1, 200, 180, true),
('hall-houston-b', 'Hall B - Compute Cluster', 'dc-houston-01', 1, 150, 120, true),
('hall-houston-c', 'Hall C - Storage Arrays', 'dc-houston-01', 2, 100, 85, true),

-- Atlanta Secondary DC  
('hall-atlanta-a', 'Hall A - Backup Systems', 'dc-atlanta-01', 1, 120, 95, true),
('hall-atlanta-b', 'Hall B - DR Environment', 'dc-atlanta-01', 2, 80, 60, true),

-- Denver Edge DC
('hall-denver-a', 'Hall A - Edge Computing', 'dc-denver-01', 1, 60, 45, true),
('hall-denver-b', 'Hall B - Network Hub', 'dc-denver-01', 1, 40, 30, true),

-- Seattle Cloud DC
('hall-seattle-a', 'Hall A - Cloud Infrastructure', 'dc-seattle-01', 1, 180, 160, true),
('hall-seattle-b', 'Hall B - AI/ML Cluster', 'dc-seattle-01', 2, 120, 100, true),

-- Chicago Regional DC
('hall-chicago-a', 'Hall A - Regional Services', 'dc-chicago-01', 1, 90, 75, true),
('hall-chicago-b', 'Hall B - Backup Systems', 'dc-chicago-01', 1, 70, 55, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  datacenter_id = EXCLUDED.datacenter_id,
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  current_usage = EXCLUDED.current_usage,
  updated_at = now();

-- Populate cabinets/racks for each data hall
INSERT INTO public.cabinets (id, name, data_hall_id, row_position, column_position, capacity, current_usage, power_capacity, current_power_usage, is_active) VALUES
-- Houston Hall A - Critical Systems
('cab-hou-a-r01-01', 'A-R01-C01', 'hall-houston-a', 'R01', 1, 42, 38, 10000, 8500, true),
('cab-hou-a-r01-02', 'A-R01-C02', 'hall-houston-a', 'R01', 2, 42, 40, 10000, 9200, true),
('cab-hou-a-r01-03', 'A-R01-C03', 'hall-houston-a', 'R01', 3, 42, 36, 10000, 7800, true),
('cab-hou-a-r02-01', 'A-R02-C01', 'hall-houston-a', 'R02', 1, 42, 42, 10000, 9800, true),
('cab-hou-a-r02-02', 'A-R02-C02', 'hall-houston-a', 'R02', 2, 42, 39, 10000, 8900, true),

-- Houston Hall B - Compute Cluster
('cab-hou-b-r01-01', 'B-R01-C01', 'hall-houston-b', 'R01', 1, 42, 35, 12000, 9500, true),
('cab-hou-b-r01-02', 'B-R01-C02', 'hall-houston-b', 'R01', 2, 42, 38, 12000, 10200, true),
('cab-hou-b-r02-01', 'B-R02-C01', 'hall-houston-b', 'R02', 1, 42, 40, 12000, 11000, true),

-- Atlanta Hall A - Backup Systems  
('cab-atl-a-r01-01', 'A-R01-C01', 'hall-atlanta-a', 'R01', 1, 42, 32, 8000, 6400, true),
('cab-atl-a-r01-02', 'A-R01-C02', 'hall-atlanta-a', 'R01', 2, 42, 30, 8000, 6000, true),
('cab-atl-a-r02-01', 'A-R02-C01', 'hall-atlanta-a', 'R02', 1, 42, 35, 8000, 7000, true),

-- Denver Hall A - Edge Computing
('cab-den-a-r01-01', 'A-R01-C01', 'hall-denver-a', 'R01', 1, 42, 25, 6000, 4500, true),
('cab-den-a-r01-02', 'A-R01-C02', 'hall-denver-a', 'R01', 2, 42, 28, 6000, 4800, true),

-- Seattle Hall A - Cloud Infrastructure
('cab-sea-a-r01-01', 'A-R01-C01', 'hall-seattle-a', 'R01', 1, 42, 41, 15000, 13500, true),
('cab-sea-a-r01-02', 'A-R01-C02', 'hall-seattle-a', 'R01', 2, 42, 39, 15000, 12800, true),
('cab-sea-a-r02-01', 'A-R02-C01', 'hall-seattle-a', 'R02', 1, 42, 40, 15000, 13200, true),

-- Chicago Hall A - Regional Services
('cab-chi-a-r01-01', 'A-R01-C01', 'hall-chicago-a', 'R01', 1, 42, 30, 8000, 6500, true),
('cab-chi-a-r01-02', 'A-R01-C02', 'hall-chicago-a', 'R01', 2, 42, 32, 8000, 7000, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  data_hall_id = EXCLUDED.data_hall_id,
  row_position = EXCLUDED.row_position,
  column_position = EXCLUDED.column_position,
  capacity = EXCLUDED.capacity,
  current_usage = EXCLUDED.current_usage,
  power_capacity = EXCLUDED.power_capacity,
  current_power_usage = EXCLUDED.current_power_usage,
  updated_at = now();

-- Verify the relationships are working by checking foreign keys
-- This query will help verify our data integrity
-- (This is just a verification query, it doesn't insert data)
SELECT 
  dc.name as datacenter_name,
  dh.name as data_hall_name,
  c.name as cabinet_name,
  c.current_usage,
  c.capacity,
  ROUND((c.current_usage::decimal / c.capacity * 100), 1) as utilization_percent
FROM public.datacenters dc
LEFT JOIN public.data_halls dh ON dc.id = dh.datacenter_id
LEFT JOIN public.cabinets c ON dh.id = c.data_hall_id
WHERE dc.is_active = true
ORDER BY dc.name, dh.name, c.name
LIMIT 5;