import { useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import AppLayout from "./components/AppLayout";
import Auth from "./pages/Auth";

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
// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Public Route component (redirects to dashboard if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => {
  // Error handler for development
  const handleError = useCallback((error: Error, errorInfo: any) => {
    console.error('Application Error:', error, errorInfo);
    // In production, send to error monitoring service
  }, []);
  
  return (
    <ErrorBoundary onError={handleError} resetOnRouteChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/auth" 
                element={
                  <PublicRoute>
                    <Auth />
                  </PublicRoute>
                } 
              />

              {/* Protected routes */}
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster />
            <Sonner />
            {/* Screen reader announcements */}
            <div id="sr-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
export default App;