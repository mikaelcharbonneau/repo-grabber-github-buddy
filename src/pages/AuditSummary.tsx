
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, User, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateAuditId } from "@/utils/auditId";

const AuditSummary = () => {
  const navigate = useNavigate();
  const [auditDetails, setAuditDetails] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('auditDetails');
    if (!stored) {
      navigate("/audit/start");
      return;
    }
    setAuditDetails(JSON.parse(stored));
  }, [navigate]);

  const handleSubmit = async () => {
    if (auditDetails) {
      // Get current user's auditor ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to submit audit');
        return;
      }

      const { data: auditor } = await supabase
        .from('auditors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!auditor) {
        alert('Auditor profile not found');
        return;
      }

      const issuesFound = auditDetails.issues ? auditDetails.issues.length : 0;
      const finalAudit = {
        title: `Audit - ${auditDetails.datacenter}/${auditDetails.dataHall}`,
        description: `Audit of ${auditDetails.datacenter} datacenter, ${auditDetails.dataHall} hall. ${issuesFound} issues found.`,
        auditor_id: auditor.id,
        status: 'completed'
      };

      // Generate a unique audit ID
      const auditId = generateAuditId();
      
      // Add the generated ID to the audit data
      const auditWithId = {
        ...finalAudit,
        id: auditId
      };

      const { error: auditError } = await supabase
        .from('audits')
        .insert([auditWithId]);

      if (auditError) {
        console.error(auditError);
        alert('Failed to submit audit');
        return;
      }

      // Create incident records for each issue
      if (auditDetails.issues && auditDetails.issues.length > 0) {
        const incidents = auditDetails.issues.map(issue => ({
          title: `${issue.device || issue.deviceType} - ${issue.alertType}`,
          description: `Issue found in ${issue.rack}${issue.tile ? ` / ${issue.tile}` : ''}. Device: ${issue.device || issue.deviceType}${issue.impactedUnit ? ` (${issue.impactedUnit})` : ''}. Issue: ${issue.alertType}${issue.comments ? `. Notes: ${issue.comments}` : ''}`,
          severity: issue.severity?.toLowerCase() || 'medium',
          status: issue.resolved ? 'resolved' : 'open',
          auditor_id: auditor.id,
          audit_id: auditId
        }));

        const { error: incidentsError } = await supabase
          .from('incidents')
          .insert(incidents);

        if (incidentsError) {
          console.error(incidentsError);
          alert('Audit created but failed to create incident records');
          return;
        }
      }

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

  const handleEditIssue = (issue, index) => {
    setEditingIssue({ ...issue, index });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingIssue && auditDetails) {
      const updatedIssues = auditDetails.issues.map((issue, i) => 
        i === editingIssue.index ? editingIssue : issue
      );
      const updatedDetails = { ...auditDetails, issues: updatedIssues };
      setAuditDetails(updatedDetails);
      sessionStorage.setItem('auditDetails', JSON.stringify(updatedDetails));
      setEditDialogOpen(false);
      setEditingIssue(null);
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
                </div>
                
                <div className="space-y-3">
                  {auditDetails.issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-1">
                            <div className="font-medium">{issue.device} - {issue.alertType}</div>
                            <Badge 
                              variant="outline"
                              className={`text-xs cursor-pointer border-2 transition-colors ${
                                issue.resolved 
                                  ? "border-green-500 text-green-600 hover:bg-green-50" 
                                  : "border-red-500 text-red-600 hover:bg-red-50"
                              }`}
                              onClick={() => {
                                const updatedIssues = auditDetails.issues.map((issueItem, i) => 
                                  i === index ? { ...issueItem, resolved: !issueItem.resolved, resolvedAt: !issueItem.resolved ? new Date().toISOString() : null } : issueItem
                                );
                                const updatedDetails = { ...auditDetails, issues: updatedIssues };
                                setAuditDetails(updatedDetails);
                                sessionStorage.setItem('auditDetails', JSON.stringify(updatedDetails));
                              }}
                            >
                              {issue.resolved ? "Solved" : "Active"}
                            </Badge>
                          </div>
                          {issue.device && (
                            <div className="text-sm text-gray-600">
                              {issue.device}{issue.impactedUnit ? `-${issue.impactedUnit}` : ''} : {issue.alertType}
                            </div>
                          )}
                          {issue.rack && (
                            <div className="text-sm text-gray-600">
                              Location: {issue.rack}{issue.tile ? ` / ${issue.tile}` : ''}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditIssue(issue, index)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Remove functionality - remove this specific issue
                              const updatedIssues = auditDetails.issues.filter((_, i) => i !== index);
                              const updatedDetails = { ...auditDetails, issues: updatedIssues };
                              setAuditDetails(updatedDetails);
                              sessionStorage.setItem('auditDetails', JSON.stringify(updatedDetails));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
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
            className="bg-hpe-brand hover:bg-hpe-brand/90 text-white"
          >
            Submit Audit
          </Button>
        </div>
      </div>

      {/* Edit Issue Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Issue</DialogTitle>
          </DialogHeader>
          {editingIssue && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tile">Tile Location</Label>
                <Select 
                  value={editingIssue.tile || ''} 
                  onValueChange={(value) => setEditingIssue({...editingIssue, tile: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tile location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cabinet-001">Cabinet-001</SelectItem>
                    <SelectItem value="Cabinet-002">Cabinet-002</SelectItem>
                    <SelectItem value="Cabinet-003">Cabinet-003</SelectItem>
                    <SelectItem value="Cabinet-004">Cabinet-004</SelectItem>
                    <SelectItem value="Cabinet-005">Cabinet-005</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="device">Device Type</Label>
                <Select 
                  value={editingIssue.device || ''} 
                  onValueChange={(value) => setEditingIssue({...editingIssue, device: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Power Supply Unit">Power Supply Unit</SelectItem>
                    <SelectItem value="Power Distribution Unit">Power Distribution Unit</SelectItem>
                    <SelectItem value="Rear Door Heat Exchanger">Rear Door Heat Exchanger</SelectItem>
                    <SelectItem value="Cooling Distribution Unit">Cooling Distribution Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="impactedUnit">Impacted Unit</Label>
                  <Select 
                    value={editingIssue.impactedUnit || ''} 
                    onValueChange={(value) => setEditingIssue({...editingIssue, impactedUnit: value})}
                    disabled={editingIssue.device === 'Rear Door Heat Exchanger' || editingIssue.device === 'Cooling Distribution Unit'}
                  >
                    <SelectTrigger className={editingIssue.device === 'Rear Door Heat Exchanger' || editingIssue.device === 'Cooling Distribution Unit' ? 'opacity-50' : ''}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {editingIssue.device === 'Power Supply Unit' ? (
                        <>
                          <SelectItem value="PSU-1">PSU-1</SelectItem>
                          <SelectItem value="PSU-2">PSU-2</SelectItem>
                          <SelectItem value="PSU-3">PSU-3</SelectItem>
                          <SelectItem value="PSU-4">PSU-4</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="PDU-A">PDU-A</SelectItem>
                          <SelectItem value="PDU-B">PDU-B</SelectItem>
                          <SelectItem value="PDU-C">PDU-C</SelectItem>
                          <SelectItem value="PDU-D">PDU-D</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="uHeight">U-Height</Label>
                  <Select 
                    value={editingIssue.uHeight || ''} 
                    onValueChange={(value) => setEditingIssue({...editingIssue, uHeight: value})}
                    disabled={editingIssue.device === 'Rear Door Heat Exchanger' || editingIssue.device === 'Cooling Distribution Unit'}
                  >
                    <SelectTrigger className={editingIssue.device === 'Rear Door Heat Exchanger' || editingIssue.device === 'Cooling Distribution Unit' ? 'opacity-50' : ''}>
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 48 }, (_, i) => (
                        <SelectItem key={i + 1} value={`U${i + 1}`}>U{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="alertType">Issue Type</Label>
                <Select 
                  value={editingIssue.alertType || ''} 
                  onValueChange={(value) => setEditingIssue({...editingIssue, alertType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Overcurrent">Overcurrent</SelectItem>
                    <SelectItem value="Communication Failure">Communication Failure</SelectItem>
                    <SelectItem value="Temperature Warning">Temperature Warning</SelectItem>
                    <SelectItem value="Power Loss">Power Loss</SelectItem>
                    <SelectItem value="Fan Failure">Fan Failure</SelectItem>
                    <SelectItem value="Memory Error">Memory Error</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea
                  id="comments"
                  value={editingIssue.comments || ''}
                  onChange={(e) => setEditingIssue({...editingIssue, comments: e.target.value})}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditSummary;
