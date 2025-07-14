import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Monitor, 
  Database,
  Globe,
  Palette,
  Save
} from "lucide-react";

const Settings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-hpe-brand/10 rounded-md">
                  <User className="h-4 w-4 text-hpe-brand" />
                  <span className="text-sm font-medium text-hpe-brand">Profile</span>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Notifications</span>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Security</span>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                  <Monitor className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Display</span>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                  <Database className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Data & Privacy</span>
                </div>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@hpe.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="technician">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technician">Field Technician</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive notifications via email</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Critical Alerts</div>
                  <div className="text-sm text-gray-500">Immediate notifications for critical issues</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Audit Reminders</div>
                  <div className="text-sm text-gray-500">Reminders for scheduled audits</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Weekly Reports</div>
                  <div className="text-sm text-gray-500">Weekly summary reports</div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Application Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Application Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                    <SelectItem value="cet">Central European Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-save Drafts</div>
                  <div className="text-sm text-gray-500">Automatically save form data</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Compact View</div>
                  <div className="text-sm text-gray-500">Use compact layout for lists</div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">Add an extra layer of security</div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Changes */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              Cancel
            </Button>
            <Button className="bg-hpe-brand hover:bg-hpe-brand/90 text-white">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;