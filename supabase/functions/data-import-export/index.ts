import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportDataRequest {
  data: {
    datacenters: Array<{
      name: string;
      location: string;
      address?: string;
      timezone?: string;
      data_halls: Array<{
        name: string;
        floor?: number;
        capacity?: number;
        current_usage?: number;
        cabinets: Array<{
          name: string;
          row_position?: string;
          column_position?: number;
          capacity?: number;
          current_usage?: number;
          power_capacity?: number;
          current_power_usage?: number;
        }>;
      }>;
    }>;
  };
  validate_only?: boolean;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const validateImportData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.datacenters || !Array.isArray(data.datacenters)) {
    errors.push("Missing or invalid 'datacenters' array");
    return { valid: false, errors };
  }
  
  data.datacenters.forEach((dc: any, dcIndex: number) => {
    if (!dc.name || typeof dc.name !== 'string') {
      errors.push(`Datacenter ${dcIndex}: Missing or invalid 'name'`);
    }
    if (!dc.location || typeof dc.location !== 'string') {
      errors.push(`Datacenter ${dcIndex}: Missing or invalid 'location'`);
    }
    
    if (!dc.data_halls || !Array.isArray(dc.data_halls)) {
      errors.push(`Datacenter ${dcIndex}: Missing or invalid 'data_halls' array`);
      return;
    }
    
    dc.data_halls.forEach((dh: any, dhIndex: number) => {
      if (!dh.name || typeof dh.name !== 'string') {
        errors.push(`Datacenter ${dcIndex}, Data Hall ${dhIndex}: Missing or invalid 'name'`);
      }
      
      if (!dh.cabinets || !Array.isArray(dh.cabinets)) {
        errors.push(`Datacenter ${dcIndex}, Data Hall ${dhIndex}: Missing or invalid 'cabinets' array`);
        return;
      }
      
      dh.cabinets.forEach((cab: any, cabIndex: number) => {
        if (!cab.name || typeof cab.name !== 'string') {
          errors.push(`Datacenter ${dcIndex}, Data Hall ${dhIndex}, Cabinet ${cabIndex}: Missing or invalid 'name'`);
        }
      });
    });
  });
  
  return { valid: errors.length === 0, errors };
};

const importLocationData = async (data: any): Promise<{ success: boolean; message: string; stats?: any }> => {
  const stats = {
    datacenters_created: 0,
    data_halls_created: 0,
    cabinets_created: 0,
    errors: []
  };
  
  for (const datacenterData of data.datacenters) {
    try {
      // Insert datacenter
      const { data: datacenter, error: dcError } = await supabase
        .from('datacenters')
        .insert({
          name: datacenterData.name,
          location: datacenterData.location,
          address: datacenterData.address || null,
          timezone: datacenterData.timezone || 'UTC',
          is_active: true
        })
        .select()
        .single();
      
      if (dcError) {
        stats.errors.push(`Failed to create datacenter ${datacenterData.name}: ${dcError.message}`);
        continue;
      }
      
      stats.datacenters_created++;
      
      // Insert data halls
      for (const dataHallData of datacenterData.data_halls) {
        try {
          const { data: dataHall, error: dhError } = await supabase
            .from('data_halls')
            .insert({
              datacenter_id: datacenter.id,
              name: dataHallData.name,
              floor: dataHallData.floor || 1,
              capacity: dataHallData.capacity || 100,
              current_usage: dataHallData.current_usage || 0,
              is_active: true
            })
            .select()
            .single();
          
          if (dhError) {
            stats.errors.push(`Failed to create data hall ${dataHallData.name}: ${dhError.message}`);
            continue;
          }
          
          stats.data_halls_created++;
          
          // Insert cabinets
          for (const cabinetData of dataHallData.cabinets) {
            try {
              const { error: cabError } = await supabase
                .from('cabinets')
                .insert({
                  data_hall_id: dataHall.id,
                  name: cabinetData.name,
                  row_position: cabinetData.row_position || 'A',
                  column_position: cabinetData.column_position || 1,
                  capacity: cabinetData.capacity || 42,
                  current_usage: cabinetData.current_usage || 0,
                  power_capacity: cabinetData.power_capacity || 10000,
                  current_power_usage: cabinetData.current_power_usage || 0,
                  is_active: true
                });
              
              if (cabError) {
                stats.errors.push(`Failed to create cabinet ${cabinetData.name}: ${cabError.message}`);
              } else {
                stats.cabinets_created++;
              }
            } catch (error) {
              stats.errors.push(`Unexpected error creating cabinet ${cabinetData.name}: ${error.message}`);
            }
          }
        } catch (error) {
          stats.errors.push(`Unexpected error creating data hall ${dataHallData.name}: ${error.message}`);
        }
      }
    } catch (error) {
      stats.errors.push(`Unexpected error creating datacenter ${datacenterData.name}: ${error.message}`);
    }
  }
  
  return {
    success: stats.errors.length === 0,
    message: stats.errors.length === 0 
      ? "Import completed successfully" 
      : `Import completed with ${stats.errors.length} errors`,
    stats
  };
};

const exportLocationData = async (): Promise<any> => {
  const { data, error } = await supabase.rpc('export_location_data');
  
  if (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
  
  return data;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'GET':
        if (path === 'export') {
          const exportData = await exportLocationData();
          return new Response(JSON.stringify(exportData), {
            headers: { 
              'Content-Type': 'application/json',
              'Content-Disposition': 'attachment; filename="location-data-export.json"',
              ...corsHeaders 
            },
          });
        }
        break;

      case 'POST':
        if (path === 'import') {
          const body: ImportDataRequest = await req.json();
          
          // Validate the data structure
          const validation = validateImportData(body.data);
          if (!validation.valid) {
            return new Response(JSON.stringify({
              success: false,
              message: "Validation failed",
              errors: validation.errors
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          
          // If validate_only is true, just return validation result
          if (body.validate_only) {
            return new Response(JSON.stringify({
              success: true,
              message: "Validation successful",
              valid: true
            }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          
          // Import the data
          const result = await importLocationData(body.data);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 207, // 207 for partial success
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        break;
    }

    return new Response(JSON.stringify({
      error: "Not Found",
      message: "Available endpoints: GET /export, POST /import"
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in data-import-export function:', error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});