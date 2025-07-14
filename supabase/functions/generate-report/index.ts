import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: string;
  dateRange?: {
    from: string;
    to: string;
  };
  datacenters: string[];
  dataHalls: string[];
  format?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: ReportRequest = await req.json();
    console.log('Report generation request:', requestData);

    // Request report generation via database function
    const { data: reportId, error: dbError } = await supabaseClient
      .rpc('request_report_generation', {
        report_name: `${requestData.reportType} Report - ${new Date().toLocaleDateString()}`,
        report_type: requestData.reportType,
        parameters: {
          dateRange: requestData.dateRange,
          datacenters: requestData.datacenters,
          dataHalls: requestData.dataHalls,
          format: requestData.format || 'PDF'
        }
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Report queued with ID:', reportId);

    // Start background report generation
    EdgeRuntime.waitUntil(generateReportFile(supabaseClient, reportId, requestData));

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportId,
        message: 'Report generation started. You will be notified when ready.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function generateReportFile(supabaseClient: any, reportId: string, requestData: ReportRequest) {
  try {
    console.log('Starting background report generation for:', reportId);

    // Update status to processing
    await supabaseClient
      .from('reports')
      .update({ status: 'processing' })
      .eq('id', reportId);

    // Generate report data based on type
    const reportData = await generateReportData(supabaseClient, requestData);
    
    // Generate file content (simplified for demo - in production would use proper report generator)
    const fileContent = generateReportContent(reportData, requestData);
    
    // Upload to storage
    const fileName = `${reportId}-${requestData.reportType.toLowerCase()}-report.json`;
    const filePath = `${reportData.userId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('reports')
      .upload(filePath, new Blob([fileContent], { type: 'application/json' }));

    if (uploadError) {
      throw uploadError;
    }

    // Get file URL
    const { data: urlData } = supabaseClient.storage
      .from('reports')
      .getPublicUrl(filePath);

    // Update report with completion details
    await supabaseClient
      .from('reports')
      .update({
        status: 'completed',
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_size: new Blob([fileContent]).size,
        completed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    console.log('Report generation completed for:', reportId);

  } catch (error) {
    console.error('Background report generation failed:', error);
    
    // Update status to failed
    await supabaseClient
      .from('reports')
      .update({ 
        status: 'failed',
        metadata: { error: error.message }
      })
      .eq('id', reportId);
  }
}

async function generateReportData(supabaseClient: any, requestData: ReportRequest) {
  const { data: user } = await supabaseClient.auth.getUser();
  
  let query = supabaseClient.from(requestData.reportType === 'audits' ? 'audits' : 'incidents');
  
  // Apply date filters if provided
  if (requestData.dateRange?.from) {
    query = query.gte('created_at', requestData.dateRange.from);
  }
  if (requestData.dateRange?.to) {
    query = query.lte('created_at', requestData.dateRange.to);
  }

  const { data, error } = await query.select('*');
  
  if (error) {
    throw error;
  }

  return {
    userId: user.user?.id,
    type: requestData.reportType,
    data,
    generatedAt: new Date().toISOString(),
    filters: requestData
  };
}

function generateReportContent(reportData: any, requestData: ReportRequest): string {
  // Simplified report generation - in production would use proper templating
  const report = {
    metadata: {
      title: `${requestData.reportType.toUpperCase()} Report`,
      generatedAt: reportData.generatedAt,
      filters: requestData,
      recordCount: reportData.data.length
    },
    summary: {
      totalRecords: reportData.data.length,
      dateRange: requestData.dateRange,
      datacenters: requestData.datacenters,
      dataHalls: requestData.dataHalls
    },
    data: reportData.data
  };

  return JSON.stringify(report, null, 2);
}