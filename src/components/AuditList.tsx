import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Plus, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { fetchDatacenters, fetchDataHalls } from "@/data/locations";
import { supabase } from "@/integrations/supabase/client";

const AuditList = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filters, setFilters] = useState({
    datacenter: "all",
    dataHall: "all"
  });
  // Define Audit type
  interface Audit {
    id: string;
    custom_audit_id?: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
    datacenter_id?: string;
    datahall_id?: string;
    auditor_id: string;
    start_time?: string;
    end_time?: string;
    severity?: string;
    datacenter?: { name: string };
    datahall?: { name: string };
    auditor?: { name: string };
  }

  const [audits, setAudits] = useState<Audit[]>([]);
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [dataHalls, setDataHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch audits and datacenters on mount
  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      const { data: auditsData } = await supabase
        .from('audits')
        .select(`
          *,
          datacenter:datacenters!audits_datacenter_id_fkey(name),
          datahall:datahalls!audits_datahall_id_fkey(name)
        `)
        .order('created_at', { ascending: false }) as { data: Audit[] | null };
      
      // Fetch auditor data separately since there's no FK relationship
      if (auditsData) {
        const auditorIds = [...new Set(auditsData.map(audit => audit.auditor_id))];
        const { data: auditorsData } = await supabase
          .from('auditors')
          .select('id, name')
          .in('id', auditorIds);
        
        // Map auditor names to audits
        const auditorsMap = new Map(auditorsData?.map(auditor => [auditor.id, auditor]) || []);
        const enrichedAudits = auditsData.map(audit => ({
          ...audit,
          auditor: auditorsMap.get(audit.auditor_id)
        }));
        
        setAudits(enrichedAudits);
      } else {
        setAudits([]);
      }
      const dcs = await fetchDatacenters();
      setDatacenters(dcs || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Fetch data halls when datacenter changes
  useEffect(() => {
    if (filters.datacenter !== "all") {
      fetchDataHalls(filters.datacenter).then((halls) => {
        setDataHalls(halls || []);
      });
    } else {
      setDataHalls([]);
    }
  }, [filters.datacenter]);

  // Reset data hall when datacenter changes
  const handleDatacenterChange = (value: string) => {
    setFilters({
      ...filters,
      datacenter: value,
      dataHall: "all"
    });
  };

  // Filter audits by datacenter and data hall (if those fields exist in audit)
  const filteredAudits = audits.filter(audit => {
    const matchesDatacenter = filters.datacenter === "all" || audit.datacenter_id === filters.datacenter;
    const matchesDataHall = filters.dataHall === "all" || audit.datahall_id === filters.dataHall;
    return matchesDatacenter && matchesDataHall;
  });

  const getSeverityVariant = (severity: string) => {
    switch (severity?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
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
                  {datacenters.map(dc => <SelectItem key={dc.id} value={dc.id}>{dc.name}</SelectItem>)}
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
                  {dataHalls.map(hall => <SelectItem key={hall.id} value={hall.id}>{hall.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit List */}
      <div className="grid gap-4">
        {filteredAudits.map(audit => 
          <Card key={audit.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4" 
                style={{borderLeftColor: getSeverityVariant(audit.severity) === 'critical' ? 'hsl(var(--hpe-red))' : getSeverityVariant(audit.severity) === 'medium' ? 'hsl(var(--hpe-orange))' : getSeverityVariant(audit.severity) === 'low' ? 'hsl(var(--hpe-yellow))' : 'hsl(var(--hpe-brand))'}}
                onClick={() => navigate(`/audits/${audit.id}`)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Left Section - Main Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-hpe-brand/10 to-hpe-brand/20 flex items-center justify-center">
                      <Clipboard className="h-6 w-6 text-hpe-brand" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {audit.datacenter?.name || 'Unknown'} / {audit.datahall?.name || 'Unknown'}
                        </h3>
                        <Badge variant={getStatusVariant(audit.status)} className="flex-shrink-0">
                          {audit.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {audit.custom_audit_id || `#${audit.id.substring(0, 8)}`}
                      </div>
                    </div>
                    
                    {/* Details Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <span className="font-medium">Auditor:</span>
                          <span className="ml-1">{audit.auditor?.name || 'Unknown'}</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(audit.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Summary Row */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Completed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Duration: {audit.start_time && audit.end_time ? 
                          `${Math.round((new Date(audit.end_time).getTime() - new Date(audit.start_time).getTime()) / 60000)}m` : 
                          'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span className="text-gray-600">Issues Found: TBD</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Section - Actions */}
                <div className="flex flex-col space-y-2 ml-6 flex-shrink-0">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-hpe-brand hover:bg-hpe-brand/90 text-white min-w-[120px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/audits/${audit.id}`);
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="min-w-[120px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Generate Report
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="min-w-[120px] text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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