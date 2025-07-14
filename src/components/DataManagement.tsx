import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataIntegration } from '@/hooks/useDataIntegration';
import { useAPIClient } from '@/hooks/useAPIClient';
import { 
  Download, 
  Upload, 
  Database, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

export const DataManagement: React.FC = () => {
  const { 
    isLoading: isIntegrationLoading, 
    exportLocationData, 
    importLocationData,
    bulkUpdateCabinets,
    bulkCloseIncidents,
    bulkUpdateAudits
  } = useDataIntegration();
  
  const { isLoading: isAPILoading } = useAPIClient();
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<string>('');
  const [bulkCabinetIds, setBulkCabinetIds] = useState<string>('');
  const [bulkIncidentIds, setBulkIncidentIds] = useState<string>('');
  const [bulkAuditIds, setBulkAuditIds] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const isLoading = isIntegrationLoading || isAPILoading;

  const handleExport = async () => {
    try {
      await exportLocationData();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleValidateImport = async () => {
    if (!importData) return;
    
    try {
      const data = JSON.parse(importData);
      await importLocationData(data, true);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleImport = async () => {
    if (!importData) return;
    
    try {
      const data = JSON.parse(importData);
      await importLocationData(data, false);
      setImportData('');
      setImportFile(null);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleBulkCabinetUpdate = async (status: boolean) => {
    const ids = bulkCabinetIds.split('\n').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) return;
    
    try {
      await bulkUpdateCabinets(ids, status);
      setBulkCabinetIds('');
    } catch (error) {
      console.error('Bulk cabinet update failed:', error);
    }
  };

  const handleBulkIncidentClose = async () => {
    const ids = bulkIncidentIds.split('\n').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) return;
    
    try {
      await bulkCloseIncidents(ids, resolutionNote);
      setBulkIncidentIds('');
      setResolutionNote('');
    } catch (error) {
      console.error('Bulk incident close failed:', error);
    }
  };

  const handleBulkAuditUpdate = async (status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
    const ids = bulkAuditIds.split('\n').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) return;
    
    try {
      await bulkUpdateAudits(ids, status);
      setBulkAuditIds('');
    } catch (error) {
      console.error('Bulk audit update failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">
            Import, export, and manage your data with powerful bulk operations
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Integration Suite
        </Badge>
      </div>

      <Tabs defaultValue="import-export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="bulk-operations">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="import-export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Export all location data including datacenters, data halls, and cabinets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Includes complete hierarchy
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  JSON format for easy import
                </div>
                <Button 
                  onClick={handleExport} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Location Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Import Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Data
                </CardTitle>
                <CardDescription>
                  Import location data from JSON file or paste JSON directly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="import-file">Upload JSON File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportFileChange}
                    disabled={isLoading}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="import-data">Or Paste JSON Data</Label>
                  <Textarea
                    id="import-data"
                    placeholder="Paste your JSON data here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={6}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleValidateImport}
                    disabled={!importData || isLoading}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validate
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={!importData || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk-operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bulk Cabinet Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cabinet Operations
                </CardTitle>
                <CardDescription>
                  Bulk enable/disable cabinets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cabinet-ids">Cabinet IDs (one per line)</Label>
                  <Textarea
                    id="cabinet-ids"
                    placeholder="Enter cabinet UUIDs..."
                    value={bulkCabinetIds}
                    onChange={(e) => setBulkCabinetIds(e.target.value)}
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleBulkCabinetUpdate(true)}
                    disabled={!bulkCabinetIds || isLoading}
                    className="flex-1"
                  >
                    Enable
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleBulkCabinetUpdate(false)}
                    disabled={!bulkCabinetIds || isLoading}
                    className="flex-1"
                  >
                    Disable
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Incident Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Incident Operations
                </CardTitle>
                <CardDescription>
                  Bulk close incidents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="incident-ids">Incident IDs (one per line)</Label>
                  <Textarea
                    id="incident-ids"
                    placeholder="Enter incident UUIDs..."
                    value={bulkIncidentIds}
                    onChange={(e) => setBulkIncidentIds(e.target.value)}
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="resolution-note">Resolution Note</Label>
                  <Textarea
                    id="resolution-note"
                    placeholder="Optional resolution note..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  onClick={handleBulkIncidentClose}
                  disabled={!bulkIncidentIds || isLoading}
                  className="w-full"
                >
                  Close Incidents
                </Button>
              </CardContent>
            </Card>

            {/* Bulk Audit Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Audit Operations
                </CardTitle>
                <CardDescription>
                  Bulk update audit status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="audit-ids">Audit IDs (one per line)</Label>
                  <Textarea
                    id="audit-ids"
                    placeholder="Enter audit UUIDs..."
                    value={bulkAuditIds}
                    onChange={(e) => setBulkAuditIds(e.target.value)}
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleBulkAuditUpdate('scheduled')}
                    disabled={!bulkAuditIds || isLoading}
                    size="sm"
                  >
                    Schedule
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleBulkAuditUpdate('in_progress')}
                    disabled={!bulkAuditIds || isLoading}
                    size="sm"
                  >
                    Start
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleBulkAuditUpdate('completed')}
                    disabled={!bulkAuditIds || isLoading}
                    size="sm"
                  >
                    Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleBulkAuditUpdate('cancelled')}
                    disabled={!bulkAuditIds || isLoading}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};