/**
 * @fileoverview Core TypeScript type definitions for the HPE Datacenter Audit Tool
 * Implements industry best practices for type safety and maintainability
 */

// Common utility types
export type Status = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Priority = 'urgent' | 'high' | 'normal' | 'low';

// User and Authentication types
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'admin' | 'technician' | 'manager' | 'viewer';
  readonly department: string;
  readonly avatar?: string;
  readonly permissions: readonly string[];
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly lastLoginAt?: Date;
}

// Location and Infrastructure types
export interface Datacenter {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly address: string;
  readonly timezone: string;
  readonly isActive: boolean;
}

export interface DataHall {
  readonly id: string;
  readonly name: string;
  readonly datacenterId: string;
  readonly floor: number;
  readonly capacity: number;
  readonly currentUsage: number;
  readonly isActive: boolean;
}

export interface Rack {
  readonly id: string;
  readonly name: string;
  readonly dataHallId: string;
  readonly position: {
    readonly row: string;
    readonly column: number;
  };
  readonly capacity: number;
  readonly currentUsage: number;
  readonly powerCapacity: number;
  readonly currentPowerUsage: number;
  readonly isActive: boolean;
}

// Audit-related types
export interface Audit {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly datacenterId: string;
  readonly dataHallId: string;
  readonly assignedTo: string;
  readonly createdBy: string;
  readonly status: Status;
  readonly priority: Priority;
  readonly scheduledDate: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly estimatedDuration: number; // in minutes
  readonly actualDuration?: number; // in minutes
  readonly issuesFound: number;
  readonly tags: readonly string[];
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AuditIssue {
  readonly id: string;
  readonly auditId: string;
  readonly rackId: string;
  readonly deviceType: string;
  readonly issueType: string;
  readonly severity: Severity;
  readonly title: string;
  readonly description: string;
  readonly recommendation?: string;
  readonly status: 'open' | 'in-progress' | 'resolved' | 'deferred';
  readonly assignedTo?: string;
  readonly priority: Priority;
  readonly attachments: readonly string[];
  readonly metadata: Record<string, unknown>;
  readonly detectedAt: Date;
  readonly resolvedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Incident-related types
export interface Incident {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: 'hardware' | 'software' | 'network' | 'power' | 'cooling' | 'security' | 'other';
  readonly severity: Severity;
  readonly priority: Priority;
  readonly status: 'open' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed';
  readonly datacenterId: string;
  readonly dataHallId?: string;
  readonly rackId?: string;
  readonly reportedBy: string;
  readonly assignedTo?: string;
  readonly assignedTeam?: string;
  readonly estimatedResolution?: Date;
  readonly actualResolution?: Date;
  readonly impact: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
  readonly affectedSystems: readonly string[];
  readonly tags: readonly string[];
  readonly attachments: readonly string[];
  readonly metadata: Record<string, unknown>;
  readonly reportedAt: Date;
  readonly acknowledgedAt?: Date;
  readonly resolvedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Report-related types
export interface Report {
  readonly id: string;
  readonly name: string;
  readonly type: 'audit-summary' | 'incident-detail' | 'compliance' | 'performance' | 'infrastructure' | 'security';
  readonly description?: string;
  readonly generatedBy: string;
  readonly parameters: Record<string, unknown>;
  readonly format: 'pdf' | 'csv' | 'xlsx' | 'json';
  readonly status: 'queued' | 'generating' | 'completed' | 'failed';
  readonly filePath?: string;
  readonly fileSize?: number;
  readonly downloadCount: number;
  readonly expiresAt?: Date;
  readonly metadata: Record<string, unknown>;
  readonly generatedAt: Date;
  readonly completedAt?: Date;
}

// Notification types
export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly type: 'audit' | 'incident' | 'report' | 'system' | 'maintenance';
  readonly title: string;
  readonly message: string;
  readonly severity?: Severity;
  readonly isRead: boolean;
  readonly actionUrl?: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;
  readonly readAt?: Date;
  readonly expiresAt?: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
  readonly timestamp: Date;
  readonly requestId: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

// Form and validation types
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface FormState<T = Record<string, unknown>> {
  readonly data: T;
  readonly errors: readonly ValidationError[];
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly touchedFields: readonly string[];
}

// Filter and search types
export interface FilterOptions {
  readonly dateRange?: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly status?: readonly Status[];
  readonly severity?: readonly Severity[];
  readonly priority?: readonly Priority[];
  readonly assignedTo?: readonly string[];
  readonly tags?: readonly string[];
  readonly datacenterId?: string;
  readonly dataHallId?: string;
}

export interface SearchOptions {
  readonly query: string;
  readonly fields?: readonly string[];
  readonly fuzzy?: boolean;
  readonly caseSensitive?: boolean;
}

export interface SortOptions {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

// UI Component prop types
export interface BaseComponentProps {
  readonly className?: string;
  readonly id?: string;
  readonly 'data-testid'?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
}

export interface ChildrenProps {
  readonly children: React.ReactNode;
}

export interface LoadingProps {
  readonly isLoading?: boolean;
  readonly loadingText?: string;
}

export interface ErrorProps {
  readonly error?: Error | string | null;
  readonly onRetry?: () => void;
}

// Accessibility types
export interface A11yProps {
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'aria-describedby'?: string;
  readonly 'aria-expanded'?: boolean;
  readonly 'aria-selected'?: boolean;
  readonly 'aria-disabled'?: boolean;
  readonly 'aria-hidden'?: boolean;
  readonly role?: string;
  readonly tabIndex?: number;
}

// Theme and styling types
export interface ThemeColors {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly foreground: string;
  readonly muted: string;
  readonly border: string;
  readonly destructive: string;
}

export interface BreakpointValues {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly '2xl': number;
}

// Constants for type safety
export const AUDIT_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'] as const;
export const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low', 'info'] as const;
export const PRIORITY_LEVELS = ['urgent', 'high', 'normal', 'low'] as const;
export const USER_ROLES = ['admin', 'technician', 'manager', 'viewer'] as const;
export const INCIDENT_CATEGORIES = ['hardware', 'software', 'network', 'power', 'cooling', 'security', 'other'] as const;
export const REPORT_TYPES = ['audit-summary', 'incident-detail', 'compliance', 'performance', 'infrastructure', 'security'] as const;
export const REPORT_FORMATS = ['pdf', 'csv', 'xlsx', 'json'] as const;