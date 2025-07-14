import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportStats {
  datacenters_created: number;
  data_halls_created: number;
  cabinets_created: number;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
}

interface BulkOperationResult {
  success: boolean;
  message: string;
  data: any;
}

export const useDataIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const exportLocationData = async (): Promise<any> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('data-import-export/export');
      
      if (error) throw error;
      
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `location-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Location data has been exported and downloaded.",
      });
      
      return data;
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const importLocationData = async (data: any, validateOnly = false): Promise<ImportResult> => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('data-import-export/import', {
        body: { data, validate_only: validateOnly }
      });
      
      if (error) throw error;
      
      if (validateOnly) {
        toast({
          title: "Validation Successful", 
          description: "Data structure is valid and ready for import.",
        });
      } else {
        toast({
          title: result.success ? "Import Successful" : "Import Completed with Warnings",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkUpdateCabinets = async (cabinetIds: string[], status: boolean): Promise<BulkOperationResult> => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('bulk-operations/cabinets', {
        body: { cabinet_ids: cabinetIds, status }
      });
      
      if (error) throw error;
      
      toast({
        title: "Bulk Update Successful",
        description: result.message,
      });
      
      return result;
    } catch (error) {
      console.error('Bulk update error:', error);
      toast({
        title: "Bulk Update Failed",
        description: error instanceof Error ? error.message : "Failed to update cabinets",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkCloseIncidents = async (incidentIds: string[], resolutionNote?: string): Promise<BulkOperationResult> => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('bulk-operations/incidents', {
        body: { incident_ids: incidentIds, resolution_note: resolutionNote }
      });
      
      if (error) throw error;
      
      toast({
        title: "Bulk Close Successful",
        description: result.message,
      });
      
      return result;
    } catch (error) {
      console.error('Bulk close error:', error);
      toast({
        title: "Bulk Close Failed",
        description: error instanceof Error ? error.message : "Failed to close incidents",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkUpdateAudits = async (
    auditIds: string[], 
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    assignedTo?: string
  ): Promise<BulkOperationResult> => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('bulk-operations/audits', {
        body: { audit_ids: auditIds, status, assigned_to: assignedTo }
      });
      
      if (error) throw error;
      
      toast({
        title: "Bulk Update Successful",
        description: result.message,
      });
      
      return result;
    } catch (error) {
      console.error('Bulk audit update error:', error);
      toast({
        title: "Bulk Update Failed",
        description: error instanceof Error ? error.message : "Failed to update audits",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    exportLocationData,
    importLocationData,
    bulkUpdateCabinets,
    bulkCloseIncidents,
    bulkUpdateAudits
  };
};