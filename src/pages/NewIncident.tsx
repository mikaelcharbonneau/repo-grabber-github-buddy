import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const NewIncident = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    status: "open",
    datacenter_alias: "",
    datahall_alias: "",
    tile_location: "",
    u_height: "",
    device_id: "",
    created_at: new Date().toISOString()
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    // Get current user's auditor ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to create incidents');
      return;
    }

    const { data: auditor } = await supabase
      .from('auditors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!auditor) {
      alert('Auditor profile not found');
      return;
    }

    // Prepare incident data with all required fields
    const incidentData = {
      title: form.title,
      description: form.description,
      severity: form.severity,
      status: form.status,
      datacenter_alias: form.datacenter_alias,
      datahall_alias: form.datahall_alias,
      tile_location: form.tile_location,
      u_height: form.u_height,
      device_id: form.device_id,
      auditor_id: auditor.id,
      created_at: new Date().toISOString()
    };

    console.log('Submitting incident:', incidentData);

    const { data, error } = await supabase
      .from('incidents')
      .insert([incidentData])
      .select();
      
    if (error) {
      console.error('Error creating incident:', error);
      alert(`Failed to create incident: ${error.message}`);
    } else {
      console.log('Incident created successfully:', data);
      navigate("/incidents");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Report New Incident</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="severity">Severity</Label>
            <Select value={form.severity} onValueChange={(v) => handleChange('severity', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="datacenter_alias">Datacenter Alias</Label>
              <Input
                id="datacenter_alias"
                value={form.datacenter_alias}
                onChange={(e) => handleChange('datacenter_alias', e.target.value)}
                placeholder="e.g., Q"
                required
              />
            </div>
            <div>
              <Label htmlFor="datahall_alias">Datahall Alias</Label>
              <Input
                id="datahall_alias"
                value={form.datahall_alias}
                onChange={(e) => handleChange('datahall_alias', e.target.value)}
                placeholder="e.g., 01"
                required
              />
            </div>
            <div>
              <Label htmlFor="tile_location">Tile Location</Label>
              <Input
                id="tile_location"
                value={form.tile_location}
                onChange={(e) => handleChange('tile_location', e.target.value)}
                placeholder="e.g., X2494"
                required
              />
            </div>
            <div>
              <Label htmlFor="u_height">U-Height</Label>
              <Input
                id="u_height"
                type="number"
                value={form.u_height}
                onChange={(e) => handleChange('u_height', e.target.value)}
                placeholder="e.g., 33"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="device_id">Device ID</Label>
              <Input
                id="device_id"
                value={form.device_id}
                onChange={(e) => handleChange('device_id', e.target.value)}
                placeholder="e.g., PSU2"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => navigate("/incidents")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit Incident</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewIncident;