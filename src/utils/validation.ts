/**
 * @fileoverview Validation utilities following industry best practices
 * Implements comprehensive form validation with accessibility support
 */

import { z } from 'zod';
import { ValidationError } from '@/types';

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number');

export const idSchema = z
  .string()
  .min(1, 'ID is required')
  .regex(/^[a-zA-Z0-9_-]+$/, 'ID can only contain letters, numbers, hyphens, and underscores');

// Audit-specific validation schemas
export const auditSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  datacenterId: idSchema,
  dataHallId: idSchema,
  assignedTo: idSchema,
  priority: z.enum(['urgent', 'high', 'normal', 'low'], {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
  scheduledDate: z
    .date()
    .min(new Date(), 'Scheduled date must be in the future'),
  estimatedDuration: z
    .number()
    .min(15, 'Estimated duration must be at least 15 minutes')
    .max(480, 'Estimated duration cannot exceed 8 hours'),
  tags: z
    .array(z.string().trim().min(1))
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .default([]),
});

export const auditIssueSchema = z.object({
  rackId: idSchema,
  deviceType: z
    .string()
    .min(1, 'Device type is required')
    .max(100, 'Device type must be less than 100 characters'),
  issueType: z
    .string()
    .min(1, 'Issue type is required')
    .max(100, 'Issue type must be less than 100 characters'),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info'], {
    errorMap: () => ({ message: 'Please select a valid severity level' }),
  }),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  recommendation: z
    .string()
    .max(1000, 'Recommendation must be less than 1000 characters')
    .optional(),
  priority: z.enum(['urgent', 'high', 'normal', 'low'], {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
});

// Incident validation schema
export const incidentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z.enum(['hardware', 'software', 'network', 'power', 'cooling', 'security', 'other'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info'], {
    errorMap: () => ({ message: 'Please select a valid severity level' }),
  }),
  priority: z.enum(['urgent', 'high', 'normal', 'low'], {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
  datacenterId: idSchema,
  dataHallId: idSchema.optional(),
  rackId: idSchema.optional(),
  assignedTo: idSchema.optional(),
  assignedTeam: z
    .string()
    .max(100, 'Team name must be less than 100 characters')
    .optional(),
  estimatedResolution: z
    .date()
    .min(new Date(), 'Estimated resolution must be in the future')
    .optional(),
  impact: z.enum(['none', 'minimal', 'moderate', 'significant', 'severe'], {
    errorMap: () => ({ message: 'Please select a valid impact level' }),
  }),
  affectedSystems: z
    .array(z.string().trim().min(1))
    .max(20, 'Cannot have more than 20 affected systems')
    .optional()
    .default([]),
  tags: z
    .array(z.string().trim().min(1))
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .default([]),
});

// User validation schema
export const userSchema = z.object({
  email: emailSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  role: z.enum(['admin', 'technician', 'manager', 'viewer'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  department: z
    .string()
    .min(1, 'Department is required')
    .max(100, 'Department must be less than 100 characters')
    .trim(),
});

// Report generation validation schema
export const reportSchema = z.object({
  name: z
    .string()
    .min(1, 'Report name is required')
    .max(255, 'Report name must be less than 255 characters')
    .trim(),
  type: z.enum(['audit-summary', 'incident-detail', 'compliance', 'performance', 'infrastructure', 'security'], {
    errorMap: () => ({ message: 'Please select a valid report type' }),
  }),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  format: z.enum(['pdf', 'csv', 'xlsx', 'json'], {
    errorMap: () => ({ message: 'Please select a valid format' }),
  }),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).refine(
    (data) => data.end > data.start,
    {
      message: 'End date must be after start date',
      path: ['end'],
    }
  ),
  filters: z.record(z.unknown()).optional(),
});

// Validation utility functions
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  fieldName: string
): ValidationError[] => {
  try {
    schema.parse(value);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map((err) => ({
        field: fieldName,
        message: err.message,
        code: err.code,
      }));
    }
    return [{
      field: fieldName,
      message: 'Validation failed',
      code: 'unknown_error',
    }];
  }
};

export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: boolean; errors: ValidationError[]; data?: T } => {
  try {
    const validatedData = schema.parse(data);
    return {
      isValid: true,
      errors: [],
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      return {
        isValid: false,
        errors,
      };
    }
    return {
      isValid: false,
      errors: [{
        field: 'form',
        message: 'Validation failed',
        code: 'unknown_error',
      }],
    };
  }
};

// Security validation utilities
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/['"]/g, '') // Remove quotes that could break SQL
    .slice(0, 1000); // Limit length to prevent DoS
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken) return false;
  return token === expectedToken;
};

export const validateFileUpload = (file: File): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    errors.push({
      field: 'file',
      message: 'File size must be less than 10MB',
      code: 'file_too_large',
    });
  }
  
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      message: 'File type not allowed',
      code: 'invalid_file_type',
    });
  }
  
  // Check filename
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    errors.push({
      field: 'file',
      message: 'Filename contains invalid characters',
      code: 'invalid_filename',
    });
  }
  
  return errors;
};

// Custom validation helpers
export const createCustomValidator = <T>(
  validator: (value: T) => boolean,
  errorMessage: string,
  errorCode = 'custom_validation'
) => {
  return (value: T): ValidationError[] => {
    if (!validator(value)) {
      return [{
        field: 'value',
        message: errorMessage,
        code: errorCode,
      }];
    }
    return [];
  };
};

// Date validation utilities
export const isBusinessDay = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
};

export const isBusinessHours = (date: Date): boolean => {
  const hours = date.getHours();
  return hours >= 9 && hours < 17; // 9 AM to 5 PM
};

export const validateBusinessDate = (date: Date): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!isBusinessDay(date)) {
    errors.push({
      field: 'date',
      message: 'Date must be a business day (Monday-Friday)',
      code: 'invalid_business_day',
    });
  }
  
  return errors;
};

// Export validation schemas for reuse
export const validationSchemas = {
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  id: idSchema,
  audit: auditSchema,
  auditIssue: auditIssueSchema,
  incident: incidentSchema,
  user: userSchema,
  report: reportSchema,
} as const;