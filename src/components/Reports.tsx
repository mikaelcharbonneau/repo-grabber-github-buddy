
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Plus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { fetchDatacenters, fetchDataHalls } from "@/data/locations";
import { supabase } from "@/integrations/supabase/client";

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedDatacenters, setSelectedDatacenters] = useState<string[]>([]);
  const [selectedDataHalls, setSelectedDataHalls] = useState<string[]>([]);
  const [reportType, setReportType] = useState("");
  // State for report data and UI
  const [reportData, setReportData] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<Array<{
    id: string;
    name: string;
    type: string;
    generated_at: string;
    size: string;
    format: string;
  }>>([]);
  
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [dataHalls, setDataHalls] = useState<any[]>([]);
  const [selectedDatacenter, setSelectedDatacenter] = useState("");
  const [selectedDataHall, setSelectedDataHall] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      // Fetch datacenters and their datahalls
      const dcs = await fetchDatacenters();
      const datacentersWithHalls = await Promise.all(
        (dcs || []).map(async (dc) => {
          const halls = await fetchDataHalls(dc.id);
          return { ...dc, dataHalls: halls || [] };
        })
      );
      setDatacenters(datacentersWithHalls);
      
      // Load recent reports from localStorage or use empty array
      const savedReports = localStorage.getItem('recentReports');
      if (savedReports) {
        try {
          setRecentReports(JSON.parse(savedReports));
        } catch (e) {
          console.error('Failed to parse saved reports', e);
        }
      }
      
      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (selectedDatacenter) {
      fetchDataHalls(selectedDatacenter).then((halls) => {
        setDataHalls(halls || []);
      });
    } else {
      setDataHalls([]);
    }
  }, [selectedDatacenter]);

  const reportTypes = [
    { value: "audits", label: "Audits Report" },
    { value: "incidents", label: "Incidents Report" }
  ];

  const handleDatacenterChange = (datacenter: string, checked: boolean) => {
    if (checked) {
      setSelectedDatacenters([...selectedDatacenters, datacenter]);
      // Auto-select all data halls in this datacenter
      const dc = datacenters.find(dc => dc.name === datacenter);
      if (dc && dc.dataHalls) {
        const dataHallIds = dc.dataHalls.map(dh => `${dc.id}-${dh.id}`);
        const newDataHalls = [...selectedDataHalls, ...dataHallIds.filter(id => !selectedDataHalls.includes(id))];
        setSelectedDataHalls(newDataHalls);
      }
    } else {
      setSelectedDatacenters(selectedDatacenters.filter(dc => dc !== datacenter));
      // Auto-deselect all data halls in this datacenter
      const dc = datacenters.find(dc => dc.name === datacenter);
      if (dc && dc.dataHalls) {
        const dataHallIds = dc.dataHalls.map(dh => `${dc.id}-${dh.id}`);
        setSelectedDataHalls(selectedDataHalls.filter(dh => !dataHallIds.includes(dh)));
      }
    }
  };

  const handleDataHallChange = (dataHallId: string, checked: boolean) => {
    if (checked) {
      setSelectedDataHalls([...selectedDataHalls, dataHallId]);
    } else {
      setSelectedDataHalls(selectedDataHalls.filter(dh => dh !== dataHallId));
    }
  };

  const generateReport = async () => {
    if (!reportType) return;
    
    setIsGenerating(true);
    
    try {
      // Build the query based on report type and date range
      let query = supabase
        .from('incidents')
        .select('*');
      
      // Apply date range filter if specified
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        // Set end of day for the 'to' date
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }
      
      // Add any additional filters based on report type
      if (reportType === 'critical') {
        query = query.eq('severity', 'critical');
      } else if (reportType === 'open') {
        query = query.neq('status', 'resolved');
      } else if (reportType === 'resolved') {
        query = query.eq('status', 'resolved');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Update the report data state with the fetched data
      setReportData(data || []);
      
      // Generate and download the report
      downloadReport(data || []);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const downloadReport = (data: any[]) => {
    if (!data.length) {
      alert('No data found for the selected filters.');
      return;
    }
    
    try {
      // Format data for CSV
      const headers = [
        'ID', 'Title', 'Severity', 'Status', 'Datacenter', 
        'Datahall', 'Tile Location', 'Device ID', 'U-Height', 'Created At'
      ];
      
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      for (const row of data) {
        const values = [
          `"${row.formatted_id || row.id}"`,
          `"${row.title || ''}"`,
          `"${row.severity || ''}"`,
          `"${row.status || ''}"`,
          `"${row.datacenter_alias || ''}"`,
          `"${row.datahall_alias || ''}"`,
          `"${row.tile_location || ''}"`,
          `"${row.device_id || ''}"`,
          `"${row.u_height || ''}"`,
          `"${new Date(row.created_at).toLocaleString()}"`
        ];
        csvRows.push(values.join(','));
      }
      
      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on report type and date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `incident-report-${reportType}-${dateStr}.csv`;
      link.download = filename;
      
      // Save to recent reports
      const newReport = {
        id: `report-${Date.now()}`,
        name: `Incident Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
        type: 'Incidents',
        generated_at: new Date().toLocaleString(),
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        format: 'CSV'
      };
      
      // Update recent reports (keep only the last 5)
      const updatedReports = [newReport, ...recentReports].slice(0, 5);
      setRecentReports(updatedReports);
      localStorage.setItem('recentReports', JSON.stringify(updatedReports));
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error creating report file:', error);
      alert('Error creating report file. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">

      <div className="space-y-6">
        {/* Report Generation */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Reports
              </h1>
              <Button 
                onClick={generateReport}
                className="bg-hpe-brand hover:bg-hpe-brand/90 text-white"
                disabled={!reportType || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <DatePickerWithRange 
                  date={dateRange} 
                  setDate={setDateRange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-6">
              {datacenters.map((datacenter) => (
                <div key={datacenter.id} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`dc-${datacenter.name}`}
                      checked={selectedDatacenters.includes(datacenter.name)}
                      onCheckedChange={(checked) => 
                        handleDatacenterChange(datacenter.name, checked as boolean)
                      }
                    />
                    <Label htmlFor={`dc-${datacenter.name}`} className="text-lg font-semibold text-gray-900">
                      {datacenter.name}
                    </Label>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 ml-7">
                    {(datacenter.dataHalls || []).map((dataHall) => {
                      return (
                        <div key={dataHall.id} className="flex items-center space-x-2">
                           <Checkbox
                             id={`dh-${datacenter.id}-${dataHall.id}`}
                             checked={selectedDataHalls.includes(`${datacenter.id}-${dataHall.id}`)}
                             onCheckedChange={(checked) => 
                               handleDataHallChange(`${datacenter.id}-${dataHall.id}`, checked as boolean)
                             }
                          />
                          <Label 
                            htmlFor={`dh-${datacenter.id}-${dataHall.id}`} 
                            className="text-sm text-gray-700"
                          >
                            {dataHall.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => {
                      // For now, just show an alert since we don't have a report detail page
                      alert(`Report ${report.name} would open in a new view.`);
                    }}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-sm text-gray-600">{report.type}</div>
                      <div className="text-xs text-gray-500">
                        Generated: {report.generated_at}
                      </div>
                      <div className="text-xs text-gray-500">
                        Size: {report.size} • {report.format}
                      </div>
                    </div>
                    <div className="text-right space-y-1 ml-4">
                      <Badge variant="outline" className="text-xs">
                        Ready
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-6 text-gray-500">
                  No recent reports. Generate a report to see it here.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Reports;
