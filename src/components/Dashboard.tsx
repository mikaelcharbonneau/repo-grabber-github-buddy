import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Shield, Circle, Plus, ArrowUp, ArrowDown, FileText, Building, Filter, Calendar, ExternalLink } from "lucide-react";
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
    setFilters({
      ...filters,
      datacenter: value,
      dataHall: "all"
    });
  };
  const stats = [{
    title: "Completed Audits",
    value: "47",
    change: "+12%",
    changeType: "increase" as const,
    icon: ClipboardCheck,
    color: "text-hpe-green"
  }, {
    title: "Active Incidents",
    value: "8",
    change: "-23%",
    changeType: "decrease" as const,
    icon: Shield,
    color: "text-orange-600"
  }, {
    title: "Resolved Incidents",
    value: "24",
    change: "+3",
    changeType: "increase" as const,
    icon: Shield,
    color: "text-green-600"
  }, {
    title: "Reports Generated",
    value: "18",
    change: "+5",
    changeType: "increase" as const,
    icon: FileText,
    color: "text-purple-600"
  }];
  const recentAudits = [{
    id: "AUDIT #22",
    location: "Quebec, Canada - Island 1",
    technician: "John Doe",
    date: "2024-01-15",
    issues: 2,
    severity: "Medium"
  }, {
    id: "AUDIT #21",
    location: "Rjukan, Norway - Island 1",
    technician: "Jane Smith",
    date: "2024-01-14",
    issues: 0,
    severity: "None"
  }, {
    id: "AUDIT #20",
    location: "Dallas, United States - Island 3",
    technician: "Mike Johnson",
    date: "2024-01-13",
    issues: 5,
    severity: "Critical"
  }];
  const recentIncidents = [{
    id: "INC-2024-045",
    location: "DC-EAST / Hall-A / Rack-15",
    description: "PDU overcurrent alarm",
    severity: "Critical",
    status: "Open",
    assignee: "Tech Team Alpha"
  }, {
    id: "INC-2024-044",
    location: "DC-WEST / Hall-B / Rack-08",
    description: "Temperature sensor offline",
    severity: "Medium",
    status: "In Progress",
    assignee: "Tech Team Beta"
  }];
  const recentReports = [{
    id: "RPT-2024-001",
    reportType: "Incidents",
    location: "Quebec, Canada - All Datahalls",
    description: "Incidents from 2025-01-01 to 2025-01-15",
    generated: "2024-01-15 16:30",
    size: "2.3 MB",
    format: "PDF",
    status: "Ready"
  }, {
    id: "RPT-2024-002",
    reportType: "Incidents",
    location: "All Locations",
    description: "Incidents from 2024-10-01 to 2024-12-31",
    generated: "2024-01-14 09:15",
    size: "1.8 MB",
    format: "CSV",
    status: "Ready"
  }, {
    id: "RPT-2024-003",
    reportType: "Audits",
    location: "Rjukan, Norway - Island 1",
    description: "Audits from 2024-12-01 to 2024-12-31",
    generated: "2024-01-13 14:45",
    size: "945 KB",
    format: "PDF",
    status: "Processing"
  }, {
    id: "RPT-2024-004",
    reportType: "Audits",
    location: "All Locations",
    description: "Audits from 2024-12-01 to 2024-12-31",
    generated: "2024-01-12 11:20",
    size: "1.2 MB",
    format: "CSV",
    status: "Ready"
  }, {
    id: "RPT-2024-005",
    reportType: "Incidents",
    location: "All Locations",
    description: "Incidents from 2024-01-04 to 2024-01-11",
    generated: "2024-01-11 08:45",
    size: "678 KB",
    format: "PDF",
    status: "Ready"
  }, {
    id: "RPT-2024-006",
    reportType: "Audits",
    location: "All Locations",
    description: "Audits from 2024-01-01 to 2024-01-10",
    generated: "2024-01-10 15:30",
    size: "3.1 MB",
    format: "PDF",
    status: "Ready"
  }];
  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'hpe';
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'hpe';
      case 'in progress':
        return 'medium';
      case 'open':
        return 'critical';
      case 'resolved':
        return 'low';
      default:
        return 'outline';
    }
  };
  return <div className="p-6 mx-0 space-y-6">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader className="p-6 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">Dashboard</CardTitle>
              </div>
              <div></div>
              <div className="flex justify-end">
                <Button className="bg-hpe-green hover:bg-hpe-green/90" onClick={() => navigate('/audit/start')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Audit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full h-12" />
              </div>
              
              <Select value={filters.datacenter} onValueChange={handleDatacenterChange}>
                <SelectTrigger className="h-12 hover:bg-accent hover:text-accent-foreground">
                  <SelectValue placeholder="All Datacenters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Datacenters</SelectItem>
                  {locationData.map(datacenter => <SelectItem key={datacenter.id} value={datacenter.id}>
                      {datacenter.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select value={filters.dataHall} onValueChange={value => setFilters({
              ...filters,
              dataHall: value
            })} disabled={filters.datacenter === "all"}>
                <SelectTrigger className="h-12 hover:bg-accent hover:text-accent-foreground">
                  <SelectValue placeholder="All Data Halls" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data Halls</SelectItem>
                  {availableDataHalls.map(hall => <SelectItem key={hall.id} value={hall.id}>
                      {hall.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content - Centered */}
      <div className="flex justify-center">
        <div className="w-full space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(stat => <Card key={stat.title} accentColor={stat.title === 'Completed Audits' ? 'border-hpe-brand' : stat.title === 'Active Incidents' ? 'border-hpe-red' : stat.title === 'Reports Generated' ? 'border-hpe-blue' : ''} className="hover:shadow-hpe-brand transition-shadow cursor-pointer" onClick={() => {
            if (stat.title === "Completed Audits") navigate("/audits");else if (stat.title === "Active Incidents" || stat.title === "Resolved Incidents") navigate("/incidents");else if (stat.title === "Reports Generated") navigate("/reports");
          }}>
                <CardHeader className="flex-row items-center gap-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-4">
                    <div className="text-4xl font-extrabold tracking-tight">{stat.value}</div>
                    <div className="flex items-center text-xs text-gray-500">
                      {stat.changeType === 'increase' && <ArrowUp className="h-3 w-3 text-green-500 mr-1" />}
                      {stat.changeType === 'decrease' && <ArrowDown className="h-3 w-3 text-red-500 mr-1" />}
                      <span className={stat.changeType === 'increase' ? 'text-green-600' : stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'}>
                        {stat.change}
                      </span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
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
                  {recentAudits.map(audit => <div key={audit.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-400 cursor-pointer transition-colors" onClick={() => navigate(`/audit/details/${audit.id}`)}>
                      <div className="space-y-1 flex-1">
                        <div className="font-medium text-sm">{audit.id}</div>
                        <div className="text-sm text-gray-600">{audit.location}</div>
                        <div className="text-xs text-gray-500">
                          {audit.technician} • {audit.date}
                        </div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-xs text-gray-500 mb-1">Issues Found</div>
                        <div className="text-lg font-semibold">{audit.issues}</div>
                      </div>
                      <div className="text-right space-y-1">
                        
                          
                      </div>
                    </div>)}
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
                  {recentIncidents.map(incident => <div key={incident.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-400 cursor-pointer transition-colors" onClick={() => navigate(`/incident/details/${incident.id}`)}>
                      <div className="space-y-1 flex-1">
                        <div className="font-medium text-sm">{incident.id}</div>
                        <div className="text-sm text-gray-900">{incident.description}</div>
                        <div className="text-xs text-gray-500">{incident.location}</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-xs text-gray-500 mb-1">Assigned to</div>
                        <div className="text-sm font-medium">{incident.assignee}</div>
                      </div>
                      <div className="text-right space-y-1">
                        
                          
                        
                          
                      </div>
                    </div>)}
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
                {recentReports.map(report => <div key={report.id} className="relative flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-400 cursor-pointer transition-colors" onClick={() => navigate(`/report/details/${report.id}`)}>
                    <button className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors" onClick={e => {
                  e.stopPropagation();
                  navigate(`/report/details/${report.id}`);
                }}>
                      <ExternalLink className="h-3 w-3 text-gray-600" />
                    </button>
                    <div className="space-y-1 flex-1 pr-8">
                      <div className="font-medium text-sm">{report.reportType} | {report.location}</div>
                      <div className="text-sm text-gray-600">{report.description}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Generated: {report.generated}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2 hover:bg-transparent hover:text-hpe-brand">Download</Button>
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2 hover:bg-transparent hover:text-hpe-brand">Share</Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Size: {report.size} • {report.format}
                      </div>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Dashboard;