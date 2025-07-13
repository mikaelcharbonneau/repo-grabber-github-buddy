import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { AlertTriangle, ChevronDown, MapPin, ChevronRight } from "lucide-react";
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
  uHeight?: number;
  psuId?: string;
  pduId?: string;
}
interface AuditMatrixProps {
  racks: Rack[];
  issues: Issue[];
  datacenter: string;
  dataHall: string;
  onUpdateIssue: (rackId: number, deviceType: string, alertValues: string[]) => void;
  getIssueValues: (rackId: number, deviceType: string) => string[];
}
const deviceTypes = ["Power Supply Unit", "Power Distribution Unit", "Rear Door Heat Exchanger", "Cooling Distribution Unit"];

const psuUnits = ["PSU-1", "PSU-2", "PSU-3", "PSU-4"];
const pduUnits = ["PDU-A", "PDU-B", "PDU-C", "PDU-D"];

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
  datacenter,
  dataHall,
  onUpdateIssue,
  getIssueValues
}: AuditMatrixProps) => {
  const [prePopulatedRacks, setPrePopulatedRacks] = useState<Rack[]>([]);

  // Pre-populate table with all available cabinets
  useEffect(() => {
    const auditDetails = sessionStorage.getItem('auditDetails');
    if (auditDetails) {
      const details = JSON.parse(auditDetails);
      // For demo purposes, we'll use Quebec - Canada / Island 1 as default
      // In a real app, this would come from the audit details
      const cabinets = getCabinetsByDataHall('quebec-canada', 'island-1');
      const rackData = cabinets.map((cabinet, index) => ({
        id: index + 1,
        name: cabinet.name
      }));
      setPrePopulatedRacks(rackData);
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Rack</TableHead>
                {deviceTypes.map(device => <TableHead key={device} className="w-56 text-center">
                    {device}
                  </TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {prePopulatedRacks.map(rack => <TableRow key={rack.id}>
                  <TableCell className="font-medium">
                    {rack.name}
                  </TableCell>
                  {deviceTypes.map(device => {
                const currentValues = getIssueValues(rack.id, device);
                console.log(`Debug - ${rack.name} ${device}:`, currentValues);
                
                // Handle display text for multi-level dropdowns (PSUs/PDUs)
                let displayText = "No Issues";
                if (device === "Power Supply Unit" || device === "Power Distribution Unit") {
                  const unitIncidents = currentValues.filter(v => v !== 'none');
                  if (unitIncidents.length > 0) {
                    const uniqueUnits = [...new Set(unitIncidents.map(v => v.split('-').slice(0, -1).join('-')))];
                    displayText = uniqueUnits.length === 1 
                      ? `${uniqueUnits[0]} (${unitIncidents.length} issues)`
                      : `${uniqueUnits.length} units (${unitIncidents.length} issues)`;
                  }
                } else {
                  // Simple display for other devices
                  const selectedAlerts = alertTypes.filter(a => currentValues.includes(a.value) && a.value !== 'none');
                  displayText = selectedAlerts.length === 0 ? "No Issues" : selectedAlerts.length === 1 ? selectedAlerts[0].label : `${selectedAlerts.length} Issues`;
                }
                
                // Use multi-level dropdown for PSUs and PDUs
                if (device === "Power Supply Unit" || device === "Power Distribution Unit") {
                  const units = device === "Power Supply Unit" ? psuUnits : pduUnits;
                  
                  return <TableCell key={device}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between text-left">
                          <span className="truncate">
                            {displayText}
                          </span>
                          <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Select {device === "Power Supply Unit" ? "PSU" : "PDU"} & Issues</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {units.map(unit => (
                          <DropdownMenuSub key={unit}>
                            <DropdownMenuSubTrigger className="flex items-center">
                              <span>{unit}</span>
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-56">
                              {alertTypes.filter(alert => alert.value !== 'none').map(alert => (
                                <DropdownMenuCheckboxItem
                                  key={`${unit}-${alert.value}`}
                                  checked={currentValues.includes(`${unit}-${alert.value}`)}
                                  onCheckedChange={checked => {
                                    console.log(`Checkbox change: ${unit}-${alert.value}, checked: ${checked}`);
                                    const unitAlertValue = `${unit}-${alert.value}`;
                                    const newValues = checked 
                                      ? [...currentValues.filter(v => v !== 'none'), unitAlertValue] 
                                      : currentValues.filter(v => v !== unitAlertValue);
                                    console.log('New values array:', newValues);
                                    onUpdateIssue(rack.id, device, newValues.length > 0 ? newValues : ['none']);
                                  }}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{alert.label}</span>
                                    {alert.severity && (
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        alert.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                                        alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {alert.severity}
                                      </span>
                                    )}
                                  </div>
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>;
                }

                return <TableCell key={device}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between text-left">
                              <span className="truncate">
                                {displayText}
                              </span>
                              <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-64">
                            {alertTypes.filter(alert => alert.value !== 'none').map(alert => <DropdownMenuCheckboxItem
                                key={alert.value}
                                checked={currentValues.includes(alert.value)}
                                onCheckedChange={checked => {
                                  const newValues = checked ? [...currentValues.filter(v => v !== 'none'), alert.value] : currentValues.filter(v => v !== alert.value);
                                  onUpdateIssue(rack.id, device, newValues.length > 0 ? newValues : ['none']);
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{alert.label}</span>
                                  {alert.severity && (
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      alert.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                                      alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {alert.severity}
                                    </span>
                                  )}
                                </div>
                              </DropdownMenuCheckboxItem>)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>;
              })}
                </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>;
};
export default AuditMatrix;