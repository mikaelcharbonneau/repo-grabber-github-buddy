import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const AuditWalkthrough = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Audit System",
      description: "This walkthrough will guide you through the audit process.",
      content: "Our audit system helps you systematically inspect datacenter infrastructure and log any issues found. This ensures consistent quality and compliance across all facilities."
    },
    {
      title: "Starting an Audit",
      description: "Select your location and begin the inspection process.",
      content: "Choose the datacenter and data hall you'll be auditing. The system will guide you through a comprehensive checklist covering power systems, environmental controls, network equipment, and security systems."
    },
    {
      title: "Logging Issues",
      description: "Document any problems or anomalies you discover.",
      content: "Use the audit matrix to log issues by rack and device type. Each issue is automatically categorized by severity level to help prioritize resolution efforts."
    },
    {
      title: "Completing Audits",
      description: "Review and submit your findings.",
      content: "Before submission, review all logged issues in the audit summary. Once submitted, your audit becomes part of the permanent record and generates actionable reports for management."
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/audit/start");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Audit System Overview</CardTitle>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <div className="text-sm text-gray-500 mt-2">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-hpe-green-light rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-hpe-green" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
              <p className="text-gray-600 mb-4">{currentStepData.description}</p>
              <div className="text-left max-w-2xl mx-auto p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{currentStepData.content}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentStep 
                      ? 'bg-hpe-green' 
                      : index < currentStep 
                        ? 'bg-hpe-green-light' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button 
              onClick={handleNext}
              className="bg-hpe-green hover:bg-hpe-green/90"
            >
              {currentStep === steps.length - 1 ? 'Start Audit' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditWalkthrough;