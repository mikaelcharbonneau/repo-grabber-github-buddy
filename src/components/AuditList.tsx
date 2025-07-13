import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Plus, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { locationData, getDataHallsByDatacenter } from "@/data/locations";
const AuditList = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filters, setFilters] = useState({
    datacenter: "all",
    dataHall: "all"
  });

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
  const audits = [{
    id: "AUD-2024-001",
    location: "Quebec, Canada / Island 1",
    technician: "Mikael Charbonneau",
    date: "2024-01-15",
    time: "14:30",
    issues: 2,
    severity: "Medium",
    status: "Completed",
    description: "Routine quarterly inspection",
    deviceIssues: {
      RDHX: 1,
      PDU: 0,
      PSU: 1,
      CDU: 0
    }
  }, {
    id: "AUD-2024-002",
    location: "Rjukan, Norway / Island 1",
    technician: "Javier Montoya",
    date: "2024-01-14",
    time: "09:15",
    issues: 0,
    severity: "None",
    status: "Completed",
    description: "Monthly infrastructure check",
    deviceIssues: {
      RDHX: 0,
      PDU: 0,
      PSU: 0,
      CDU: 0
    }
  }, {
    id: "AUD-2024-003",
    location: "Dallas, United States / Island 2",
    technician: "Clifford Chimezie",
    date: "2024-01-13",
    time: "16:45",
    issues: 5,
    severity: "Critical",
    status: "Under Review",
    description: "Emergency inspection - power anomalies",
    deviceIssues: {
      RDHX: 2,
      PDU: 2,
      PSU: 1,
      CDU: 0
    }
  }, {
    id: "AUD-2024-004",
    location: "Houston, United States / H20 Lab",
    technician: "Leena Saini",
    date: "2024-01-12",
    time: "11:20",
    issues: 1,
    severity: "Low",
    status: "Completed",
    description: "Follow-up inspection",
    deviceIssues: {
      RDHX: 0,
      PDU: 0,
      PSU: 0,
      CDU: 1
    }
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
      case 'under review':
        return 'medium';
      case 'in progress':
        return 'low';
      default:
        return 'outline';
    }
  };
  const filteredAudits = audits.filter(audit => {
    // For demo purposes, we'll filter based on location text matching
    // In a real app, audits would have datacenter/datahall IDs
    const matchesDatacenter = filters.datacenter === "all" || locationData.find(dc => dc.id === filters.datacenter)?.name === audit.location.split(' / ')[0];
    const matchesDataHall = filters.dataHall === "all" || availableDataHalls.find(dh => dh.id === filters.dataHall)?.name === audit.location.split(' / ')[1];
    return matchesDatacenter && matchesDataHall;
  });
  return <div className="py-6 px-[50px] space-y-6">
      <div className="w-full space-y-6">

      {/* Filters */}
      <Card className="w-full bg-inherit py-0">
        <CardHeader className="p-6 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">Audit Management</CardTitle>
            </div>
            <div></div>
            <div className="flex justify-end">
              <Button onClick={() => navigate('/audit/start')} className="bg-hpe-green hover:bg-hpe-green/90 text-slate-950">
                <Plus className="mr-2 h-4 w-4" />
                Start New Audit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 h-full ">
          <div className="flex justify-center items-center max-h-full h-full ">
            <div className="grid grid-cols-1 grid-cols-3 gap-8 items-stretch max-h-full w-full max-w-8xl">
            <div className="h-12">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full h-full" />
            </div>
            
            <div className="h-12">
              <Select value={filters.datacenter} onValueChange={handleDatacenterChange}>
                <SelectTrigger className="h-full">
                  <SelectValue placeholder="All Datacenters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Datacenters</SelectItem>
                  {locationData.map(datacenter => <SelectItem key={datacenter.id} value={datacenter.id}>
                      {datacenter.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-12">
              <Select value={filters.dataHall} onValueChange={value => setFilters({
                  ...filters,
                  dataHall: value
                })} disabled={filters.datacenter === "all"}>
                <SelectTrigger className="h-full text-center">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit List */}
      <div className="grid gap-4">
        {filteredAudits.map(audit => <Card key={audit.id} accentColor={getSeverityVariant(audit.severity) === 'critical' ? 'border-hpe-red' : getSeverityVariant(audit.severity) === 'medium' ? 'border-hpe-orange' : getSeverityVariant(audit.severity) === 'low' ? 'border-hpe-yellow' : 'border-hpe-brand'} className="hover:shadow-hpe-brand transition-shadow cursor-pointer" onClick={() => navigate(`/audits/${audit.id}`)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 max-w-sm flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{audit.id}</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{audit.location}</p>
                  <p className="text-gray-600">{audit.technician}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{audit.date} at {audit.time}</span>
                    <span>•</span>
                    <span>{audit.issues} issues found</span>
                  </div>
                </div>
                
                
                <div className="min-w-[300px] flex flex-col items-center justify-center py-4 my-auto">
                  <div className="text-xs text-gray-500 mb-6 text-center">Issues by Device</div>
                  <div className="grid grid-cols-7 gap-0 mx-0 items-center">
                    {Object.entries(audit.deviceIssues).map(([device, count], index) => <>
                        <div key={device} className="text-center">
                          <div className="text-sm text-gray-400 mb-1 font-medium">{device}</div>
                          <div className="text-3xl font-bold">{count}</div>
                        </div>
                        {index < 3 && <div key={`separator-${index}`} className="h-12 w-px bg-gray-200 mx-[24px]"></div>}
                      </>)}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/audits/${audit.id}`)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm">
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {filteredAudits.length === 0 && <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <Clipboard className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No audits found</h3>
              <p>Try adjusting your search criteria or create a new audit.</p>
            </div>
          </CardContent>
        </Card>}
      </div>
    </div>;
};
export default AuditList;