import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Header from "./Header";
import Dashboard from "./Dashboard";
import AuditList from "./AuditList";
import IncidentList from "./IncidentList";
import Reports from "./Reports";
import StartAudit from "../pages/StartAudit";
import AuditIssueEntry from "../pages/AuditIssueEntry";
import AuditSummary from "../pages/AuditSummary";
import AuditComplete from "../pages/AuditComplete";
import AuditWalkthrough from "../pages/AuditWalkthrough";
import NotFound from "../pages/NotFound";
import AuditDetails from "../pages/AuditDetails";
import IncidentDetails from "../pages/IncidentDetails";
import ReportDetails from "../pages/ReportDetails";
import Settings from "../pages/Settings";
import Auth from "../pages/Auth";
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen font-hpe bg-inherit">
      <Routes>
        {/* Public routes (no auth required) */}
        <Route path="/auth" element={
          <AuthGuard requireAuth={false}>
            <Auth />
          </AuthGuard>
        } />
        
        {/* Protected routes (auth required) */}
        <Route path="/*" element={
          <AuthGuard requireAuth={true}>
            <div className="flex flex-col">
              {/* Top header spanning full width */}
              <Header />
              {/* Main content area */}
              <div className="flex-1 bg-black/[0.02] pt-20">
                <div className="min-h-full w-full overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/audits" element={<AuditList />} />
                    <Route path="/audits/start" element={<StartAudit />} />
                    <Route path="/audit/walkthrough" element={<AuditWalkthrough />} />
                    <Route path="/audit/start" element={<StartAudit />} />
                    <Route path="/audit/issues" element={<AuditIssueEntry />} />
                    <Route path="/audit/summary" element={<AuditSummary />} />
                    <Route path="/audit/complete" element={<AuditComplete />} />
                    <Route path="/audits/:id/issue" element={<AuditIssueEntry />} />
                    <Route path="/audits/:id/summary" element={<AuditSummary />} />
                    <Route path="/audits/:id/complete" element={<AuditComplete />} />
                    <Route path="/audits/:id" element={<AuditDetails />} />
                    <Route path="/incidents" element={<IncidentList />} />
                    <Route path="/incidents/:id" element={<IncidentDetails />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/reports/:id" element={<ReportDetails />} />
                    
                    {/* Role-based protected routes */}
                    <Route path="/settings" element={
                      <AuthGuard requiredRoles={['admin', 'manager']}>
                        <Settings />
                      </AuthGuard>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </div>
          </AuthGuard>
        } />
      </Routes>
    </div>
  );
};
export default AppLayout;