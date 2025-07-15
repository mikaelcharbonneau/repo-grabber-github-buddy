import { supabase } from '@/lib/supabaseClient';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Type aliases for better readability
type Audit = Tables<'audits'>;
type AuditInsert = TablesInsert<'audits'>;
type AuditUpdate = TablesUpdate<'audits'>;

type Incident = Tables<'incidents'>;
type IncidentInsert = TablesInsert<'incidents'>;
type IncidentUpdate = TablesUpdate<'incidents'>;

type Auditor = Tables<'auditors'>;

// Audit API functions
export const auditAPI = {
  // Get all audits
  getAll: async () => {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get audit by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new audit
  create: async (audit: AuditInsert) => {
    const { data, error } = await supabase
      .from('audits')
      .insert(audit)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update audit
  update: async (id: string, updates: AuditUpdate) => {
    const { data, error } = await supabase
      .from('audits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get audits by auditor
  getByAuditor: async (auditorId: string) => {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('auditor_id', auditorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Incident API functions
export const incidentAPI = {
  // Get all incidents
  getAll: async () => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get incident by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new incident
  create: async (incident: IncidentInsert) => {
    const { data, error } = await supabase
      .from('incidents')
      .insert(incident)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update incident
  update: async (id: string, updates: IncidentUpdate) => {
    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get incidents by audit
  getByAudit: async (auditId: string) => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get incidents by auditor
  getByAuditor: async (auditorId: string) => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('auditor_id', auditorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get incidents by status
  getByStatus: async (status: string) => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Auditor API functions
export const auditorAPI = {
  // Get current auditor profile
  getCurrent: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('auditors')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all auditors
  getAll: async () => {
    const { data, error } = await supabase
      .from('auditors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get auditor by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('auditors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Statistics API functions
export const statsAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const [auditsResult, incidentsResult] = await Promise.all([
      supabase.from('audits').select('status'),
      supabase.from('incidents').select('status')
    ]);

    if (auditsResult.error) throw auditsResult.error;
    if (incidentsResult.error) throw incidentsResult.error;

    const audits = auditsResult.data || [];
    const incidents = incidentsResult.data || [];

    const completedAudits = audits.filter(audit => 
      audit.status.toLowerCase() === 'completed'
    ).length;

    const activeIncidents = incidents.filter(incident => 
      ['open', 'in progress'].includes(incident.status.toLowerCase())
    ).length;

    const resolvedIncidents = incidents.filter(incident => 
      incident.status.toLowerCase() === 'resolved'
    ).length;

    return {
      completedAudits,
      activeIncidents,
      resolvedIncidents,
      reportsGenerated: 0 // Will be implemented when reports table is created
    };
  }
};