
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Plus, FileText } from "lucide-react";

const AuditComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Audit Completed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-gray-600">
              Your audit has been submitted and logged in the system.
            </p>
            <p className="text-sm text-gray-500">
              You can view this audit in the Audits section of the dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <Home className="h-6 w-6" />
              <span>Dashboard</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/audit/start")}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <Plus className="h-6 w-6" />
              <span>New Audit</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/audits")}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <FileText className="h-6 w-6" />
              <span>View Audits</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditComplete;
