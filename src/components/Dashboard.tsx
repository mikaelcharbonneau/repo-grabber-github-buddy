import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Shield, Circle, Plus, ArrowUp, ArrowDown, FileText, Building, Filter, Calendar, ExternalLink } from "lucide-react";
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
                <div className="space-y-4">
                  {recentAudits.map(audit => <div key={audit.id} onClick={() => navigate(`/audits/${audit.id}`)} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-zinc-50 hover:border-gray-600 hover:shadow-md cursor-pointer transition-all duration-200">
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
                  {recentIncidents.map(incident => <div key={incident.id} onClick={() => navigate(`/incident/details/${incident.id}`)} className="flex items-start gap-4 p-3 rounded-lg border border-gray-200 bg-zinc-50 hover:border-gray-600 hover:shadow-md cursor-pointer transition-all duration-200">
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