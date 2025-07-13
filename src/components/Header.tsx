import { Bell, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Grid2x2, 
  Clipboard, 
  Shield, 
  Database,
  Plus,
  Filter,
  FileText,
  Calendar
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationItem = ({ notification, onClick }) => (
  <div 
    className="flex items-start space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    onClick={onClick}
  >
    <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-hpe-green'}`}></div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
            {notification.title}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {notification.message}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {notification.timestamp}
          </div>
        </div>
        {notification.severity && (
          <Badge 
            className={`ml-2 text-xs ${
              notification.severity === 'Critical' ? 'bg-red-100 text-red-800' :
              notification.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}
          >
            {notification.severity}
          </Badge>
        )}
      </div>
    </div>
  </div>
);

const NavigationMenu = ({ children, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 p-1"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        side="bottom"
        align="start"
      >
        {onNavigate}
      </PopoverContent>
    </Popover>
  );
};

const NavigationItem = ({ icon: Icon, children, onClick }) => (
  <div
    className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
    onClick={onClick}
  >
    <Icon className="mr-2 h-4 w-4" />
    {children}
  </div>
);

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Critical Incident Reported",
      message: "PDU overcurrent alarm in DC-EAST/Hall-A/Rack-15",
      timestamp: "5 minutes ago",
      severity: "Critical",
      read: false,
      type: "incident"
    },
    {
      id: 2,
      title: "Audit Completed",
      message: "Monthly inspection of DC-WEST/Hall-B completed successfully",
      timestamp: "2 hours ago",
      severity: null,
      read: false,
      type: "audit"
    },
    {
      id: 3,
      title: "Temperature Warning",
      message: "High temperature detected in DC-CENTRAL/Hall-C",
      timestamp: "4 hours ago",
      severity: "Medium",
      read: true,
      type: "incident"
    },
    {
      id: 4,
      title: "Report Generated",
      message: "Weekly infrastructure report is ready for download",
      timestamp: "6 hours ago",
      severity: null,
      read: true,
      type: "report"
    },
    {
      id: 5,
      title: "Scheduled Maintenance",
      message: "Maintenance window scheduled for DC-NORTH/Hall-F tomorrow",
      timestamp: "1 day ago",
      severity: "Info",
      read: true,
      type: "maintenance"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  

  // Helper function to determine if a route is active
  const isActiveRoute = (routes: string[]) => {
    return routes.some(route => {
      if (route === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(route);
    });
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between space-x-8">
        <div className="flex items-center space-x-4">
          <div 
            className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <img 
              src="/lovable-uploads/8c51276e-0087-41f1-8dbb-414341ebdb5a.png" 
              alt="HPE Logo" 
              className="h-12"
            />
            <div className="h-8 w-px bg-gray-300" />
            <h1 className="text-md font-semibold text-gray-900">Datacenter Audit Tool</h1>
          </div>
        </div>

        {/* Navigation Menu - Centered */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                className={`flex items-center space-x-2 px-3 py-1.5 ${
                  isActiveRoute(["/"]) ? "text-hpe-green" : ""
                }`}
                onClick={() => navigate("/")}
              >
              <Grid2x2 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>

            <NavigationMenu
              onNavigate={
                <div className="space-y-1">
                  <NavigationItem icon={Search} onClick={() => navigate("/audits")}>
                    View All Audits
                  </NavigationItem>
                  <NavigationItem icon={Plus} onClick={() => navigate("/audit/start")}>
                    Start New Audit
                  </NavigationItem>
                </div>
              }
            >
              <Button 
                variant="ghost" 
                className={`flex items-center space-x-2 px-3 py-1.5 ${
                  isActiveRoute(["/audits", "/audit"]) ? "text-hpe-green" : ""
                }`}
                onClick={() => navigate("/audits")}
              >
                <Clipboard className="h-4 w-4" />
                <span>Audits</span>
              </Button>
            </NavigationMenu>

            <NavigationMenu
              onNavigate={
                <div className="space-y-1">
                  <NavigationItem icon={Search} onClick={() => navigate("/incidents")}>
                    View All Incidents
                  </NavigationItem>
                  <NavigationItem icon={Plus} onClick={() => {}}>
                    Report New Incident
                  </NavigationItem>
                </div>
              }
            >
              <Button 
                variant="ghost" 
                className={`flex items-center space-x-2 px-3 py-1.5 ${
                  isActiveRoute(["/incidents", "/incident"]) ? "text-hpe-green" : ""
                }`}
                onClick={() => navigate("/incidents")}
              >
                <Shield className="h-4 w-4" />
                <span>Incidents</span>
              </Button>
            </NavigationMenu>

            <NavigationMenu
              onNavigate={
                <div className="space-y-1">
                  <NavigationItem icon={Search} onClick={() => navigate("/reports")}>
                    View Reports
                  </NavigationItem>
                  <NavigationItem icon={FileText} onClick={() => {}}>
                    Generate Report
                  </NavigationItem>
                </div>
              }
            >
              <Button 
                variant="ghost" 
                className={`flex items-center space-x-2 px-3 py-1.5 ${
                  isActiveRoute(["/reports", "/report"]) ? "text-hpe-green" : ""
                }`}
                onClick={() => navigate("/reports")}
              >
                <Database className="h-4 w-4" />
                <span>Reports</span>
              </Button>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                {unreadCount > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => markAsRead(notification.id)}
                    />
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {/* Navigate to notifications page */}}
                  >
                    View All Notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>John Doe</DropdownMenuLabel>
              <DropdownMenuLabel className="text-sm font-normal text-gray-500">
                Field Technician
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div 
                  className="flex items-center w-full cursor-pointer"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;