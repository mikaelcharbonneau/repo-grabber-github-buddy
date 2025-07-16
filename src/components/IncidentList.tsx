
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Shield, CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

const IncidentList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [datacenterFilter, setDatacenterFilter] = useState("all");
  const [datahallFilter, setDatahallFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [datahalls, setDatahalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Set initial status filter from URL parameters
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && ['open', 'in progress', 'resolved'].includes(statusParam)) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch incidents
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch datacenters
      const { data: datacentersData, error: datacentersError } = await supabase
        .from('datacenters')
        .select('*');
      
      if (incidentsError) console.error(incidentsError);
      if (datacentersError) console.error(datacentersError);
      
      setIncidents(incidentsData || []);
      setDatacenters(datacentersData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Fetch datahalls when datacenter changes
  useEffect(() => {
    if (datacenterFilter !== "all") {
      const fetchDatahalls = async () => {
        const { data, error } = await supabase
          .from('datahalls')
          .select('*')
          .eq('datacenter_id', datacenterFilter);
        
        if (error) console.error(error);
        setDatahalls(data || []);
      };
      fetchDatahalls();
    } else {
      setDatahalls([]);
      setDatahallFilter("all");
    }
  }, [datacenterFilter]);

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
    const matchesDatacenter = datacenterFilter === "all" || incident.datacenter_id === datacenterFilter;
    const matchesDatahall = datahallFilter === "all" || incident.datahall_id === datahallFilter;
    const matchesStatus = statusFilter === "all" || (incident.status?.toLowerCase() || '') === statusFilter;
    
    // Date range filter
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (incident.created_at && 
       new Date(incident.created_at) >= dateRange.from && 
       new Date(incident.created_at) <= dateRange.to);
    
    return matchesDatacenter && matchesDatahall && matchesStatus && matchesDateRange;
  });

  const handleIncidentClick = (incidentId: string) => {
    navigate(`/incidents/${incidentId}`);
  };

  return (
    <div className="p-6 space-y-6">

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
            <Button onClick={() => navigate('/incidents/new')} className="bg-hpe-brand hover:bg-hpe-brand/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Incident
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
            />
            <Select value={datacenterFilter} onValueChange={setDatacenterFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by datacenter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Datacenters</SelectItem>
                {datacenters.map(datacenter => (
                  <SelectItem key={datacenter.id} value={datacenter.id}>
                    {datacenter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={datahallFilter} onValueChange={setDatahallFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by datahall" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Datahalls</SelectItem>
                {datahalls.map(datahall => (
                  <SelectItem key={datahall.id} value={datahall.id}>
                    {datahall.name}
                  </SelectItem>
                ))}
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
