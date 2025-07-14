
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Plus, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { locationData } from "@/data/locations";
import { useReports, ReportGenerationParams } from "@/hooks/useReports";
import { format } from "date-fns";

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedDatacenters, setSelectedDatacenters] = useState<string[]>([]);
  const [selectedDataHalls, setSelectedDataHalls] = useState<string[]>([]);
  const [reportType, setReportType] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  
  const { generateReport, getReports, downloadReport, isGenerating } = useReports();

  const datacenters = locationData.map(dc => dc.name);

  const reportTypes = [
    { value: "audits", label: "Audits Report" },
    { value: "incidents", label: "Incidents Report" }
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const data = await getReports();
      setReports(data || []);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDatacenterChange = (datacenter: string, checked: boolean) => {
    if (checked) {
      setSelectedDatacenters([...selectedDatacenters, datacenter]);
      // Auto-select all data halls in this datacenter
      const dc = locationData.find(dc => dc.name === datacenter);
      if (dc) {
        const dataHallIds = dc.dataHalls.map(dh => `${dc.id}-${dh.id}`);
        const newDataHalls = [...selectedDataHalls, ...dataHallIds.filter(id => !selectedDataHalls.includes(id))];
        setSelectedDataHalls(newDataHalls);
      }
    } else {
      setSelectedDatacenters(selectedDatacenters.filter(dc => dc !== datacenter));
      // Auto-deselect all data halls in this datacenter
      const dc = locationData.find(dc => dc.name === datacenter);
      if (dc) {
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

  const handleGenerateReport = async () => {
    if (!reportType) return;

    const params: ReportGenerationParams = {
      reportType,
      datacenters: selectedDatacenters,
      dataHalls: selectedDataHalls,
      format: 'PDF'
    };

    if (dateRange?.from) {
      params.dateRange = {
        from: format(dateRange.from, 'yyyy-MM-dd'),
        to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange.from, 'yyyy-MM-dd')
      };
    }

    try {
      await generateReport(params);
      // Refresh reports list
      await loadReports();
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  const handleDownload = async (reportId: string) => {
    await downloadReport(reportId);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
                onClick={handleGenerateReport}
                className="bg-hpe-brand hover:bg-hpe-brand/90 text-white"
                disabled={!reportType || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Report'}
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
              {locationData.map((datacenter) => (
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
                    {datacenter.dataHalls.map((dataHall) => {
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
            {loadingReports ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading reports...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No reports found. Generate your first report to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-sm text-gray-600">{report.type}</div>
                      <div className="text-xs text-gray-500">
                        Generated: {report.generated_at ? new Date(report.generated_at).toLocaleString() : 'Processing...'}
                      </div>
                      {report.file_size && (
                        <div className="text-xs text-gray-500">
                          Size: {formatFileSize(report.file_size)} • {report.format}
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-1 ml-4">
                      <Badge className={getStatusColor(report.status)} variant="outline">
                        {report.status}
                      </Badge>
                      {report.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(report.id);
                          }}
                          className="mt-2"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Reports;
