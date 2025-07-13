import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, AlertTriangle, ChevronDown, MapPin } from "lucide-react";
import { getCabinetsByDataHall, getDatacenterById } from "@/data/locations";
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
interface AuditMatrixProps {
  racks: Rack[];
  issues: Issue[];
  datacenter: string;
  dataHall: string;
  onAddRack: () => void;
  onRemoveRack: (id: number) => void;
  onUpdateRack: (id: number, field: string, value: string) => void;
  onUpdateIssue: (rackId: number, deviceType: string, alertValues: string[]) => void;
  getIssueValues: (rackId: number, deviceType: string) => string[];
}
const deviceTypes = ["Power Supply Unit", "Power Distribution Unit", "Rear Door Heat Exchanger", "Cooling Distribution Unit"];
const alertTypes = [{
  value: "none",
  label: "No Issue",
  severity: ""
}, {
  value: "overcurrent",
  label: "Overcurrent",
  severity: "Critical"
}, {
  value: "communication",
  label: "Communication Failure",
  severity: "Medium"
}, {
  value: "temperature",
  label: "Temperature Warning",
  severity: "Medium"
}, {
  value: "power",
  label: "Power Loss",
  severity: "Critical"
}, {
  value: "fan",
  label: "Fan Failure",
  severity: "Medium"
}, {
  value: "memory",
  label: "Memory Error",
  severity: "Low"
}, {
  value: "other",
  label: "Other",
  severity: "Low"
}];
const AuditMatrix = ({
  racks,
  issues,
  datacenter,
  dataHall,
  onAddRack,
  onRemoveRack,
  onUpdateRack,
  onUpdateIssue,
  getIssueValues
}: AuditMatrixProps) => {
  const [availableCabinets, setAvailableCabinets] = useState<any[]>([]);

  // Get available cabinets based on audit location
  useEffect(() => {
    const auditDetails = sessionStorage.getItem('auditDetails');
    if (auditDetails) {
      const details = JSON.parse(auditDetails);
      // For demo purposes, we'll use Quebec - Canada / Island 1 as default
      // In a real app, this would come from the audit details
      const cabinets = getCabinetsByDataHall('quebec-canada', 'island-1');
      setAvailableCabinets(cabinets);
    }
  }, []);
  const getSeverityColors = (severities: string[]) => {
    if (severities.includes('Critical')) return 'bg-red-100 border-red-300';
    if (severities.includes('Medium')) return 'bg-yellow-100 border-yellow-300';
    if (severities.includes('Low')) return 'bg-green-100 border-green-300';
    return '';
  };
  return <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Incidents</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 text-sm font-normal">
              <MapPin className="h-4 w-4" />
              <span>{datacenter} / {dataHall}</span>
            </div>
          </div>
          <Button onClick={onAddRack} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Rack
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Rack ID</TableHead>
                {deviceTypes.map(device => <TableHead key={device} className="w-40 text-center">
                    {device}
                  </TableHead>)}
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {racks.map(rack => <TableRow key={rack.id}>
                  <TableCell>
                    <Input placeholder="e.g., X2401" value={rack.name} onChange={e => onUpdateRack(rack.id, 'name', e.target.value)} className="w-full" list={`cabinets-${rack.id}`} />
                    <datalist id={`cabinets-${rack.id}`}>
                      {availableCabinets.map(cabinet => <option key={cabinet.id} value={cabinet.name} />)}
                    </datalist>
                  </TableCell>
                  {deviceTypes.map(device => {
                const currentValues = getIssueValues(rack.id, device);
                const selectedAlerts = alertTypes.filter(a => currentValues.includes(a.value) && a.value !== 'none');
                const severities = selectedAlerts.map(a => a.severity).filter(Boolean);
                return <TableCell key={device}>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              <span className="truncate">
                                {selectedAlerts.length === 0 ? "No Issues" : selectedAlerts.length === 1 ? selectedAlerts[0].label : `${selectedAlerts.length} Issues`}
                              </span>
                              <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2">
                            <div className="space-y-2">
                              {alertTypes.filter(alert => alert.value !== 'none').map(alert => <div key={alert.value} className="flex items-center space-x-2">
                                  <Checkbox id={`${rack.id}-${device}-${alert.value}`} checked={currentValues.includes(alert.value)} onCheckedChange={checked => {
                            const newValues = checked ? [...currentValues.filter(v => v !== 'none'), alert.value] : currentValues.filter(v => v !== alert.value);
                            onUpdateIssue(rack.id, device, newValues.length > 0 ? newValues : ['none']);
                          }} />
                                  <label htmlFor={`${rack.id}-${device}-${alert.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                    {alert.label}
                                  </label>
                                </div>)}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>;
              })}
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onRemoveRack(rack.id)} disabled={racks.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>;
};
export default AuditMatrix;