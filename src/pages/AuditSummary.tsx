
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, User, CheckCircle, AlertTriangle } from "lucide-react";

const AuditSummary = () => {
  const navigate = useNavigate();
  const [auditDetails, setAuditDetails] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('auditDetails');
    if (!stored) {
      navigate("/audit/start");
      return;
    }
    setAuditDetails(JSON.parse(stored));
  }, [navigate]);

  const handleSubmit = () => {
    if (auditDetails) {
      const finalAudit = {
        ...auditDetails,
        completedAt: new Date().toISOString(),
        auditId: `AUD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
      };
      
      // Store in localStorage for persistence (in real app, this would go to backend)
      const existingAudits = JSON.parse(localStorage.getItem('completedAudits') || '[]');
      existingAudits.push(finalAudit);
      localStorage.setItem('completedAudits', JSON.stringify(existingAudits));
      
      sessionStorage.removeItem('auditDetails');
      navigate("/audit/complete");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!auditDetails) {
    return <div>Loading...</div>;
  }

  const hasIssues = auditDetails.issues && auditDetails.issues.length > 0;
  const criticalIssues = hasIssues ? auditDetails.issues.filter(i => i.severity === 'Critical').length : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Summary</h1>
        <p className="text-gray-600">Review your audit details before submission.</p>
      </div>

      <div className="space-y-6">
        {/* Audit Details */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{auditDetails.datacenter} / {auditDetails.dataHall}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Technician</div>
                  <div className="font-medium">{auditDetails.technician}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Started</div>
                  <div className="font-medium">{new Date(auditDetails.startTime).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {hasIssues ? (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <span>Issues Found</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasIssues ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-900">No Issues Found</div>
                <div className="text-gray-500">The audit completed successfully with no incidents to report.</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium">
                    {auditDetails.issues.length} issue{auditDetails.issues.length !== 1 ? 's' : ''} logged
                  </div>
                  {criticalIssues > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {criticalIssues} Critical
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  {auditDetails.issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium">{issue.scope} - {issue.alertType}</div>
                          {issue.rack && (
                            <div className="text-sm text-gray-600">
                              Location: {issue.rack}{issue.tile ? ` / ${issue.tile}` : ''}
                            </div>
                          )}
                          {issue.device && (
                            <div className="text-sm text-gray-600">
                              Device: {issue.device} ({issue.deviceId})
                            </div>
                          )}
                        </div>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                      {issue.comments && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {issue.comments}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/audit/issues")}>
            Back to Edit
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-hpe-green hover:bg-hpe-green/90"
          >
            Submit Audit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditSummary;
