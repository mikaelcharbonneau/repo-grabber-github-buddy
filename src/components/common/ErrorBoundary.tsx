/**
 * @fileoverview Error Boundary component following React best practices
 * Implements comprehensive error handling with logging and user-friendly fallbacks
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnRouteChange?: boolean;
  maxRetries?: number;
  showDetails?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnRouteChange = true } = this.props;
    
    if (resetOnRouteChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, send to error monitoring service like Sentry
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Props:', this.props);
    console.groupEnd();

    // Example: Send to monitoring service
    // window.errorService?.captureException(error, {
    //   tags: {
    //     component: 'ErrorBoundary',
    //     retryCount: this.state.retryCount,
    //   },
    //   extra: {
    //     componentStack: errorInfo.componentStack,
    //     props: this.props,
    //   },
    // });
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private renderErrorDetails = () => {
    const { showDetails = process.env.NODE_ENV === 'development' } = this.props;
    const { error, errorInfo } = this.state;

    if (!showDetails || !error) return null;

    return (
      <Card className="mt-4 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Bug className="h-5 w-5" />
            Error Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Error Message:</h4>
            <code className="text-sm bg-muted p-2 rounded block overflow-x-auto">
              {error.message}
            </code>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Stack Trace:</h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">
              {error.stack}
            </pre>
          </div>
          
          {errorInfo && (
            <div>
              <h4 className="font-medium mb-2">Component Stack:</h4>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  private renderErrorFallback = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;
    const canRetry = retryCount < maxRetries;

    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-background"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-lg w-full space-y-6">
          <Card className="border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  An unexpected error occurred while loading this page. Our team has been notified and is working to resolve the issue.
                </AlertDescription>
              </Alert>

              {retryCount > 0 && (
                <Alert>
                  <AlertDescription>
                    Retry attempt {retryCount} of {maxRetries}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1"
                    aria-label={`Retry loading (attempt ${retryCount + 1} of ${maxRetries})`}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1"
                  aria-label="Return to homepage"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleRefresh}
                  className="flex-1"
                  aria-label="Refresh the current page"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Error ID: {Date.now().toString(36)}</p>
                <p>If this problem persists, please contact support.</p>
              </div>
            </CardContent>
          </Card>

          {this.renderErrorDetails()}
        </div>
      </div>
    );
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || this.renderErrorFallback();
    }

    return children;
  }
}

export default ErrorBoundary;

/**
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
};

/**
 * Hook for handling errors in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by Error Boundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
};