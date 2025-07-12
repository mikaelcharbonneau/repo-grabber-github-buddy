
import { useState } from "react";

interface Rack {
  id: number;
  name: string;
}

interface Issue {
  key: string;
  rackId: number;
  deviceType: string;
  alertType: string;
  severity: string;
  timestamp: string;
}

const alertTypes = [
  { value: "none", label: "No Issue", severity: "" },
  { value: "overcurrent", label: "Overcurrent", severity: "Critical" },
  { value: "communication", label: "Communication Failure", severity: "Medium" },
  { value: "temperature", label: "Temperature Warning", severity: "Medium" },
  { value: "power", label: "Power Loss", severity: "Critical" },
  { value: "fan", label: "Fan Failure", severity: "Medium" },
  { value: "memory", label: "Memory Error", severity: "Low" },
  { value: "other", label: "Other", severity: "Low" }
];

export const useAuditIssues = () => {
  const [racks, setRacks] = useState<Rack[]>([{ id: 1, name: "" }]);
  const [issues, setIssues] = useState<Issue[]>([]);

  const addRack = () => {
    const newRack = {
      id: Date.now(),
      name: ""
    };
    setRacks([...racks, newRack]);
  };

  const removeRack = (id: number) => {
    setRacks(racks.filter(rack => rack.id !== id));
  };

  const updateRack = (id: number, field: string, value: string) => {
    setRacks(racks.map(rack => 
      rack.id === id ? { ...rack, [field]: value } : rack
    ));
  };

  const updateIssue = (rackId: number, deviceType: string, alertValues: string[]) => {
    const rackKey = `${rackId}-${deviceType}`;
    
    if (alertValues.length === 0 || (alertValues.length === 1 && alertValues[0] === "none")) {
      // Remove all issues for this rack-device combination if no issues or "none" selected
      setIssues(issues.filter(issue => !issue.key.startsWith(rackKey)));
    } else {
      // Remove existing issues for this rack-device combination
      const filteredIssues = issues.filter(issue => !issue.key.startsWith(rackKey));
      
      // Add new issues for each selected alert
      const newIssues = alertValues
        .filter(value => value !== "none")
        .map((alertValue, index) => {
          const alertInfo = alertTypes.find(a => a.value === alertValue);
          return {
            key: `${rackKey}-${index}`,
            rackId,
            deviceType,
            alertType: alertInfo?.label || "",
            severity: alertInfo?.severity || "",
            timestamp: new Date().toISOString()
          };
        });
      
      setIssues([...filteredIssues, ...newIssues]);
    }
  };

  const getIssueValues = (rackId: number, deviceType: string) => {
    const rackKey = `${rackId}-${deviceType}`;
    const deviceIssues = issues.filter(issue => issue.key.startsWith(rackKey));
    if (deviceIssues.length === 0) return ['none'];
    
    return deviceIssues.map(issue => {
      const alertType = alertTypes.find(a => a.label === issue.alertType);
      return alertType?.value || 'none';
    }).filter(value => value !== 'none');
  };

  return {
    racks,
    issues,
    addRack,
    removeRack,
    updateRack,
    updateIssue,
    getIssueValues
  };
};
