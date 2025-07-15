import { supabase } from "@/lib/supabaseClient";

export interface Cabinet {
  id: string;
  name: string;
}

export interface DataHall {
  id: string;
  name: string;
  cabinets: Cabinet[];
}

export interface Datacenter {
  id: string;
  name: string;
  dataHalls: DataHall[];
}

// Fetch all datacenters
export async function fetchDatacenters() {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name')
    .eq('type', 'datacenter');
  if (error) throw error;
  return data;
}

// Fetch data halls for a given datacenter id
export async function fetchDataHalls(datacenterId: string) {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name')
    .eq('type', 'datahall')
    .eq('parent_id', datacenterId);
  if (error) throw error;
  return data;
}

// Fetch cabinets for a given data hall id
export async function fetchCabinets(dataHallId: string) {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name')
    .eq('type', 'cabinet')
    .eq('parent_id', dataHallId);
  if (error) throw error;
  return data;
}