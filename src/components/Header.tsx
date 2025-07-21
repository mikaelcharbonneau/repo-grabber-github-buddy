import { Bell, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Grid2x2, Clipboard, Shield, Database, Plus, Filter, FileText, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
const NotificationItem = ({
  notification,
  onClick
}) => <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" onClick={onClick}>
    <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-hpe-brand'}`}></div>
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
      </div>
    </div>
  </div>;
const NavigationMenu = ({
  children,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)} side="bottom" align="start">
        {onNavigate}
      </PopoverContent>
    </Popover>;
};
const NavigationItem = ({
  icon: Icon,
  children,
  onClick
}) => <div className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm" onClick={onClick}>
    <Icon className="mr-2 h-4 w-4" />
    {children}
  </div>;
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Sample notifications data
  const [notifications, setNotifications] = useState([{
    id: 1,
    title: "Critical Incident Reported",
    message: "PDU overcurrent alarm in DC-EAST/Hall-A/Rack-15",
    timestamp: "5 minutes ago",
    severity: "Critical",
    read: false,
    type: "incident"
  }, {
    id: 2,
    title: "Audit Completed",
    message: "Monthly inspection of DC-WEST/Hall-B completed successfully",
    timestamp: "2 hours ago",
    severity: null,
    read: false,
    type: "audit"
  }, {
    id: 3,
    title: "Temperature Warning",
    message: "High temperature detected in DC-CENTRAL/Hall-C",
    timestamp: "4 hours ago",
    severity: "Medium",
    read: true,
    type: "incident"
  }, {
    id: 4,
    title: "Report Generated",
    message: "Weekly infrastructure report is ready for download",
    timestamp: "6 hours ago",
    severity: null,
    read: true,
    type: "report"
  }, {
    id: 5,
    title: "Scheduled Maintenance",
    message: "Maintenance window scheduled for DC-NORTH/Hall-F tomorrow",
    timestamp: "1 day ago",
    severity: "Info",
    read: true,
    type: "maintenance"
  }]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (notificationId: number) => {
    setNotifications(notifications.map(n => n.id === notificationId ? {
      ...n,
      read: true
    } : n));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      read: true
    })));
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
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Navigation items for both desktop and mobile
  const navItems = [
    {
      name: 'Dashboard',
      icon: Grid2x2,
      path: '/',
      active: isActiveRoute(['/']),
      onClick: () => navigate('/')
    },
    {
      name: 'Audits',
      icon: Clipboard,
      path: '/audits',
      active: isActiveRoute(['/audits', '/audit']),
      subItems: [
        { name: 'View All Audits', icon: Search, onClick: () => navigate('/audits') },
        { name: 'Start New Audit', icon: Plus, onClick: () => navigate('/audit/start') }
      ]
    },
    {
      name: 'Incidents',
      icon: Shield,
      path: '/incidents',
      active: isActiveRoute(['/incidents', '/incident']),
      subItems: [
        { name: 'View All Incidents', icon: Search, onClick: () => navigate('/incidents') },
        { name: 'Report New Incident', icon: Plus, onClick: () => navigate('/incidents/new') }
      ]
    },
    {
      name: 'Reports',
      icon: Database,
      path: '/reports',
      active: isActiveRoute(['/reports', '/report']),
      subItems: [
        { name: 'View Reports', icon: Search, onClick: () => navigate('/reports') },
        { name: 'Generate Report', icon: FileText, onClick: () => {} }
      ]
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        {/* Logo and brand - left side */}
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="mr-2 p-2 rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          >
            <img 
              src="/lovable-uploads/8c51276e-0087-41f1-8dbb-414341ebdb5a.png" 
              alt="HPE Logo" 
              className="h-8 sm:h-10" 
            />
            <div className="hidden sm:block h-8 w-px bg-gray-300" />
            <h1 className="hidden sm:block text-sm sm:text-base font-semibold text-gray-900">
              Datacenter Audit Tool
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              item.subItems ? (
                <NavigationMenu 
                  key={item.name} 
                  onNavigate={
                    <div className="space-y-1 p-2">
                      {item.subItems.map((subItem) => (
                        <NavigationItem 
                          key={subItem.name} 
                          icon={subItem.icon} 
                          onClick={subItem.onClick}
                        >
                          {subItem.name}
                        </NavigationItem>
                      ))}
                    </div>
                  }
                >
                  <Button 
                    variant="ghost" 
                    className={`flex items-center space-x-2 px-3 py-2 text-sm sm:text-base ${item.active ? 'text-hpe-brand' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Button>
                </NavigationMenu>
              ) : (
                <Button 
                  key={item.name}
                  variant="ghost" 
                  className={`flex items-center space-x-2 px-3 py-2 text-sm sm:text-base ${item.active ? 'text-hpe-brand' : ''}`}
                  onClick={item.onClick}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Button>
              )
            ))}
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-white top-16 md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 overflow-y-auto max-h-[calc(100vh-4rem)]">
              {navItems.map((item) => (
                <div key={item.name} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => {
                      if (!item.subItems) {
                        item.onClick();
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-md ${
                      item.active ? 'bg-gray-100 text-hpe-brand' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                  
                  {item.subItems && (
                    <div className="pl-12 py-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.name}
                          onClick={() => {
                            subItem.onClick();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                        >
                          <subItem.icon className="mr-3 h-4 w-4" />
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                    <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
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
                  notifications.map(notification => (
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
              <DropdownMenuLabel>
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </DropdownMenuLabel>
              <DropdownMenuLabel className="text-sm font-normal text-gray-500">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div 
                  className="flex items-center w-full cursor-pointer" 
                  onClick={() => {
                    navigate("/settings");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
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