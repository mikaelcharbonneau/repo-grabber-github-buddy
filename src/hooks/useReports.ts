import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReportGenerationParams {
  reportType: string;
  dateRange?: {
    from: string;
    to: string;
  };
  datacenters: string[];
  dataHalls: string[];
  format?: string;
}

export const useReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = async (params: ReportGenerationParams) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: params
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Report Generation Started",
        description: "Your report is being generated. You'll be notified when it's ready.",
      });

      return data;
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const getReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const { data: report, error } = await supabase
        .from('reports')
        .select('file_path, name, format')
        .eq('id', reportId)
        .single();

      if (error || !report?.file_path) {
        throw new Error('Report file not found');
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('reports')
        .download(report.file_path);

      if (downloadError) {
        throw downloadError;
      }

      // Create download link
      const url = URL.createObjectURL(fileData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.name}.${report.format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update download count
      const { data: currentReport } = await supabase
        .from('reports')
        .select('download_count')
        .eq('id', reportId)
        .single();
      
      await supabase
        .from('reports')
        .update({ download_count: (currentReport?.download_count || 0) + 1 })
        .eq('id', reportId);

      toast({
        title: "Download Started",
        description: "Your report is being downloaded.",
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    generateReport,
    getReports,
    downloadReport,
    isGenerating
  };
};