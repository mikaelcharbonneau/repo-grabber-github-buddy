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
  MessageSquare
} from "lucide-react";

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock incident data - in a real app, this would come from an API
  const incidentData = {
    "INC-2024-045": {
      id: "INC-2024-045",
      location: "DC-EAST / Hall-A / Rack-15",
      device: "PDU-A15-001",
      description: "Overcurrent alarm triggered - Load exceeding 80% capacity",
      severity: "Critical",
      status: "Open",
      assignee: "Tech Team Alpha",
      created: "2024-01-15 14:23",
      updated: "2024-01-15 15:30",
      type: "Power",
      scope: "Device",
      reporter: "John Doe",
      estimatedResolution: "2024-01-16 10:00",
      impact: "High - Potential power failure risk",
      updates: [
        {
          id: 1,
          timestamp: "2024-01-15 15:30",
          user: "Tech Team Alpha",
          action: "Assigned",
          comment: "Reviewing power consumption data and scheduling maintenance window"
        },
        {
          id: 2,
          timestamp: "2024-01-15 14:23",
          user: "System Monitor",
          action: "Created",
          comment: "Automatic alert triggered by PDU monitoring system"
        }
      ],
      relatedIncidents: [
        { id: "INC-2024-043", description: "Power fluctuation in adjacent rack", status: "Resolved" }
      ]
    },
    "INC-2024-044": {
      id: "INC-2024-044",
      location: "DC-WEST / Hall-B / Rack-08",
      device: "TEMP-B08-003",
      description: "Temperature sensor offline - No readings for 2 hours",
      severity: "Medium",
      status: "In Progress",
      assignee: "Tech Team Beta",
      created: "2024-01-14 09:15",
      updated: "2024-01-15 08:45",
      type: "Environmental",
      scope: "Device",
      reporter: "Jane Smith",
      estimatedResolution: "2024-01-15 16:00",
      impact: "Medium - Environmental monitoring compromised",
      updates: [
        {
          id: 1,
          timestamp: "2024-01-15 08:45",
          user: "Tech Team Beta",
          action: "Updated",
          comment: "Replacement sensor ordered, temporary monitoring in place"
        },
        {
          id: 2,
          timestamp: "2024-01-14 12:30",
          user: "Tech Team Beta",
          action: "Investigated",
          comment: "Confirmed sensor failure, checking warranty status"
        },
        {
          id: 3,
          timestamp: "2024-01-14 09:15",
          user: "Jane Smith",
          action: "Created",
          comment: "Temperature readings stopped at 07:15, manual check shows normal temperature"
        }
      ],
      relatedIncidents: []
    }
  };

  const incident = incidentData[id] || null;

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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'power': return 'bg-orange-100 text-orange-800';
      case 'environmental': return 'bg-blue-100 text-blue-800';
      case 'network': return 'bg-purple-100 text-purple-800';
      case 'hardware': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
                <div className="font-medium">{incident.created}</div>
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
                  <Badge className={getTypeColor(incident.type)}>
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
                {incident.updates.map((update) => (
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
          {incident.relatedIncidents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incident.relatedIncidents.map((related, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{related.id}</div>
                        <div className="text-sm text-gray-600">{related.description}</div>
                      </div>
                      <Badge className={getStatusColor(related.status)}>
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
                <Badge className={getStatusColor(incident.status)}>
                  {incident.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Severity</span>
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Type</span>
                <Badge className={getTypeColor(incident.type)}>
                  {incident.type}
                </Badge>
              </div>
              {incident.estimatedResolution && (
                <div>
                  <div className="text-sm text-gray-500">Est. Resolution</div>
                  <div className="font-medium">{incident.estimatedResolution}</div>
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