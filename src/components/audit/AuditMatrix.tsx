import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { AlertTriangle, ChevronDown, MapPin, ChevronRight, GripVertical } from "lucide-react";
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
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    sourceRackId: number | null;
    sourceRackIndex: number | null;
    sourceDevice: string | null;
    sourceValues: string[];
    currentRackIndex: number | null;
  }>({
    isDragging: false,
    sourceRackId: null,
    sourceRackIndex: null,
    sourceDevice: null,
    sourceValues: [],
    currentRackIndex: null
  });

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

  const handleDragStart = (rackId: number, device: string) => {
    const values = getIssueValues(rackId, device);
    if (values.length === 0 || (values.length === 1 && values[0] === 'none')) return;
    
    const rackIndex = prePopulatedRacks.findIndex(rack => rack.id === rackId);
    console.log('Drag start:', { rackId, rackIndex, device, values });
    
    setDragState({
      isDragging: true,
      sourceRackId: rackId,
      sourceRackIndex: rackIndex,
      sourceDevice: device,
      sourceValues: values,
      currentRackIndex: rackIndex
    });
  };

  const handleDragOver = (e: React.DragEvent, rackId: number, device: string) => {
    e.preventDefault();
    if (!dragState.isDragging || dragState.sourceDevice !== device) return;
    
    const rackIndex = prePopulatedRacks.findIndex(rack => rack.id === rackId);
    console.log('Drag over:', { rackId, rackIndex, device });
    
    setDragState(prev => ({
      ...prev,
      currentRackIndex: rackIndex
    }));
  };

  const handleDragEnd = () => {
    console.log('Drag end:', dragState);
    
    if (!dragState.isDragging || dragState.sourceRackIndex === null || dragState.currentRackIndex === null) {
      console.log('Early return - invalid drag state');
      return;
    }
    
    // Determine the range of racks to fill
    const startIndex = Math.min(dragState.sourceRackIndex, dragState.currentRackIndex);
    const endIndex = Math.max(dragState.sourceRackIndex, dragState.currentRackIndex);
    
    console.log('Filling range:', { startIndex, endIndex, totalRacks: prePopulatedRacks.length });
    
    // Apply the source values to all racks in the range
    for (let i = startIndex; i <= endIndex; i++) {
      const rack = prePopulatedRacks[i];
      console.log('Filling rack:', { index: i, rack, device: dragState.sourceDevice });
      
      if (rack && dragState.sourceDevice) {
        onUpdateIssue(rack.id, dragState.sourceDevice, dragState.sourceValues);
      }
    }
    
    setDragState({
      isDragging: false,
      sourceRackId: null,
      sourceRackIndex: null,
      sourceDevice: null,
      sourceValues: [],
      currentRackIndex: null
    });
  };

  // Alternative approach: Handle drop on any cell and calculate range based on drop position
  const handleDrop = (e: React.DragEvent, targetRackId: number, targetDevice: string) => {
    e.preventDefault();
    console.log('Drop event:', { targetRackId, targetDevice });
    
    if (!dragState.isDragging || dragState.sourceDevice !== targetDevice) return;
    
    const targetRackIndex = prePopulatedRacks.findIndex(rack => rack.id === targetRackId);
    const sourceRackIndex = dragState.sourceRackIndex;
    
    if (sourceRackIndex === null) return;
    
    console.log('Drop calculation:', { sourceRackIndex, targetRackIndex });
    
    // Calculate range and fill
    const startIndex = Math.min(sourceRackIndex, targetRackIndex);
    const endIndex = Math.max(sourceRackIndex, targetRackIndex);
    
    console.log('Drop range:', { startIndex, endIndex });
    
    // Apply the source values to all racks in the range
    for (let i = startIndex; i <= endIndex; i++) {
      const rack = prePopulatedRacks[i];
      console.log('Drop filling rack:', { index: i, rack });
      
      if (rack && dragState.sourceDevice) {
        onUpdateIssue(rack.id, dragState.sourceDevice, dragState.sourceValues);
      }
    }
    
    // Reset drag state
    setDragState({
      isDragging: false,
      sourceRackId: null,
      sourceRackIndex: null,
      sourceDevice: null,
      sourceValues: [],
      currentRackIndex: null
    });
  };

  // Helper function to determine if a cell should be highlighted
  const isCellInDragRange = (rackId: number, device: string): boolean => {
    if (!dragState.isDragging || dragState.sourceDevice !== device || 
        dragState.sourceRackIndex === null || dragState.currentRackIndex === null) {
      return false;
    }
    
    const rackIndex = prePopulatedRacks.findIndex(rack => rack.id === rackId);
    const startIndex = Math.min(dragState.sourceRackIndex, dragState.currentRackIndex);
    const endIndex = Math.max(dragState.sourceRackIndex, dragState.currentRackIndex);
    
    return rackIndex >= startIndex && rackIndex <= endIndex;
  };
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
                  const hasIssues = currentValues.length > 0 && !(currentValues.length === 1 && currentValues[0] === 'none');
                  const isInDragRange = isCellInDragRange(rack.id, device);
                  
                  return <TableCell 
                    key={device} 
                    className={`relative ${isInDragRange ? 'bg-blue-100 border-2 border-blue-300' : ''}`}
                    onDragOver={(e) => handleDragOver(e, rack.id, device)}
                    onDrop={(e) => handleDrop(e, rack.id, device)}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between text-left">
                          <span className="truncate">
                            {displayText}
                          </span>
                          <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuLabel>Select {device === "Power Supply Unit" ? "PSU" : "PDU"} & Issues</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {units.map(unit => (
                          <DropdownMenuSub key={unit}>
                            <DropdownMenuSubTrigger>
                              <span>{unit}</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-44">
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
                                  <span>{alert.label}</span>
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* Drag handle - positioned outside the dropdown */}
                    {hasIssues && (
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity z-10"
                        style={{ 
                          clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
                          pointerEvents: 'auto'
                        }}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(rack.id, device);
                        }}
                        onDragEnd={(e) => {
                          e.stopPropagation();
                          handleDragEnd();
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </TableCell>;
                }

                const hasIssues = currentValues.length > 0 && !(currentValues.length === 1 && currentValues[0] === 'none');
                const isInDragRange = isCellInDragRange(rack.id, device);

                return <TableCell 
                  key={device} 
                  className={`relative ${isInDragRange ? 'bg-blue-100 border-2 border-blue-300' : ''}`}
                  onDragOver={(e) => handleDragOver(e, rack.id, device)}
                  onDrop={(e) => handleDrop(e, rack.id, device)}
                >
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
                        
                        {/* Drag handle - positioned outside the dropdown */}
                        {hasIssues && (
                          <div
                            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity z-10"
                            style={{ 
                              clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
                              pointerEvents: 'auto'
                            }}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleDragStart(rack.id, device);
                            }}
                            onDragEnd={(e) => {
                              e.stopPropagation();
                              handleDragEnd();
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
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