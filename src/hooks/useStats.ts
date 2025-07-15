import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Stats {
  completedAudits: number;
  activeIncidents: number;
  resolvedIncidents: number;
  reportsGenerated: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    completedAudits: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    reportsGenerated: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all audits to count completed ones
      const { data: audits, error: auditsError } = await supabase
        .from('audits')
        .select('status');
      
      if (auditsError) throw auditsError;

      // Fetch all incidents to count active and resolved
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('status');
      
      if (incidentsError) throw incidentsError;

      // Calculate stats
      const completedAudits = audits?.filter(audit => 
        audit.status.toLowerCase() === 'completed'
      ).length || 0;

      const activeIncidents = incidents?.filter(incident => 
        ['open', 'in progress'].includes(incident.status.toLowerCase())
      ).length || 0;

      const resolvedIncidents = incidents?.filter(incident => 
        incident.status.toLowerCase() === 'resolved'
      ).length || 0;

      // Reports: We don't have a reports table yet, so keep as 0
      const reportsGenerated = 0;

      setStats({
        completedAudits,
        activeIncidents,
        resolvedIncidents,
        reportsGenerated
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
