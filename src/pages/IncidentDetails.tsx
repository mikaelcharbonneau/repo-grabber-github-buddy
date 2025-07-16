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
import  supabase  from "@/lib/supabaseClient";

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
          <h1 className="text-2xl font-bold text-gray-900">{incident.id}</h1>
          <p className="text-gray-600">{incident.description}</p>
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
                <div className="font-medium">{incident.location}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Assigned To</div>
                <div className="font-medium">{incident.assignee}</div>
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
                <div className="font-medium">{incident.created_at}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Impact</div>
                <div className="font-medium">{incident.impact.split(' - ')[0]}</div>
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
                  <div className="text-sm text-gray-500">Device</div>
                  <div className="font-medium">{incident.device}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reporter</div>
                  <div className="font-medium">{incident.reporter}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <Badge variant={getTypeVariant(incident.type)}>
                    {incident.type}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Scope</div>
                  <div className="font-medium">{incident.scope}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">Impact Assessment</div>
                <div className="p-3 bg-gray-50 rounded">{incident.impact}</div>
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
                {incident.updates.map((update: any) => (
                  <div key={update.id} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-hpe-green rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{update.action}</span>
                        <span className="text-sm text-gray-500">by {update.user}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{update.timestamp}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{update.comment}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Incidents */}
          {incident.related_incidents && incident.related_incidents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incident.related_incidents.map((related: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{related.id}</div>
                        <div className="text-sm text-gray-600">{related.description}</div>
                      </div>
                      <Badge variant={getStatusVariant(related.status)}>
                        {related.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
                <span className="font-medium">{incident.severity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type</span>
                <Badge variant={getTypeVariant(incident.type)}>
                  {incident.type}
                </Badge>
              </div>
              {incident.estimated_resolution && (
                <div>
                  <div className="text-sm text-gray-500">Est. Resolution</div>
                  <div className="font-medium">{incident.estimated_resolution}</div>
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