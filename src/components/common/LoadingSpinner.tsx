/**
 * @fileoverview Accessible loading spinner component
 * Implements WCAG guidelines for loading states and animations
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'muted';
  className?: string;
  label?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
} as const;

const variantClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted-foreground',
} as const;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  label = 'Loading...',
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        className
      )}
      role="status"
      aria-label={ariaLabel || label}
      aria-live="polite"
      data-testid={testId}
    >
      <svg
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          !reducedMotion && 'animate-spin'
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  backdropClassName?: string;
  spinnerSize?: LoadingSpinnerProps['size'];
  'data-testid'?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  loadingText = 'Loading content...',
  className,
  backdropClassName,
  spinnerSize = 'lg',
  'data-testid': testId,
}) => {
  return (
    <div 
      className={cn('relative', className)}
      data-testid={testId}
    >
      {children}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10',
            backdropClassName
          )}
          aria-live="assertive"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <LoadingSpinner 
              size={spinnerSize} 
              label={loadingText}
              aria-label={loadingText}
            />
            <p className="text-sm text-muted-foreground font-medium">
              {loadingText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  'data-testid'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  'data-testid': testId,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'bg-muted rounded-md',
        !reducedMotion && 'animate-pulse',
        className
      )}
      aria-hidden="true"
      data-testid={testId}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  'data-testid'?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  className,
  'data-testid': testId,
}) => {
  return (
    <div 
      className={cn('space-y-2', className)}
      data-testid={testId}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-4',
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

interface LoadingCardProps {
  title?: boolean;
  lines?: number;
  className?: string;
  'data-testid'?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = true,
  lines = 3,
  className,
  'data-testid': testId,
}) => {
  return (
    <div 
      className={cn('p-6 border rounded-lg space-y-4', className)}
      data-testid={testId}
      aria-hidden="true"
    >
      {title && <Skeleton className="h-6 w-1/2" />}
      <SkeletonText lines={lines} />
    </div>
  );
};

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  'data-testid'?: string;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 4,
  className,
  'data-testid': testId,
}) => {
  return (
    <div 
      className={cn('space-y-3', className)}
      data-testid={testId}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-6" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-8"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Higher-order component for adding loading states
export const withLoading = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return React.forwardRef<
    React.ElementRef<typeof WrappedComponent>,
    P & { isLoading?: boolean; loadingText?: string }
  >(({ isLoading, loadingText, ...props }, ref) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner label={loadingText} />
        </div>
      );
    }

    return <WrappedComponent ref={ref} {...(props as P)} />;
  });
};