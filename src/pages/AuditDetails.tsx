import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Incident {
  id: string;
  audit_id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  updated_at: string;
  tile_location?: string;
  resolved_at?: string;
  assigned_to?: string;
  auditor_id: string;
}

interface Audit {
  id: string;
  custom_audit_id?: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  datacenter?: { name: string };
  datahall?: { name: string };
  auditor?: { name: string };
  issues_count?: number;
  findings?: Incident[];
  checklist?: Array<{
    item: string;
    status: string;
    issues: number;
  }>;
}

const AuditDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // First fetch the audit with basic info
        const { data: auditData, error: auditError } = await supabase
          .from('audits')
          .select('*')
          .eq('id', id)
          .single();
          
        if (auditError) throw auditError;
        
        // Then fetch related data separately to avoid relation errors
        const [{ data: datacenter }, { data: datahall }, { data: auditor }] = await Promise.all([
          supabase
            .from('datacenters')
            .select('name')
            .eq('id', auditData.datacenter_id)
            .single(),
          supabase
            .from('datahalls')
            .select('name')
            .eq('id', auditData.datahall_id)
            .single(),
          supabase
            .from('auditors')
            .select('name')
            .eq('id', auditData.auditor_id)
            .single()
        ]);
        
        // Combine the data
        const enrichedAuditData = {
          ...auditData,
          datacenter,
          datahall,
          auditor
        };

        if (!enrichedAuditData) {
          setError('Audit not found');
          setLoading(false);
          return;
        }

        // Fetch related incidents (findings)
        const { data: incidents, error: incidentsError } = await supabase
          .from('incidents')
          .select('*')
          .eq('audit_id', id);

        if (incidentsError) throw incidentsError;

        // Transform the data to match the expected format
        const transformedAudit: Audit = {
          ...enrichedAuditData,
          issues_count: incidents?.length || 0,
          findings: incidents?.map(incident => ({
            ...incident,
            type: incident.title || 'Incident',
            location: incident.tile_location || 'Unknown location',
            resolved: incident.status === 'resolved'
          })) || []
        };

        setAudit(transformedAudit);
      } catch (err) {
        console.error('Error fetching audit:', err);
        setError('Failed to load audit details');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-hpe-brand" />
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">Audit Not Found</h3>
              <p>{error || 'The requested audit could not be found.'}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate("/audits")}
              >
                Back to Audits
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'hpe';
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'hpe';
      case 'under review': return 'medium';
      case 'in progress': return 'low';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/audits")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Audits
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
          {audit.custom_audit_id || `Audit #${audit.id.substring(0, 8)}`}
        </h1>
          <div className="text-gray-600">{audit.description || 'No description available'}</div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">
                  {audit.datacenter?.name}
                  {audit.datahall?.name && ` / ${audit.datahall?.name}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Technician</div>
                <div className="font-medium">{audit.auditor?.name || 'Unknown'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-2xl font-bold">{audit.title || `Audit ${audit.id.substring(0, 8)}`}</div>
                <div className="font-medium">{audit.duration}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Issues Found</div>
                <div className="font-medium">{audit.issues_count || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Audit Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Audit Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-hpe-green rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Audit Started</div>
                    <div className="text-sm text-gray-500">
                      {new Date(audit.created_at).toLocaleDateString()} at {new Date(audit.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-hpe-green rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Inspection Completed</div>
                    <div className="text-sm text-gray-500">
                      {new Date(audit.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {audit.status === "Completed" && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Audit Finalized</div>
                      <div className="text-sm text-gray-500">
                        {new Date(audit.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Findings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Findings ({audit.findings?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!audit.findings || audit.findings.length === 0) ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900">No Issues Found</div>
                  <div className="text-gray-500">All systems operating normally</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {audit.findings?.map((finding) => (
                    <div key={finding.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium">{finding.type}</div>
                          <div className="text-sm text-gray-600">{finding.location}</div>
                          <div className="text-sm text-gray-700 mt-1">{finding.description}</div>
                        </div>
                      </div>
                      {finding.resolved ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Resolved on {finding.resolved_at}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Assigned to {finding.assigned_to}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant={getStatusVariant(audit.status)} className="capitalize">
                  {audit.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Severity</span>
                <span className="font-medium">{audit.severity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Issues</span>
                <span className="font-medium">{audit.issues}</span>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audit.checklist?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{item.item}</span>
                    </div>
                    {item.issues > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {item.issues} issues
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Download Report
              </Button>
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
              <Button variant="outline" className="w-full">
                Create Follow-up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditDetails;