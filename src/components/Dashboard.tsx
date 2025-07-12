import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  Shield, 
  Circle, 
  Plus,
  ArrowUp,
  ArrowDown,
  FileText,
  Building,
  Filter,
  Calendar
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { locationData, getDataHallsByDatacenter } from "@/data/locations";
import { DateRange } from "react-day-picker";

const Dashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    datacenter: "all",
    dataHall: "all"
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Get available data halls based on selected datacenter
  const availableDataHalls = filters.datacenter === "all" ? [] : getDataHallsByDatacenter(filters.datacenter);

  // Reset data hall when datacenter changes
  const handleDatacenterChange = (value: string) => {
    setFilters({...filters, datacenter: value, dataHall: "all"});
  };
  const stats = [
    {
      title: "Completed Audits",
      value: "47",
      change: "+12%",
      changeType: "increase" as const,
      icon: ClipboardCheck,
      color: "text-hpe-green"
    },
    {
      title: "Active Incidents",
      value: "8",
      change: "-23%",
      changeType: "decrease" as const,
      icon: Shield,
      color: "text-orange-600"
    },
    {
      title: "Resolved Incidents",
      value: "24",
      change: "+3",
      changeType: "increase" as const,
      icon: Shield,
      color: "text-green-600"  
    },
    {
      title: "Reports Generated",
      value: "18",
      change: "+5",
      changeType: "increase" as const,
      icon: FileText,
      color: "text-purple-600"
    }
  ];

  const recentAudits = [
    {
      id: "AUD-2024-001",
      location: "Quebec, Canada - Island 1",
      technician: "John Doe",
      date: "2024-01-15",
      issues: 2,
      severity: "Medium"
    },
    {
      id: "AUD-2024-002", 
      location: "Rjukan, Norway - Island 1",
      technician: "Jane Smith",
      date: "2024-01-14",
      issues: 0,
      severity: "None"
    },
    {
      id: "AUD-2024-003",
      location: "Dallas, United States - Island 3",
      technician: "Mike Johnson",
      date: "2024-01-13",
      issues: 5,
      severity: "Critical"
    }
  ];

  const recentIncidents = [
    {
      id: "INC-2024-045",
      location: "DC-EAST / Hall-A / Rack-15",
      description: "PDU overcurrent alarm",
      severity: "Critical",
      status: "Open",
      assignee: "Tech Team Alpha"
    },
    {
      id: "INC-2024-044",
      location: "DC-WEST / Hall-B / Rack-08",
      description: "Temperature sensor offline",
      severity: "Medium", 
      status: "In Progress",
      assignee: "Tech Team Beta"
    }
  ];

  const recentReports = [
    {
      id: "RPT-2024-001",
      name: "January Audit Summary",
      type: "Audit Summary Report",
      generated: "2024-01-15 16:30",
      size: "2.3 MB",
      format: "PDF",
      status: "Ready"
    },
    {
      id: "RPT-2024-002", 
      name: "Critical Incidents Q1",
      type: "Incident Detail Report",
      generated: "2024-01-14 09:15",
      size: "1.8 MB", 
      format: "CSV",
      status: "Ready"
    },
    {
      id: "RPT-2024-003",
      name: "DC-EAST Compliance",
      type: "Compliance Report",
      generated: "2024-01-13 14:45",
      size: "945 KB",
      format: "PDF",
      status: "Processing"
    },
    {
      id: "RPT-2024-004",
      name: "Performance Metrics Dec",
      type: "Performance Report",
      generated: "2024-01-12 11:20",
      size: "1.2 MB",
      format: "CSV",
      status: "Ready"
    },
    {
      id: "RPT-2024-005",
      name: "Weekly Infrastructure",
      type: "Infrastructure Report",
      generated: "2024-01-11 08:45",
      size: "678 KB",
      format: "PDF",
      status: "Ready"
    },
    {
      id: "RPT-2024-006",
      name: "Security Assessment",
      type: "Security Report",
      generated: "2024-01-10 15:30",
      size: "3.1 MB",
      format: "PDF",
      status: "Ready"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'none': return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader className="p-6 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">Dashboard</CardTitle>
              </div>
              <div></div>
              <div className="flex justify-end">
                <Button 
                  className="bg-hpe-green hover:bg-hpe-green/90"
                  onClick={() => navigate('/audit/start')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Audit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <DatePickerWithRange 
                  date={dateRange} 
                  setDate={setDateRange}
                  className="w-full h-12"
                />
              </div>
              
              <Select value={filters.datacenter} onValueChange={handleDatacenterChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All Datacenters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Datacenters</SelectItem>
                  {locationData.map((datacenter) => (
                    <SelectItem key={datacenter.id} value={datacenter.id}>
                      {datacenter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.dataHall} 
                onValueChange={(value) => setFilters({...filters, dataHall: value})}
                disabled={filters.datacenter === "all"}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All Data Halls" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data Halls</SelectItem>
                  {availableDataHalls.map((hall) => (
                    <SelectItem key={hall.id} value={hall.id}>
                      {hall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="hover:shadow-md transition-shadow cursor-pointer" 
            onClick={() => {
              if (stat.title === "Completed Audits") navigate("/audits");
              else if (stat.title === "Active Incidents" || stat.title === "Resolved Incidents") navigate("/incidents");
              else if (stat.title === "Reports Generated") navigate("/reports");
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                {stat.changeType === 'increase' && (
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                )}
                {stat.changeType === 'decrease' && (
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={
                  stat.changeType === 'increase' ? 'text-green-600' :
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                }>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Audits
              <Button variant="outline" size="sm" onClick={() => navigate("/audits")}>View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudits.map((audit) => (
                <div 
                  key={audit.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate(`/audit/details/${audit.id}`)}
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{audit.id}</div>
                    <div className="text-sm text-gray-600">{audit.location}</div>
                    <div className="text-xs text-gray-500">
                      {audit.technician} • {audit.date}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getSeverityColor(audit.severity)}>
                      {audit.severity}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {audit.issues} issues
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Incidents
              <Button variant="outline" size="sm" onClick={() => navigate("/incidents")}>View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div 
                  key={incident.id} 
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate(`/incident/details/${incident.id}`)}
                >
                  <div className="space-y-1 flex-1">
                    <div className="font-medium text-sm">{incident.id}</div>
                    <div className="text-sm text-gray-900">{incident.description}</div>
                    <div className="text-xs text-gray-500">{incident.location}</div>
                    <div className="text-xs text-gray-500">Assigned: {incident.assignee}</div>
                  </div>
                  <div className="text-right space-y-1 ml-4">
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports - Full Width Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Reports
            <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>View All</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReports.map((report) => (
              <div 
                key={report.id} 
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => navigate(`/report/details/${report.id}`)}
              >
                <div className="space-y-1 flex-1">
                  <div className="font-medium text-sm">{report.name}</div>
                  <div className="text-sm text-gray-600">{report.type}</div>
                  <div className="text-xs text-gray-500">
                    Generated: {report.generated}
                  </div>
                  <div className="text-xs text-gray-500">
                    Size: {report.size} • {report.format}
                  </div>
                </div>
                <div className="text-right space-y-1 ml-4">
                  <Badge variant="outline" className="text-xs">
                    {report.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;