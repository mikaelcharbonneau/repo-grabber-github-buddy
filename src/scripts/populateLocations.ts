import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function populate() {
  const csvPath = path.join(__dirname, '../data/dc_locations.csv');
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n').slice(1).filter(line => line.trim());
  const data = lines.map(line => {
    const [datacenter, datahall, cabinet] = line.split(',');
    return { datacenter: datacenter.trim(), datahall: datahall.trim(), cabinet: cabinet.trim() };
  });

  // Unique datacenters
  const uniqueDCs = [...new Set(data.map(d => d.datacenter))];
  const { data: dcs, error: dcError } = await supabase
    .from('datacenters')
    .upsert(uniqueDCs.map(name => ({ name })), { onConflict: 'name' })
    .select();
  if (dcError) throw dcError;

  const dcMap = new Map<string, string>(dcs.map(dc => [dc.name, dc.id]));

  // Unique datahalls
  const uniqueDHs = new Map<string, {name: string, datacenter_id: string}>();
  data.forEach(d => {
    const key = `${d.datacenter}|${d.datahall}`;
    if (!uniqueDHs.has(key)) {
      uniqueDHs.set(key, { name: d.datahall, datacenter_id: dcMap.get(d.datacenter)! });
    }
  });

  const { data: dhs, error: dhError } = await supabase
    .from('datahalls')
    .upsert(Array.from(uniqueDHs.values()), { onConflict: '(name, datacenter_id)' })
    .select();
  if (dhError) throw dhError;

  const dhMap = new Map<string, string>();
  dhs.forEach(dh => {
    dhMap.set(`${dh.datacenter_id}|${dh.name}`, dh.id);
  });

  // Tile locations
  const tls = data.map(d => ({
    name: d.cabinet,
    datahall_id: dhMap.get(`${dcMap.get(d.datacenter)}|${d.datahall}`)!
  }));

  const { error: tlError } = await supabase
    .from('tile_locations')
    .upsert(tls, { onConflict: '(name, datahall_id)' });
  if (tlError) throw tlError;

  console.log('Population completed successfully');
}

populate().catch(error => {
  console.error('Error populating data:', error);
  process.exit(1);
}); 