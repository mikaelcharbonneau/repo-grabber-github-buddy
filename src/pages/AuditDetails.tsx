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
  FileText
} from "lucide-react";

const AuditDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock audit data - in a real app, this would come from an API
  const auditData = {
    "AUD-2024-001": {
      id: "AUD-2024-001",
      location: "DC-EAST / Hall-A",
      technician: "John Doe",
      date: "2024-01-15",
      time: "14:30",
      issues: 2,
      severity: "Medium",
      status: "Completed",
      description: "Routine quarterly inspection",
      duration: "2 hours 15 minutes",
      completedAt: "2024-01-15 16:45",
      findings: [
        {
          id: 1,
          type: "Temperature Warning",
          location: "Rack-15 / PDU-A15-001",
          severity: "Medium",
          description: "Temperature sensor reading 28°C - above normal threshold",
          resolved: true,
          resolvedAt: "2024-01-15 17:30"
        },
        {
          id: 2,
          type: "Communication Failure",
          location: "Rack-23 / Switch-A23-002",
          severity: "Low",
          description: "Intermittent network connectivity issues detected",
          resolved: false,
          assignedTo: "Network Team"
        }
      ],
      checklist: [
        { item: "Power Distribution Units", status: "Completed", issues: 1 },
        { item: "Environmental Controls", status: "Completed", issues: 0 },
        { item: "Network Equipment", status: "Completed", issues: 1 },
        { item: "Security Systems", status: "Completed", issues: 0 },
        { item: "Fire Suppression", status: "Completed", issues: 0 }
      ]
    },
    "AUD-2024-002": {
      id: "AUD-2024-002",
      location: "DC-WEST / Hall-B",
      technician: "Jane Smith",
      date: "2024-01-14",
      time: "09:15",
      issues: 0,
      severity: "None",
      status: "Completed",
      description: "Monthly infrastructure check",
      duration: "1 hour 45 minutes",
      completedAt: "2024-01-14 11:00",
      findings: [],
      checklist: [
        { item: "Power Distribution Units", status: "Completed", issues: 0 },
        { item: "Environmental Controls", status: "Completed", issues: 0 },
        { item: "Network Equipment", status: "Completed", issues: 0 },
        { item: "Security Systems", status: "Completed", issues: 0 },
        { item: "Fire Suppression", status: "Completed", issues: 0 }
      ]
    },
    "AUD-2024-003": {
      id: "AUD-2024-003",
      location: "DC-CENTRAL / Hall-C",
      technician: "Mike Johnson",
      date: "2024-01-13",
      time: "16:45",
      issues: 5,
      severity: "Critical",
      status: "Under Review",
      description: "Emergency inspection - power anomalies",
      duration: "3 hours 20 minutes",
      completedAt: "2024-01-13 20:05",
      findings: [
        {
          id: 1,
          type: "Overcurrent Alarm",
          location: "Rack-10 / PDU-C10-001",
          severity: "Critical",
          description: "PDU exceeding 90% capacity - immediate action required",
          resolved: false,
          assignedTo: "Power Team"
        },
        {
          id: 2,
          type: "Fan Failure",
          location: "Rack-15 / Server-C15-003",
          severity: "Medium",
          description: "Primary cooling fan failure detected",
          resolved: true,
          resolvedAt: "2024-01-14 08:30"
        }
      ],
      checklist: [
        { item: "Power Distribution Units", status: "Completed", issues: 3 },
        { item: "Environmental Controls", status: "Completed", issues: 1 },
        { item: "Network Equipment", status: "Completed", issues: 0 },
        { item: "Security Systems", status: "Completed", issues: 1 },
        { item: "Fire Suppression", status: "Completed", issues: 0 }
      ]
    }
  };

  const audit = auditData[id] || null;

  if (!audit) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">Audit Not Found</h3>
              <p>The requested audit could not be found.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">{audit.id}</h1>
          <p className="text-gray-600">{audit.description}</p>
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
                <div className="font-medium">{audit.location}</div>
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
                <div className="font-medium">{audit.technician}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Duration</div>
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
                <div className="font-medium">{audit.issues}</div>
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
                    <div className="text-sm text-gray-500">{audit.date} at {audit.time}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-hpe-green rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Inspection Completed</div>
                    <div className="text-sm text-gray-500">{audit.completedAt}</div>
                  </div>
                </div>
                {audit.status === "Completed" && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Audit Finalized</div>
                      <div className="text-sm text-gray-500">{audit.completedAt}</div>
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
                <span>Findings ({audit.findings.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audit.findings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900">No Issues Found</div>
                  <div className="text-gray-500">All systems operating normally</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {audit.findings.map((finding) => (
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
                          <span className="text-sm">Resolved on {finding.resolvedAt}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Assigned to {finding.assignedTo}</span>
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
                <Badge variant={getStatusVariant(audit.status)}>
                  {audit.status}
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
                {audit.checklist.map((item, index) => (
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