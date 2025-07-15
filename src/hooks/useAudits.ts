import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Tables } from '@/integrations/supabase/types';

type Audit = Tables<'audits'>;

export function useAudits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAudits(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  return { audits, loading, error, refetch: fetchAudits };
}