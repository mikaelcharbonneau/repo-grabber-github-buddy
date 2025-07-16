import supabase from "@/lib/supabaseClient";

export async function fetchDatacenters() {
  const { data, error } = await supabase.from('datacenters').select('*').order('name');
  if (error) {
    console.error('Error fetching datacenters:', error);
    return [];
  }
  return data;
}

export async function fetchDataHalls(datacenterId: string) {
  const { data, error } = await supabase.from('datahalls').select('*').eq('datacenter_id', datacenterId).order('name');
  if (error) {
    console.error('Error fetching datahalls:', error);
    return [];
  }
  return data;
}

export async function fetchCabinets(datahallId: string) {
  const { data, error } = await supabase.from('tile_locations').select('*').eq('datahall_id', datahallId).order('name');
  if (error) {
    console.error('Error fetching cabinets:', error);
    return [];
  }
  return data;
}