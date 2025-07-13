import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import Dashboard from "./Dashboard";
import AuditList from "./AuditList";
import IncidentList from "./IncidentList";
import Reports from "./Reports";
import StartAudit from "../pages/StartAudit";
import AuditIssueEntry from "../pages/AuditIssueEntry";
import AuditSummary from "../pages/AuditSummary";
import AuditComplete from "../pages/AuditComplete";
import NotFound from "../pages/NotFound";
import AuditDetails from "../pages/AuditDetails";
import IncidentDetails from "../pages/IncidentDetails";
import ReportDetails from "../pages/ReportDetails";
import Settings from "../pages/Settings";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-hpe flex flex-col">
      {/* Top header spanning full width */}
      <Header />
      {/* Main content area */}
      <div className="flex-1 overflow-auto pt-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/audits" element={<AuditList />} />
            <Route path="/audits/start" element={<StartAudit />} />
            <Route path="/audits/:id/issue" element={<AuditIssueEntry />} />
            <Route path="/audits/:id/summary" element={<AuditSummary />} />
            <Route path="/audits/:id/complete" element={<AuditComplete />} />
            <Route path="/audits/:id" element={<AuditDetails />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/incidents/:id" element={<IncidentDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetails />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;