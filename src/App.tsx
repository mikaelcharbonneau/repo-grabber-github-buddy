import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

import AppLayout from "./components/AppLayout";

// Configure React Query with best practices
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000,
      // 5 minutes
      gcTime: 10 * 60 * 1000 // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
      retryDelay: 1000
    }
  }
});
const App: React.FC = () => {
  // Error handler for development
  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Application Error:', error, errorInfo);
    // In production, send to error monitoring service
  }, []);
  return <ErrorBoundary onError={handleError} resetOnRouteChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppLayout />
              {/* Toast notifications */}
              <Toaster />
              <Sonner />
              {/* Screen reader announcements */}
              <div id="sr-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>;
};
export default App;