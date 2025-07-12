
import { 
  Grid2x2, 
  Clipboard, 
  Shield, 
  Database,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Settings
} from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <Menubar className="bg-white border-b border-gray-200 px-6 py-2">
      <MenubarMenu>
        <MenubarTrigger className="flex items-center space-x-2">
          <Grid2x2 className="h-4 w-4" />
          <span>Dashboard</span>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => navigate("/")}>
            <Grid2x2 className="mr-2 h-4 w-4" />
            Overview
          </MenubarItem>
          <MenubarItem>
            <Calendar className="mr-2 h-4 w-4" />
            Recent Activity
          </MenubarItem>
          <MenubarItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="flex items-center space-x-2">
          <Clipboard className="h-4 w-4" />
          <span>Audits</span>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => navigate("/audits")}>
            <Clipboard className="mr-2 h-4 w-4" />
            View All Audits
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => navigate("/audit/start")}>
            <Plus className="mr-2 h-4 w-4" />
            Start New Audit
          </MenubarItem>
          <MenubarItem>
            <Search className="mr-2 h-4 w-4" />
            Search Audits
          </MenubarItem>
          <MenubarItem>
            <Filter className="mr-2 h-4 w-4" />
            Filter by Status
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Incidents</span>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => navigate("/incidents")}>
            <Shield className="mr-2 h-4 w-4" />
            View All Incidents
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Plus className="mr-2 h-4 w-4" />
            Report New Incident
          </MenubarItem>
          <MenubarItem>
            <Search className="mr-2 h-4 w-4" />
            Search Incidents
          </MenubarItem>
          <MenubarItem>
            <Filter className="mr-2 h-4 w-4" />
            Filter by Severity
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="flex items-center space-x-2">
          <Database className="h-4 w-4" />
          <span>Reports</span>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => navigate("/reports")}>
            <Database className="mr-2 h-4 w-4" />
            View Reports
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </MenubarItem>
          <MenubarItem>
            <Calendar className="mr-2 h-4 w-4" />
            Scheduled Reports
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default Navigation;
