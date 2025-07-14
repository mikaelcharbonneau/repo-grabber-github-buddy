import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Shield, Circle, Plus, ArrowUp, ArrowDown, FileText, Building, Filter, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { locationData, getDataHallsByDatacenter } from "@/data/locations";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useAuditsRealtime, useIncidentsRealtime, useReportsRealtime } from "@/hooks/useRealtime";
const Dashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    datacenter: "all",
    dataHall: "all"
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Supabase state
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch recent audits
      const { data: audits, error: auditsError } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (auditsError) throw auditsError;
      setRecentAudits(audits || []);

      // Fetch recent incidents
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(5);
      if (incidentsError) throw incidentsError;
      setRecentIncidents(incidents || []);

      // Fetch recent reports
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(5);
      if (reportsError) throw reportsError;
      setRecentReports(reports || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle realtime updates
  const handleRealtimeUpdate = useCallback(() => {
    console.log('Realtime update received, refreshing dashboard data...');
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up realtime subscriptions
  useAuditsRealtime(handleRealtimeUpdate);
  useIncidentsRealtime(handleRealtimeUpdate);
  useReportsRealtime(handleRealtimeUpdate);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
    color: "text-hpe-brand"
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading audits...</span>
                  </div>
                ) : recentAudits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No recent audits found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAudits.map(audit => (
                      <div key={audit.id} onClick={() => navigate(`/audits/${audit.id}`)} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-zinc-50 hover:border-gray-600 hover:shadow-md cursor-pointer transition-all duration-200">
                        <div className="space-y-1 flex-1">
                          <div className="font-medium text-sm">{audit.title || audit.id}</div>
                          <div className="text-sm text-gray-600">{audit.description || 'No description'}</div>
                          <div className="text-xs text-gray-500">
                            Created: {audit.created_at ? new Date(audit.created_at).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={audit.status === 'completed' ? 'default' : 'outline'}>
                            {audit.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading incidents...</span>
                  </div>
                ) : recentIncidents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No recent incidents found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentIncidents.map(incident => (
                      <div key={incident.id} onClick={() => navigate(`/incidents/${incident.id}`)} className="flex items-start gap-4 p-3 rounded-lg border border-gray-200 bg-zinc-50 hover:border-gray-600 hover:shadow-md cursor-pointer transition-all duration-200">
                        <div className="space-y-1 flex-1">
                          <div className="font-medium text-sm">{incident.title}</div>
                          <div className="text-sm text-gray-900">{incident.description}</div>
                          <div className="text-xs text-gray-500">
                            Detected: {incident.detected_at ? new Date(incident.detected_at).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={incident.priority === 'critical' ? 'destructive' : 'outline'}>
                            {incident.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading reports...</span>
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No recent reports found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentReports.map(report => (
                    <div key={report.id} onClick={() => navigate(`/reports/${report.id}`)} className="relative flex items-start justify-between p-3 rounded-lg border border-gray-200 bg-zinc-50 hover:border-gray-600 hover:shadow-md cursor-pointer transition-all duration-200">
                      <button className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors" onClick={e => {
                        e.stopPropagation();
                        navigate(`/reports/${report.id}`);
                      }}>
                        <ExternalLink className="h-3 w-3 text-gray-600" />
                      </button>
                      <div className="space-y-1 flex-1 pr-8">
                        <div className="font-medium text-sm">{report.name || report.type}</div>
                        <div className="text-sm text-gray-600">{report.description || 'No description'}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Generated: {report.generated_at ? new Date(report.generated_at).toLocaleDateString() : 'Processing...'}
                          </div>
                          <Badge variant="outline">{report.status}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          Format: {report.format}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Dashboard;