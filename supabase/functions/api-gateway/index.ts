import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Validation schemas
const schemas = {
  datacenter: {
    required: ['name', 'location'],
    optional: ['address', 'timezone'],
    validate: (data: any) => {
      if (!data.name || typeof data.name !== 'string' || data.name.length < 2) {
        return { valid: false, error: 'Name must be a string with at least 2 characters' };
      }
      if (!data.location || typeof data.location !== 'string' || data.location.length < 2) {
        return { valid: false, error: 'Location must be a string with at least 2 characters' };
      }
      return { valid: true };
    }
  },
  audit: {
    required: ['title', 'datacenter_id'],
    optional: ['description', 'audit_type', 'priority', 'scheduled_date', 'data_hall_id', 'cabinet_id'],
    validate: (data: any) => {
      if (!data.title || typeof data.title !== 'string' || data.title.length < 3) {
        return { valid: false, error: 'Title must be a string with at least 3 characters' };
      }
      if (!data.datacenter_id || typeof data.datacenter_id !== 'string') {
        return { valid: false, error: 'datacenter_id is required and must be a string' };
      }
      if (data.audit_type && !['routine', 'compliance', 'incident_followup', 'security', 'maintenance'].includes(data.audit_type)) {
        return { valid: false, error: 'audit_type must be one of: routine, compliance, incident_followup, security, maintenance' };
      }
      if (data.priority && !['low', 'normal', 'high', 'critical'].includes(data.priority)) {
        return { valid: false, error: 'priority must be one of: low, normal, high, critical' };
      }
      return { valid: true };
    }
  },
  incident: {
    required: ['title', 'description', 'datacenter_id', 'data_hall_id', 'cabinet_id', 'device_type', 'issue_type', 'severity'],
    optional: ['priority', 'unit_identifier', 'recommendation'],
    validate: (data: any) => {
      const required = ['title', 'description', 'datacenter_id', 'data_hall_id', 'cabinet_id', 'device_type', 'issue_type', 'severity'];
      for (const field of required) {
        if (!data[field] || typeof data[field] !== 'string') {
          return { valid: false, error: `${field} is required and must be a string` };
        }
      }
      if (!['low', 'medium', 'high', 'critical'].includes(data.severity)) {
        return { valid: false, error: 'severity must be one of: low, medium, high, critical' };
      }
      return { valid: true };
    }
  }
};

const validateData = (data: any, schema: any) => {
  // Check required fields
  for (const field of schema.required) {
    if (!(field in data)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  // Run custom validation
  return schema.validate(data);
};

const handleCRUD = async (
  table: string, 
  method: string, 
  id?: string, 
  data?: any, 
  userId?: string
) => {
  switch (method) {
    case 'GET':
      if (id) {
        const { data: result, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            return { data: null, error: { message: 'Record not found', status: 404 } };
          }
          return { data: null, error: { message: error.message, status: 400 } };
        }
        
        return { data: result, error: null };
      } else {
        const { data: result, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) {
          return { data: null, error: { message: error.message, status: 400 } };
        }
        
        return { data: result, error: null };
      }

    case 'POST':
      // Add created_by for certain tables
      const insertData = table === 'audits' && userId 
        ? { ...data, created_by: userId }
        : data;
      
      const { data: created, error: createError } = await supabase
        .from(table)
        .insert(insertData)
        .select()
        .single();
      
      if (createError) {
        return { data: null, error: { message: createError.message, status: 400 } };
      }
      
      return { data: created, error: null };

    case 'PUT':
      if (!id) {
        return { data: null, error: { message: 'ID is required for updates', status: 400 } };
      }
      
      const { data: updated, error: updateError } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        return { data: null, error: { message: updateError.message, status: 400 } };
      }
      
      return { data: updated, error: null };

    case 'DELETE':
      if (!id) {
        return { data: null, error: { message: 'ID is required for deletion', status: 400 } };
      }
      
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        return { data: null, error: { message: deleteError.message, status: 400 } };
      }
      
      return { data: { message: 'Record deleted successfully' }, error: null };

    default:
      return { data: null, error: { message: 'Method not allowed', status: 405 } };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user ID from auth header
    let user = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const { data: userData, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      user = userData?.user;
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // Expected format: /api-gateway/v1/{resource}/{id?}
    if (pathParts.length < 2 || pathParts[0] !== 'v1') {
      return new Response(JSON.stringify({
        error: "Bad Request",
        message: "Expected format: /v1/{resource}/{id?}"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const resource = pathParts[1];
    const id = pathParts[2];

    // Check if resource is supported
    const supportedResources = ['datacenters', 'data_halls', 'cabinets', 'audits', 'incidents', 'audit_issues'];
    if (!supportedResources.includes(resource)) {
      return new Response(JSON.stringify({
        error: "Not Found",
        message: `Resource '${resource}' not found. Supported resources: ${supportedResources.join(', ')}`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Handle request data validation for POST/PUT
    let requestData = null;
    if (['POST', 'PUT'].includes(req.method)) {
      try {
        requestData = await req.json();
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON in request body"
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Validate data based on schema
      const schemaKey = resource.replace(/s$/, '').replace('_', ''); // Remove plural and underscores
      if (schemas[schemaKey]) {
        const validation = validateData(requestData, schemas[schemaKey]);
        if (!validation.valid) {
          return new Response(JSON.stringify({
            error: "Validation Error",
            message: validation.error
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
    }

    // Handle CRUD operations
    const result = await handleCRUD(resource, req.method, id, requestData, user?.id);
    
    if (result.error) {
      return new Response(JSON.stringify({
        error: "Database Error",
        message: result.error.message
      }), {
        status: result.error.status || 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    }), {
      status: req.method === 'POST' ? 201 : 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in api-gateway function:', error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});