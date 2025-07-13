
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Shield } from "lucide-react";

const IncidentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const incidents = [
    {
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
      scope: "Device"
    },
    {
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
      scope: "Device"
    },
    {
      id: "INC-2024-043",
      location: "DC-CENTRAL / Hall-C",
      device: "N/A",
      description: "HVAC system malfunction affecting entire data hall",
      severity: "Critical",
      status: "In Progress",
      assignee: "Facilities Team",
      created: "2024-01-13 16:45",
      updated: "2024-01-15 12:00",
      type: "Environmental",
      scope: "Data Hall"
    },
    {
      id: "INC-2024-042",
      location: "DC-EAST / Hall-A / Rack-23",
      device: "UPS-A23-002",
      description: "Battery backup test failure - Replacement required",
      severity: "Medium",
      status: "Resolved",
      assignee: "Tech Team Gamma",
      created: "2024-01-12 11:20",
      updated: "2024-01-14 16:30",
      type: "Power",
      scope: "Device"
    }
  ];

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
      case 'open': return 'critical';
      case 'in progress': return 'medium';
      case 'resolved': return 'low';
      default: return 'outline';
    }
  };
  const getTypeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'power': return 'hpe';
      case 'environmental': return 'medium';
      case 'network': return 'low';
      case 'hardware': return 'outline';
      default: return 'outline';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope.toLowerCase()) {
      case 'data hall': return 'bg-red-50 text-red-700 border-red-200'; 
      case 'rack': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'device': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || incident.severity.toLowerCase() === severityFilter;
    const matchesStatus = statusFilter === "all" || incident.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleIncidentClick = (incidentId: string) => {
    navigate(`/incidents/${incidentId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button className="bg-hpe-green hover:bg-hpe-green/90">
          <Plus className="mr-2 h-4 w-4" />
          Report New Incident
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incident List */}
      <div className="grid gap-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id} accentColor={getSeverityVariant(incident.severity) === 'critical' ? 'border-hpe-red' : getSeverityVariant(incident.severity) === 'medium' ? 'border-hpe-orange' : getSeverityVariant(incident.severity) === 'low' ? 'border-hpe-yellow' : 'border-hpe-brand'} className="hover:shadow-hpe-brand transition-shadow cursor-pointer" onClick={() => handleIncidentClick(incident.id)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <h3 className="font-semibold text-lg">{incident.id}</h3>
                    
                      
                    
                      
                    
                      
                    
                      
                  </div>
                  <p className="text-gray-900 font-medium">{incident.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div><strong>Location:</strong> {incident.location}</div>
                    <div><strong>Device:</strong> {incident.device}</div>
                    <div><strong>Assigned to:</strong> {incident.assignee}</div>
                    <div><strong>Created:</strong> {incident.created}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {incident.updated}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => handleIncidentClick(incident.id)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                  {incident.status === "Resolved" && (
                    <Button variant="outline" size="sm">
                      Generate Report
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <Shield className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No incidents found</h3>
              <p>Try adjusting your search criteria or report a new incident.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncidentList;
