import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Helper function to get severity variant
const getSeverityVariant = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'critical';
    case 'medium': return 'medium';
    case 'low': return 'low';
    default: return 'default';
  }
};
import { ClipboardCheck, Shield, Circle, Plus, ArrowUp, ArrowDown, FileText, Building, Filter, Calendar, ExternalLink, Clipboard, Share2 } from "lucide-react";

// Device alias mapping
const DEVICE_ALIASES: Record<string, string> = {
  'Rear Door Heat Exchanger': 'RDHX',
  'Power Distribution Unit': 'PDU',
  'Power Supply Unit': 'PSU',
  'Cooling Distribution Unit': 'CDU',
  'Uninterruptible Power Supply': 'UPS',
  'Computer Room Air Conditioner': 'CRAC',
  'Computer Room Air Handler': 'CRAH'
};

// Helper function to get device alias
const getDeviceAlias = (deviceName: string): string => {
  return DEVICE_ALIASES[deviceName] || deviceName;
};
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDatacenters, fetchDataHalls } from "@/data/locations";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
const Dashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    datacenter: "all",
    dataHall: "all"
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Supabase state
  const [allAudits, setAllAudits] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [dataHalls, setDataHalls] = useState<any[]>([]);
  
  // Monthly comparison data
  const [currentMonthStats, setCurrentMonthStats] = useState({
    completedAudits: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    reportsGenerated: 0
  });
  const [lastMonthStats, setLastMonthStats] = useState({
    completedAudits: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    reportsGenerated: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Fetch recent audits with related data
        const { data: audits, error: auditsError } = await supabase
          .from('audits')
          .select(`
            *,
            datacenter:datacenters!audits_datacenter_id_fkey(name),
            datahall:datahalls!audits_datahall_id_fkey(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        if (auditsError) throw auditsError;
        
        // Fetch auditor data separately since there's no FK relationship
        if (audits && audits.length > 0) {
          const auditorIds = [...new Set(audits.map(audit => audit.auditor_id))];
          const { data: auditorsData } = await supabase
            .from('auditors')
            .select('id, name')
            .in('id', auditorIds);

          // Fetch incidents data for recent audits
          const auditIds = audits.map(audit => audit.id);
          const { data: incidentsData } = await supabase
            .from('incidents')
            .select('audit_id, status')
            .in('audit_id', auditIds);

          // Create incidents count map
          const incidentsMap = new Map();
          incidentsData?.forEach(incident => {
            if (!incidentsMap.has(incident.audit_id)) {
              incidentsMap.set(incident.audit_id, {
                reported: 0,
                resolved: 0,
                active: 0
              });
            }
            const counts = incidentsMap.get(incident.audit_id);
            counts.reported += 1;
            if (incident.status === 'resolved') {
              counts.resolved += 1;
            } else {
              counts.active += 1;
            }
          });

          // Map auditor names and incident counts to audits
          const auditorsMap = new Map(auditorsData?.map(auditor => [auditor.id, auditor]) || []);
          const enrichedAudits = audits.map(audit => ({
            ...audit,
            auditor: auditorsMap.get(audit.auditor_id),
            incidents: incidentsMap.get(audit.id) || {
              reported: 0,
              resolved: 0,
              active: 0
            }
          }));
          setAllAudits(enrichedAudits);
          setRecentAudits(enrichedAudits);
        } else {
          setAllAudits([]);
          setRecentAudits([]);
        }

        // Fetch recent incidents
        const { data: incidents, error: incidentsError } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (incidentsError) throw incidentsError;
        setRecentIncidents(incidents || []);

        // Fetch current month data
        const { data: currentAudits } = await supabase
          .from('audits')
          .select('*')
          .gte('created_at', currentMonthStart.toISOString());
        
        const { data: currentIncidents } = await supabase
          .from('incidents')
          .select('*')
          .gte('created_at', currentMonthStart.toISOString());

        // Fetch last month data
        const { data: lastAudits } = await supabase
          .from('audits')
          .select('*')
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString());
        
        const { data: lastIncidents } = await supabase
          .from('incidents')
          .select('*')
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString());

        // Calculate current month stats
        setCurrentMonthStats({
          completedAudits: (currentAudits || []).filter(a => a.status === 'completed').length,
          activeIncidents: (currentIncidents || []).filter(i => i.status === 'open').length,
          resolvedIncidents: (currentIncidents || []).filter(i => i.status === 'resolved').length,
          reportsGenerated: 0 // Mock data
        });

        // Calculate last month stats
        setLastMonthStats({
          completedAudits: (lastAudits || []).filter(a => a.status === 'completed').length,
          activeIncidents: (lastIncidents || []).filter(i => i.status === 'open').length,
          resolvedIncidents: (lastIncidents || []).filter(i => i.status === 'resolved').length,
          reportsGenerated: 0 // Mock data
        });

        // Mock recent reports (reports table doesn't exist)
        setRecentReports([]);

        // Fetch datacenters
        const dcs = await fetchDatacenters();
        setDatacenters(dcs || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  // Apply filters when filters or date range change
  useEffect(() => {
    const filteredAudits = allAudits.filter(audit => {
      // Date range filter
      const matchesDateRange = !dateRange?.from || !dateRange?.to || 
        (new Date(audit.created_at) >= dateRange.from && 
         new Date(audit.created_at) <= new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000 - 1));
      
      // Datacenter filter  
      const matchesDatacenter = filters.datacenter === "all" || audit.datacenter_id === filters.datacenter;
      
      // Data hall filter
      const matchesDataHall = filters.dataHall === "all" || audit.datahall_id === filters.dataHall;
      
      return matchesDateRange && matchesDatacenter && matchesDataHall;
    });
    setRecentAudits(filteredAudits);
  }, [allAudits, filters, dateRange]);

  // Reset data hall when datacenter changes
  const handleDatacenterChange = (value: string) => {
    setFilters({
      ...filters,
      datacenter: value,
      dataHall: "all"
    });
  };

  // Helper function to calculate change percentage and type
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? { change: `+${current}`, changeType: "increase" as const } : { change: "0", changeType: "neutral" as const };
    }
    
    const diff = current - previous;
    const percentage = Math.round((diff / previous) * 100);
    
    if (diff > 0) {
      return { change: `+${percentage}%`, changeType: "increase" as const };
    } else if (diff < 0) {
      return { change: `${percentage}%`, changeType: "decrease" as const };
    } else {
      return { change: "0%", changeType: "neutral" as const };
    }
  };

  // Calculate stats with real month-over-month comparison
  const completedAuditsChange = calculateChange(currentMonthStats.completedAudits, lastMonthStats.completedAudits);
  const activeIncidentsChange = calculateChange(currentMonthStats.activeIncidents, lastMonthStats.activeIncidents);
  const resolvedIncidentsChange = calculateChange(currentMonthStats.resolvedIncidents, lastMonthStats.resolvedIncidents);
  const reportsChange = calculateChange(currentMonthStats.reportsGenerated, lastMonthStats.reportsGenerated);

  const stats = [
    {
      title: "Completed Audits",
      value: currentMonthStats.completedAudits.toString(),
      change: completedAuditsChange.change,
      changeType: completedAuditsChange.changeType,
      icon: ClipboardCheck,
      color: "text-hpe-brand"
    },
    {
      title: "Active Incidents",
      value: currentMonthStats.activeIncidents.toString(),
      change: activeIncidentsChange.change,
      changeType: activeIncidentsChange.changeType,
      icon: Shield,
      color: "text-orange-600"
    },
    {
      title: "Resolved Incidents",
      value: currentMonthStats.resolvedIncidents.toString(),
      change: resolvedIncidentsChange.change,
      changeType: resolvedIncidentsChange.changeType,
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Reports Generated",
      value: currentMonthStats.reportsGenerated.toString(),
      change: reportsChange.change,
      changeType: reportsChange.changeType,
      icon: FileText,
      color: "text-purple-600"
    }
  ];

  const getSeverityVariant = (severity: string) => {
    if (!severity) return 'hpe';
    
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
        <Card className="w-full bg-inherit py-0">
          <CardHeader className="p-6 pb-0 py-[20px]">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="">
                <CardTitle className="font-bold text-gray-900 mb-4 text-left">Dashboard</CardTitle>
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
                  {datacenters.map(dc => <SelectItem key={dc.id} value={dc.id}>{dc.name}</SelectItem>)}
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
                  {dataHalls.map(hall => <SelectItem key={hall.id} value={hall.id}>{hall.name}</SelectItem>)}
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
            if (stat.title === "Completed Audits") navigate("/audits");
            else if (stat.title === "Active Incidents") navigate("/incidents?status=open");
            else if (stat.title === "Resolved Incidents") navigate("/incidents?status=resolved");
            else if (stat.title === "Reports Generated") navigate("/reports");
          }}>
                <CardHeader className="flex flex-row items-center justify-center gap-3 min-h-[60px] py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 leading-none">
                      {stat.title}
                    </span>
                    <stat.icon className={`h-4 w-4 ${stat.color} shrink-0`} style={{
                  marginTop: 0,
                  marginBottom: 0
                }} />
                  </div>
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
                {recentAudits.map(audit => (
                    <Card key={audit.id} accentColor={getSeverityVariant(audit.severity) === 'critical' ? 'border-hpe-red' : getSeverityVariant(audit.severity) === 'medium' ? 'border-hpe-orange' : getSeverityVariant(audit.severity) === 'low' ? 'border-hpe-yellow' : 'border-hpe-brand'} className="hover:shadow-hpe-brand transition-shadow cursor-pointer" onClick={() => navigate(`/audits/${audit.id}`)}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 min-w-0 flex-1">
                            <div className="flex-shrink-0 self-start sm:self-auto">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Clipboard className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-gray-900 font-medium text-sm sm:text-base leading-tight">
                                {audit.datacenter?.name || 'Unknown'} / {audit.datahall?.name || 'Unknown'}
                              </p>
                              <p className="text-gray-600 text-sm leading-relaxed mt-1">
                                {audit.auditor?.name || 'Unknown Auditor'}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                                <span className="break-all">{audit.custom_audit_id || `Audit #${audit.id.substring(0, 8)}`}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{new Date(audit.created_at).toLocaleDateString()}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{audit.status}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Incidents Section */}
                          <div className="text-center lg:text-right shrink-0">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Incidents</h3>
                            <div className="flex items-center justify-center lg:justify-end space-x-4 sm:space-x-8 text-xs sm:text-sm">
                              <div className="text-center">
                                <div className="text-lg sm:text-2xl font-bold text-gray-900">{audit.incidents?.reported || 0}</div>
                                <div className="text-gray-500 text-xs">Reported</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg sm:text-2xl font-bold text-hpe-green">{audit.incidents?.resolved || 0}</div>
                                <div className="text-gray-500 text-xs">Resolved</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg sm:text-2xl font-bold text-black">{audit.incidents?.active || 0}</div>
                                <div className="text-gray-500 text-xs">Active</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/audits/${audit.id}`)} className="flex flex-col items-center h-auto py-3 px-4">
                              <Clipboard className="h-4 w-4 mb-1" />
                              <span className="text-xs">View Details</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex flex-col items-center h-auto py-3 px-4">
                              <FileText className="h-4 w-4 mb-1" />
                              <span className="text-xs">Generate Report</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex flex-col items-center h-auto py-3 px-4">
                              <Share2 className="h-4 w-4 mb-1" />
                              <span className="text-xs">Copy Link</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                    <div key={incident.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative" onClick={() => navigate(`/incidents/${incident.id}`)}>
                      <div className="absolute right-4 top-4">
                        <Badge 
                          variant="outline"
                          className={`text-xs border-2 ${
                            incident.status === 'resolved' 
                              ? "border-green-500 text-green-600 hover:bg-green-50" 
                              : "border-red-500 text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {incident.status === 'resolved' ? "Resolved" : "Active"}
                        </Badge>
                      </div>
                      <div className="pr-16">
                        <div className="font-medium text-lg mb-1">
                          {incident.title ? (
                            // If title exists, extract the device part and apply alias
                            (() => {
                              const parts = incident.title.split(' - ');
                              if (parts.length > 1) {
                                const devicePart = parts[0];
                                const rest = parts.slice(1).join(' - ');
                                return `${getDeviceAlias(devicePart)} - ${rest}`;
                              }
                              return getDeviceAlias(incident.title);
                            })()
                          ) : (
                            // Fallback if no title
                            'Untitled Incident'
                          )}
                        </div>
                        
                        {incident.device && (
                          <div className="text-sm text-gray-600">
                            {getDeviceAlias(incident.device)}{incident.impacted_unit ? `-${incident.impacted_unit}` : ''} : {incident.alert_type || 'No type specified'}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-gray-600 mt-2">
                          {incident.tile_location && (
                            <div><strong>Location:</strong> {incident.tile_location}</div>
                          )}
                          {incident.device_id && (
                            <div><strong>Device ID:</strong> {incident.device_id}</div>
                          )}
                          {incident.u_height && (
                            <div><strong>U-Height:</strong> {incident.u_height}</div>
                          )}
                          <div className="whitespace-nowrap"><strong>Created:</strong> {new Date(incident.created_at).toLocaleString()}</div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                            {incident.datacenter_alias && (
                              <div className="flex items-center">
                                <Building className="h-3 w-3 mr-1 text-gray-500" />
                                <span>{incident.datacenter_alias}</span>
                              </div>
                            )}
                            {incident.datahall_alias && (
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-gray-500">
                                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                  <line x1="16" x2="16" y1="2" y2="6"></line>
                                  <line x1="8" x2="8" y1="2" y2="6"></line>
                                  <line x1="3" x2="21" y1="10" y2="10"></line>
                                </svg>
                                <span>{incident.datahall_alias}</span>
                              </div>
                            )}
                            {incident.tile_location && (
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-gray-500">
                                  <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16v-2"></path>
                                  <path d="M7.5 4.27 9 5.2"></path>
                                  <path d="M3.29 7 12 12l8.71-5"></path>
                                  <path d="M12 22.08V12"></path>
                                </svg>
                                <span>Cabinet {incident.tile_location}</span>
                              </div>
                            )}
                          </div>
                        </div>
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
                {recentReports.map(report => <div key={report.id} onClick={() => navigate(`/report/details/${report.id}`)} className="relative flex items-start justify-between p-3 rounded-lg border border-gray-200 bg-zinc-50 hover:border-gray-600 hover:shadow-md cursor-pointer transition-all duration-200">
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