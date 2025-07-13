import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

interface IncidentDetail {
  alertType: string;
  uHeight?: number;
  psuId?: string;
  pduId?: string;
}

interface IncidentDetailsDialogProps {
  rackName: string;
  deviceType: string;
  incidents: IncidentDetail[];
  onUpdate: (incidents: IncidentDetail[]) => void;
  children: React.ReactNode;
}

const alertTypes = [
  { value: "overcurrent", label: "Overcurrent", severity: "Critical" },
  { value: "communication", label: "Communication Failure", severity: "Medium" },
  { value: "temperature", label: "Temperature Warning", severity: "Medium" },
  { value: "power", label: "Power Loss", severity: "Critical" },
  { value: "fan", label: "Fan Failure", severity: "Medium" },
  { value: "memory", label: "Memory Error", severity: "Low" },
  { value: "other", label: "Other", severity: "Low" }
];

const pduOptions = ["PDU-A", "PDU-B", "PDU-C", "PDU-D"];

export function IncidentDetailsDialog({ 
  rackName, 
  deviceType, 
  incidents, 
  onUpdate, 
  children 
}: IncidentDetailsDialogProps) {
  const [localIncidents, setLocalIncidents] = useState<IncidentDetail[]>(incidents);
  const [open, setOpen] = useState(false);

  const addIncident = () => {
    const newIncident: IncidentDetail = {
      alertType: "",
      ...(deviceType === "Power Supply Unit" && { uHeight: undefined, psuId: "" }),
      ...(deviceType === "Power Distribution Unit" && { pduId: "" })
    };
    setLocalIncidents([...localIncidents, newIncident]);
  };

  const removeIncident = (index: number) => {
    setLocalIncidents(localIncidents.filter((_, i) => i !== index));
  };

  const updateIncident = (index: number, field: keyof IncidentDetail, value: any) => {
    const updated = localIncidents.map((incident, i) => 
      i === index ? { ...incident, [field]: value } : incident
    );
    setLocalIncidents(updated);
  };

  const handleSave = () => {
    const validIncidents = localIncidents.filter(incident => incident.alertType);
    onUpdate(validIncidents);
    setOpen(false);
  };

  const handleCancel = () => {
    setLocalIncidents(incidents);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Incident Details - {rackName} / {deviceType}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {localIncidents.map((incident, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Incident {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIncident(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Alert Type</Label>
                  <Select 
                    value={incident.alertType} 
                    onValueChange={(value) => updateIncident(index, 'alertType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      {alertTypes.map(alert => (
                        <SelectItem key={alert.value} value={alert.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{alert.label}</span>
                            <span className={`text-xs px-2 py-1 rounded ml-2 ${
                              alert.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {deviceType === "Power Supply Unit" && (
                  <>
                    <div>
                      <Label>U-Height</Label>
                      <Input
                        type="number"
                        min="1"
                        max="48"
                        value={incident.uHeight || ""}
                        onChange={(e) => updateIncident(index, 'uHeight', parseInt(e.target.value) || undefined)}
                        placeholder="Enter U-height (1-48)"
                      />
                    </div>
                    <div>
                      <Label>PSU ID</Label>
                      <Input
                        value={incident.psuId || ""}
                        onChange={(e) => updateIncident(index, 'psuId', e.target.value)}
                        placeholder="Enter PSU ID (e.g., PSU-1, PSU-2)"
                      />
                    </div>
                  </>
                )}

                {deviceType === "Power Distribution Unit" && (
                  <div>
                    <Label>PDU</Label>
                    <Select 
                      value={incident.pduId || ""} 
                      onValueChange={(value) => updateIncident(index, 'pduId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select PDU" />
                      </SelectTrigger>
                      <SelectContent>
                        {pduOptions.map(pdu => (
                          <SelectItem key={pdu} value={pdu}>
                            {pdu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addIncident}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Incident
          </Button>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Incidents
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}