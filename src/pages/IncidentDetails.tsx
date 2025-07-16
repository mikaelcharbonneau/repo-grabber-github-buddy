import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .single();
      setIncident(data);
      setLoading(false);
    };
    if (id) fetchIncident();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">Loading incident...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">Incident Not Found</h3>
              <p>The requested incident could not be found.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate("/incidents")}
              >
                Back to Incidents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'hpe';
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'critical';
      case 'in progress': return 'medium';
      case 'resolved': return 'low';
      default: return 'outline';
    }
  };
  const getTypeVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'power': return 'hpe';
      case 'environmental': return 'medium';
      case 'network': return 'low';
      case 'hardware': return 'outline';
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
          onClick={() => navigate("/incidents")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Incidents
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
          <p className="text-gray-600">{incident.description}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Severity</div>
                <div className="font-medium">
                  <Badge variant={getSeverityVariant(incident.severity)}>
                    {incident.severity}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">
                  <Badge variant={getStatusVariant(incident.status)}>
                    {incident.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium">{new Date(incident.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Incident Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Incident ID</div>
                  <div className="font-medium font-mono text-sm">{incident.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Audit ID</div>
                  <div className="font-medium font-mono text-sm">{incident.audit_id || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Created At</div>
                  <div className="font-medium">{new Date(incident.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="font-medium">{new Date(incident.updated_at).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">Description</div>
                <div className="p-3 bg-gray-50 rounded">{incident.description || 'No description provided'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Activity Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-hpe-brand rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Incident Created</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{new Date(incident.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">Incident "{incident.title}" was created</div>
                  </div>
                </div>
                {incident.updated_at !== incident.created_at && (
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Last Updated</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{new Date(incident.updated_at).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">Incident information was updated</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant={getStatusVariant(incident.status)}>
                  {incident.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Severity</span>
                <Badge variant={getSeverityVariant(incident.severity)}>
                  {incident.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Auditor ID</span>
                <span className="font-medium font-mono text-xs">{incident.auditor_id}</span>
              </div>
              {incident.audit_id && (
                <div>
                  <div className="text-sm text-gray-500">Related Audit</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/audit/details/${incident.audit_id}`)}
                    className="mt-1"
                  >
                    View Audit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Update Status
              </Button>
              <Button variant="outline" className="w-full">
                Add Comment
              </Button>
              <Button variant="outline" className="w-full">
                Escalate
              </Button>
              <Button variant="outline" className="w-full">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetails;