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
import { useAudits } from "@/hooks/useAudits";
const AuditList = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filters, setFilters] = useState({
    datacenter: "all",
    dataHall: "all"
  });
  
  const { audits, loading, error } = useAudits();

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
  // For now, we'll filter audits directly - in a real app you might want to filter on the server
  const filteredAudits = audits;
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
  return <div className="py-6 px-[50px] space-y-6">
      <div className="w-full space-y-6">

      {/* Filters */}
      <Card className="w-full bg-inherit py-0">
        <CardHeader className="p-6 pb-0 py-[20px]">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="">
              <CardTitle className="font-bold text-gray-900 mb-4 text-left">Audit Management</CardTitle>
            </div>
            <div className="bg-inherit"></div>
            <div className="flex justify-end">
              <Button onClick={() => navigate('/audit/start')} className="bg-hpe-brand hover:bg-hpe-brand/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Start New Audit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 h-full py-14px bg-white py-[14px]">
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

      {/* Loading and Error States */}
      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">Loading audits...</div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {/* Audit List */}
      {!loading && !error && (
        <div className="grid gap-4">
          {filteredAudits.map(audit => <Card key={audit.id} accentColor={getStatusVariant(audit.status) === 'hpe' ? 'border-hpe-brand' : getStatusVariant(audit.status) === 'medium' ? 'border-hpe-orange' : 'border-hpe-yellow'} className="hover:shadow-hpe-brand transition-shadow cursor-pointer" onClick={() => navigate(`/audits/${audit.id}`)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 max-w-sm flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">{audit.title}</h3>
                      <Badge variant={getStatusVariant(audit.status)}>{audit.status}</Badge>
                    </div>
                    <p className="text-gray-900 font-medium">{audit.description || 'No description'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(audit.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Last updated: {new Date(audit.updated_at).toLocaleDateString()}</span>
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
      )}

      {!loading && !error && filteredAudits.length === 0 && <Card>
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