
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, CheckCircle, MapPin } from "lucide-react";

const AuditWalkthrough = () => {
  const navigate = useNavigate();
  const [auditDetails, setAuditDetails] = useState(null);
  const [issuesFound, setIssuesFound] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem('auditDetails');
    if (!stored) {
      navigate("/audit/start");
      return;
    }
    setAuditDetails(JSON.parse(stored));
  }, [navigate]);

  const handleContinue = () => {
    if (issuesFound) {
      const updatedDetails = {
        ...auditDetails,
        issuesFound: issuesFound === "yes"
      };
      sessionStorage.setItem('auditDetails', JSON.stringify(updatedDetails));
      
      if (issuesFound === "yes") {
        navigate("/audit/issues");
      } else {
        navigate("/audit/summary");
      }
    }
  };

  if (!auditDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Walkthrough</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{auditDetails.datacenter} / {auditDetails.dataHall}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Physical Inspection Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Were any issues found during your walkthrough of {auditDetails.dataHall}?
            </Label>
            
            <RadioGroup value={issuesFound} onValueChange={setIssuesFound}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium">Yes, issues found</div>
                    <div className="text-sm text-gray-500">I need to log incidents and issues</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">No issues found</div>
                    <div className="text-sm text-gray-500">Everything looks good</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate("/audit/start")}>
              Back
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!issuesFound}
              className="bg-hpe-green hover:bg-hpe-green/90"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditWalkthrough;
