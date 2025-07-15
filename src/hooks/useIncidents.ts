import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Tables } from '@/integrations/supabase/types';

type Incident = Tables<'incidents'>;

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setIncidents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return { incidents, loading, error, refetch: fetchIncidents };
}