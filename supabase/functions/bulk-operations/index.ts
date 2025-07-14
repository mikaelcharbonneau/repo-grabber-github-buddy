import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkCabinetRequest {
  cabinet_ids: string[];
  status: boolean;
}

interface BulkIncidentRequest {
  incident_ids: string[];
  resolution_note?: string;
}

interface BulkAuditRequest {
  audit_ids: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const validateUUIDs = (ids: string[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  ids.forEach((id, index) => {
    if (!uuidRegex.test(id)) {
      errors.push(`Invalid UUID at index ${index}: ${id}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};

const bulkUpdateCabinets = async (cabinet_ids: string[], new_status: boolean) => {
  const { data, error } = await supabase.rpc('bulk_update_cabinet_status', {
    cabinet_ids,
    new_status
  });
  
  if (error) {
    throw new Error(`Bulk cabinet update failed: ${error.message}`);
  }
  
  return data;
};

const bulkCloseIncidents = async (incident_ids: string[], closed_by: string, resolution_note?: string) => {
  const { data, error } = await supabase.rpc('bulk_close_incidents', {
    incident_ids,
    closed_by,
    resolution_note: resolution_note || 'Bulk closure operation'
  });
  
  if (error) {
    throw new Error(`Bulk incident closure failed: ${error.message}`);
  }
  
  return data;
};

const bulkUpdateAudits = async (audit_ids: string[], status: string, assigned_to?: string) => {
  const updateData: any = { 
    status,
    updated_at: new Date().toISOString()
  };
  
  if (assigned_to) {
    updateData.assigned_to = assigned_to;
  }
  
  if (status === 'in_progress') {
    updateData.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }
  
  const results = [];
  const errors = [];
  
  for (const audit_id of audit_ids) {
    try {
      const { data, error } = await supabase
        .from('audits')
        .update(updateData)
        .eq('id', audit_id)
        .select('id, title, status');
      
      if (error) {
        errors.push({ audit_id, error: error.message });
      } else if (data && data.length > 0) {
        results.push(data[0]);
      } else {
        errors.push({ audit_id, error: 'Audit not found or no permission' });
      }
    } catch (err) {
      errors.push({ audit_id, error: err.message });
    }
  }
  
  return {
    updated_count: results.length,
    updated_audits: results,
    failed_operations: errors
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );
    
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        message: "Valid authentication required"
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const url = new URL(req.url);
    const operation = url.pathname.split('/').pop();

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: "Method Not Allowed",
        message: "Only POST requests are supported"
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    switch (operation) {
      case 'cabinets': {
        const body: BulkCabinetRequest = await req.json();
        
        if (!body.cabinet_ids || !Array.isArray(body.cabinet_ids)) {
          return new Response(JSON.stringify({
            error: "Bad Request",
            message: "cabinet_ids array is required"
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const validation = validateUUIDs(body.cabinet_ids);
        if (!validation.valid) {
          return new Response(JSON.stringify({
            error: "Bad Request",
            message: "Invalid UUIDs provided",
            errors: validation.errors
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const result = await bulkUpdateCabinets(body.cabinet_ids, body.status);
        
        return new Response(JSON.stringify({
          success: true,
          message: `Updated ${result[0].updated_count} cabinets`,
          data: result[0]
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'incidents': {
        const body: BulkIncidentRequest = await req.json();
        
        if (!body.incident_ids || !Array.isArray(body.incident_ids)) {
          return new Response(JSON.stringify({
            error: "Bad Request",
            message: "incident_ids array is required"
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const validation = validateUUIDs(body.incident_ids);
        if (!validation.valid) {
          return new Response(JSON.stringify({
            error: "Bad Request",
            message: "Invalid UUIDs provided",
            errors: validation.errors
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const result = await bulkCloseIncidents(
          body.incident_ids, 
          user.id, 
          body.resolution_note
        );
        
        return new Response(JSON.stringify({
          success: true,
          message: `Closed ${result[0].closed_count} incidents`,
          data: result[0]
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'audits': {
        const body: BulkAuditRequest = await req.json();
        
        if (!body.audit_ids || !Array.isArray(body.audit_ids)) {
          return new Response(JSON.stringify({
            error: "Bad Request",
            message: "audit_ids array is required"
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(body.status)) {
          return new Response(JSON.stringify({
            error: "Bad Request",
            message: "Invalid status. Must be one of: scheduled, in_progress, completed, cancelled"
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const validation = validateUUIDs(body.audit_ids);
        if (!validation.valid) {
          return new Response(JSON.stringify({
            error: "Bad Request",
            message: "Invalid UUIDs provided",
            errors: validation.errors
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const result = await bulkUpdateAudits(body.audit_ids, body.status, body.assigned_to);
        
        return new Response(JSON.stringify({
          success: true,
          message: `Updated ${result.updated_count} audits to ${body.status}`,
          data: result
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      default:
        return new Response(JSON.stringify({
          error: "Not Found",
          message: "Available operations: /cabinets, /incidents, /audits"
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

  } catch (error) {
    console.error('Error in bulk-operations function:', error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});