
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Shield } from "lucide-react";

const IncidentList = () => {
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'low': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'in progress': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'power': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'environmental': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'network': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'hardware': return 'bg-muted/50 text-muted-foreground border-border';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope.toLowerCase()) {
      case 'data hall': return 'bg-destructive/10 text-destructive/90 border-destructive/20'; 
      case 'rack': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'device': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default: return 'bg-muted/30 text-muted-foreground border-border';
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Incident Management</h1>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
          <Card key={incident.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <h3 className="font-semibold text-lg">{incident.id}</h3>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                    <Badge className={getTypeColor(incident.type)}>
                      {incident.type}
                    </Badge>
                    <Badge variant="outline" className={getScopeColor(incident.scope)}>
                      {incident.scope}
                    </Badge>
                  </div>
                  <p className="text-foreground font-medium">{incident.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div><strong className="text-foreground">Location:</strong> {incident.location}</div>
                    <div><strong className="text-foreground">Device:</strong> {incident.device}</div>
                    <div><strong className="text-foreground">Assigned to:</strong> {incident.assignee}</div>
                    <div><strong className="text-foreground">Created:</strong> {incident.created}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {incident.updated}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <Button variant="outline" size="sm">
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
            <div className="text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-foreground">No incidents found</h3>
              <p>Try adjusting your search criteria or report a new incident.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncidentList;
