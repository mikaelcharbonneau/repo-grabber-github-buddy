import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Clock,
  Loader2
} from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { supabase } from "@/integrations/supabase/client";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { downloadReport } = useReports();

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (report?.id) {
      await downloadReport(report.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Loading Report</h3>
            <p>Please wait while we fetch the report details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
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
            <p className="text-gray-600">{report.description || `${report.type} generated from system data`}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(report.status)}>
            {report.status}
          </Badge>
          {report.status === "completed" && report.file_path && (
            <Button 
              className="bg-hpe-brand hover:bg-hpe-brand/90 text-white"
              onClick={handleDownload}
            >
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
                <div className="font-medium">System Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Parameters</div>
                <div className="font-medium text-xs">
                  {report.parameters?.dateRange ? 
                    `${report.parameters.dateRange.from} to ${report.parameters.dateRange.to}` : 
                    'All data'
                  }
                </div>
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
                <div className="font-medium text-xs">
                  {report.generated_at ? new Date(report.generated_at).toLocaleString() : 'Processing...'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Report Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Report Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">Status</div>
                  <div className="text-xl font-bold">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">Format</div>
                  <div className="text-xl font-bold">{report.format}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">Size</div>
                  <div className="text-xl font-bold">
                    {report.file_size ? formatFileSize(report.file_size) : 'Calculating...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Report Type</div>
                    <div className="font-medium">{report.type}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Format</div>
                    <div className="font-medium">{report.format}</div>
                  </div>
                </div>
                {report.parameters && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-500 mb-2">Filters Applied</div>
                    <div className="space-y-2">
                      {report.parameters.dateRange && (
                        <div className="text-sm">
                          <span className="font-medium">Date Range:</span> {report.parameters.dateRange.from} to {report.parameters.dateRange.to}
                        </div>
                      )}
                      {report.parameters.datacenters && report.parameters.datacenters.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Datacenters:</span> {report.parameters.datacenters.join(', ')}
                        </div>
                      )}
                      {report.parameters.dataHalls && report.parameters.dataHalls.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Data Halls:</span> {report.parameters.dataHalls.length} selected
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                <span className="font-medium">
                  {report.file_size ? formatFileSize(report.file_size) : 'Calculating...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Downloads</span>
                <span className="font-medium">{report.download_count || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.status === "completed" && report.file_path && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {report.format}
                </Button>
              )}
              {report.status === "processing" && (
                <div className="flex items-center justify-center p-4 text-blue-600">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </div>
              )}
              {report.status === "failed" && (
                <div className="text-center p-4 text-red-600">
                  <AlertTriangle className="mx-auto h-6 w-6 mb-2" />
                  Generation Failed
                </div>
              )}
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