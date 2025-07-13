
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuditHeader from "@/components/audit/AuditHeader";
import AuditMatrix from "@/components/audit/AuditMatrix";
import { useAuditIssues } from "@/hooks/useAuditIssues";

const AuditIssueEntry = () => {
  const navigate = useNavigate();
  const [auditDetails, setAuditDetails] = useState(null);
  const {
    racks,
    issues,
    addRack,
    removeRack,
    updateRack,
    updateIssue,
    getIssueValues
  } = useAuditIssues();

  useEffect(() => {
    const stored = sessionStorage.getItem('auditDetails');
    if (!stored) {
      navigate("/audit/start");
      return;
    }
    setAuditDetails(JSON.parse(stored));
  }, [navigate]);

  const handleContinue = () => {
    if (issues.length > 0) {
      // Transform issues to include rack information
      const enrichedIssues = issues.map(issue => {
        const rack = racks.find(r => r.id === issue.rackId);
        return {
          ...issue,
          rack: rack?.name || `Rack-${issue.rackId}`,
          scope: "Device",
          device: issue.deviceType,
          id: Date.now() + Math.random()
        };
      });

      const updatedDetails = {
        ...auditDetails,
        issues: enrichedIssues
      };
      sessionStorage.setItem('auditDetails', JSON.stringify(updatedDetails));
      navigate("/audit/summary");
    }
  };

  if (!auditDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AuditHeader 
        datacenter={auditDetails.datacenter} 
        dataHall={auditDetails.dataHall} 
      />

      <AuditMatrix
        racks={racks}
        issues={issues}
        datacenter={auditDetails.datacenter}
        dataHall={auditDetails.dataHall}
        onAddRack={addRack}
        onRemoveRack={removeRack}
        onUpdateRack={updateRack}
        onUpdateIssue={updateIssue}
        getIssueValues={getIssueValues}
      />

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => navigate("/audit/start")}>
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={issues.length === 0}
          className="bg-hpe-brand hover:bg-hpe-brand/90 text-white"
        >
          Continue to Summary
        </Button>
      </div>
    </div>
  );
};

export default AuditIssueEntry;
