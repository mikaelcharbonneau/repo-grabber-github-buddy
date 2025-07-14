
import { useState } from "react";
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
import { locationData } from "@/data/locations";

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedDatacenters, setSelectedDatacenters] = useState<string[]>([]);
  const [selectedDataHalls, setSelectedDataHalls] = useState<string[]>([]);
  const [reportType, setReportType] = useState("");

  const datacenters = locationData.map(dc => dc.name);

  const reportTypes = [
    { value: "audits", label: "Audits Report" },
    { value: "incidents", label: "Incidents Report" }
  ];

  const recentReports = [
    {
      id: "RPT-2024-001",
      name: "January Audit Summary",
      type: "Audit Summary",
      generated: "2024-01-15 16:30",
      size: "2.3 MB",
      format: "CSV"
    },
    {
      id: "RPT-2024-002", 
      name: "Critical Incidents Q1",
      type: "Incident Detail",
      generated: "2024-01-14 09:15",
      size: "1.8 MB", 
      format: "PDF"
    },
    {
      id: "RPT-2024-003",
      name: "DC-EAST Compliance",
      type: "Compliance",
      generated: "2024-01-13 14:45",
      size: "945 KB",
      format: "CSV"
    }
  ];

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

  const generateReport = () => {
    console.log("Generating report with:", {
      reportType,
      dateRange,
      selectedDatacenters,
      selectedDataHalls
    });
    // Simulate report generation
    alert("Report generation started! You will be notified when it's ready for download.");
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
                disabled={!reportType}
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate Report
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReports.map((report) => (
                <div 
                  key={report.id} 
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg cursor-pointer transition-shadow"
                  onClick={() => navigate(`/report/details/${report.id}`)}
                >
                  <div className="space-y-1 flex-1">
                    <div className="font-medium text-sm">{report.name}</div>
                    <div className="text-sm text-gray-600">{report.type}</div>
                    <div className="text-xs text-gray-500">
                      Generated: {report.generated}
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Reports;
