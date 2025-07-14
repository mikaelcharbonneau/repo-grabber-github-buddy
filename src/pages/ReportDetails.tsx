import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar,
  User,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock report data - in a real app, this would come from an API
  const reportData = {
    "RPT-2024-001": {
      id: "RPT-2024-001",
      name: "January Audit Summary",
      type: "Audit Summary Report",
      generated: "2024-01-15 16:30",
      size: "2.3 MB",
      format: "PDF",
      status: "Ready",
      description: "Comprehensive summary of all audits conducted in January 2024",
      author: "System Generated",
      dataRange: "2024-01-01 to 2024-01-31",
      categories: ["Audits", "Infrastructure", "Compliance"],
      summary: {
        totalAudits: 47,
        issuesFound: 23,
        criticalIssues: 5,
        facilitiesAudited: 12
      },
      sections: [
        { name: "Executive Summary", pages: "1-2" },
        { name: "Audit Overview", pages: "3-8" },
        { name: "Issue Analysis", pages: "9-15" },
        { name: "Recommendations", pages: "16-18" },
        { name: "Appendices", pages: "19-24" }
      ],
      metrics: [
        { label: "Completion Rate", value: "98.5%", trend: "up" },
        { label: "Avg Resolution Time", value: "2.3 days", trend: "down" },
        { label: "Critical Issues", value: "5", trend: "up" },
        { label: "Compliance Score", value: "94.2%", trend: "up" }
      ]
    },
    "RPT-2024-002": {
      id: "RPT-2024-002",
      name: "Critical Incidents Q1",
      type: "Incident Detail Report",
      generated: "2024-01-14 09:15",
      size: "1.8 MB",
      format: "CSV",
      status: "Ready",
      description: "Detailed analysis of all critical incidents in Q1 2024",
      author: "Mike Johnson",
      dataRange: "2024-01-01 to 2024-03-31",
      categories: ["Incidents", "Critical", "Analysis"],
      summary: {
        totalIncidents: 156,
        criticalIncidents: 23,
        resolvedIncidents: 142,
        avgResolutionTime: "4.2 hours"
      },
      sections: [
        { name: "Incident Overview", pages: "Sheet 1" },
        { name: "Critical Analysis", pages: "Sheet 2" },
        { name: "Resolution Timeline", pages: "Sheet 3" },
        { name: "Root Cause Analysis", pages: "Sheet 4" }
      ],
      metrics: [
        { label: "Resolution Rate", value: "91.0%", trend: "up" },
        { label: "MTTR", value: "4.2 hrs", trend: "down" },
        { label: "Escalation Rate", value: "8.5%", trend: "down" },
        { label: "Repeat Issues", value: "12%", trend: "up" }
      ]
    },
    "RPT-2024-003": {
      id: "RPT-2024-003",
      name: "DC-EAST Compliance",
      type: "Compliance Report",
      generated: "2024-01-13 14:45",
      size: "945 KB",
      format: "PDF",
      status: "Processing",
      description: "Compliance assessment for DC-EAST facility",
      author: "Sarah Wilson",
      dataRange: "2024-01-01 to 2024-01-13",
      categories: ["Compliance", "DC-EAST", "Assessment"],
      summary: {
        complianceScore: "96.8%",
        passedChecks: 187,
        failedChecks: 6,
        exemptions: 2
      },
      sections: [
        { name: "Compliance Summary", pages: "1-3" },
        { name: "Detailed Assessment", pages: "4-12" },
        { name: "Non-Compliance Items", pages: "13-15" },
        { name: "Remediation Plan", pages: "16-18" }
      ],
      metrics: [
        { label: "Overall Score", value: "96.8%", trend: "up" },
        { label: "Security Score", value: "98.2%", trend: "stable" },
        { label: "Environmental", value: "94.5%", trend: "up" },
        { label: "Operations", value: "97.1%", trend: "up" }
      ]
    }
  };

  const report = reportData[id] || null;

  if (!report) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">Report Not Found</h3>
              <p>The requested report could not be found.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate("/reports")}
              >
                Back to Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowLeft className="h-3 w-3 text-green-500 rotate-45" />;
      case 'down': return <ArrowLeft className="h-3 w-3 text-red-500 -rotate-45" />;
      default: return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/reports")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
            <p className="text-gray-600">{report.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(report.status)}>
            {report.status}
          </Badge>
          {report.status === "Ready" && (
            <Button className="bg-hpe-brand hover:bg-hpe-brand/90 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download {report.format}
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <div className="font-medium">{report.type}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Author</div>
                <div className="font-medium">{report.author}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Data Range</div>
                <div className="font-medium text-xs">{report.dataRange}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Generated</div>
                <div className="font-medium text-xs">{report.generated}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Key Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.metrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">{metric.label}</div>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(report.summary).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-hpe-brand">{String(value)}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Report Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.sections.map((section, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-hpe-brand/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-hpe-brand">{index + 1}</span>
                      </div>
                      <span className="font-medium">{section.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{section.pages}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Info */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Format</span>
                <span className="font-medium">{report.format}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Size</span>
                <span className="font-medium">{report.size}</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">Categories</div>
                <div className="flex flex-wrap gap-1">
                  {report.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.status === "Ready" && (
                <>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download {report.format}
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Preview
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full">
                Schedule Report
              </Button>
              <Button variant="outline" className="w-full">
                Share Report
              </Button>
              <Button variant="outline" className="w-full">
                Archive
              </Button>
            </CardContent>
          </Card>

          {/* Report History */}
          <Card>
            <CardHeader>
              <CardTitle>Related Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">December Summary</div>
                  <div className="text-gray-500">RPT-2023-012</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">Q4 2023 Report</div>
                  <div className="text-gray-500">RPT-2023-Q4</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;