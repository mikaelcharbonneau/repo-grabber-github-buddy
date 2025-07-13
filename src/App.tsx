
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import AuditList from "./components/AuditList";
import IncidentList from "./components/IncidentList";
import Reports from "./components/Reports";
import StartAudit from "./pages/StartAudit";
import AuditIssueEntry from "./pages/AuditIssueEntry";
import AuditSummary from "./pages/AuditSummary";
import AuditComplete from "./pages/AuditComplete";
import NotFound from "./pages/NotFound";
import AuditDetails from "./pages/AuditDetails";
import IncidentDetails from "./pages/IncidentDetails";
import ReportDetails from "./pages/ReportDetails";
import Settings from "./pages/Settings";


// Configure React Query with best practices
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const App: React.FC = () => {
  // Error handler for development
  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Application Error:', error, errorInfo);
    // In production, send to error monitoring service
  }, []);

  

  return (
    <ErrorBoundary onError={handleError} resetOnRouteChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-white font-hpe">
              <Header />
              <main 
                className="flex-1 overflow-auto"
                id="main-content"
                role="main"
                aria-label="Main content area"
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/audits" element={<AuditList />} />
                  <Route path="/incidents" element={<IncidentList />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/audit/start" element={<StartAudit />} />
                  <Route path="/audit/issues" element={<AuditIssueEntry />} />
                  <Route path="/audit/summary" element={<AuditSummary />} />
                  <Route path="/audit/complete" element={<AuditComplete />} />
                  <Route path="/audit/details/:id" element={<AuditDetails />} />
                  <Route path="/incident/details/:id" element={<IncidentDetails />} />
                  <Route path="/report/details/:id" element={<ReportDetails />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            
            {/* Toast notifications */}
            <Toaster />
            <Sonner />
            
            {/* Screen reader announcements */}
            <div
              id="sr-announcements"
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
