import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Building } from "lucide-react";
import { locationData, getDataHallsByDatacenter } from "@/data/locations";
const StartAudit = () => {
  const navigate = useNavigate();
  const [selectedDatacenter, setSelectedDatacenter] = useState("");
  const [selectedDataHall, setSelectedDataHall] = useState("");

  // Check for preselected datacenter from dashboard
  useEffect(() => {
    const preselected = sessionStorage.getItem('preselectedDatacenter');
    if (preselected) {
      setSelectedDatacenter(preselected);
      sessionStorage.removeItem('preselectedDatacenter');
    }
  }, []);
  const datacenters = locationData;
  const dataHalls = selectedDatacenter ? getDataHallsByDatacenter(selectedDatacenter) : [];
  const handleStartAudit = () => {
    if (selectedDatacenter && selectedDataHall) {
      // Store audit details in sessionStorage for the workflow
      sessionStorage.setItem('auditDetails', JSON.stringify({
        datacenter: datacenters.find(dc => dc.id === selectedDatacenter)?.name || selectedDatacenter,
        dataHall: dataHalls.find(dh => dh.id === selectedDataHall)?.name || selectedDataHall,
        startTime: new Date().toISOString(),
        technician: "John Doe" // This would come from user context
      }));
      navigate("/audit/issues");
    }
  };
  const canStart = selectedDatacenter && selectedDataHall;
  return <div className="h-full flex items-center justify-center px-6 bg-inherit">
      <div className="w-full max-w-2xl my-[50px]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Start New Audit</h1>
          <p className="text-gray-600">Select the datacenter and data hall to begin your audit.</p>
        </div>

        <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-hpe-green" />
            <span>Location Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="datacenter">Datacenter</Label>
            <Select value={selectedDatacenter} onValueChange={setSelectedDatacenter}>
              <SelectTrigger>
                <SelectValue placeholder="Select datacenter" />
              </SelectTrigger>
              <SelectContent>
                {datacenters.map(dc => <SelectItem key={dc.id} value={dc.id}>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span className="text-sm">{dc.name}</span>
                    </div>
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datahall">Data Hall</Label>
            <Select value={selectedDataHall} onValueChange={setSelectedDataHall} disabled={!selectedDatacenter}>
              <SelectTrigger>
                <SelectValue placeholder="Select a data hall" />
              </SelectTrigger>
              <SelectContent>
                {dataHalls.map(hall => <SelectItem key={hall.id} value={hall.id}>
                    {hall.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button onClick={handleStartAudit} disabled={!canStart} className="bg-hpe-green hover:bg-hpe-green/90">
              Begin Audit
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>;
};
export default StartAudit;