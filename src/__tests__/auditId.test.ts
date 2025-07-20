import { describe, it, expect, beforeEach } from 'vitest';
import { generateAuditId, resetSequenceCounter } from '@/utils/auditId';

describe('Audit ID Generation', () => {
  // Reset sequence counter before each test
  beforeEach(() => {
    resetSequenceCounter();
  });

  it('should generate an ID in the correct format', () => {
    // Mock the current date for consistent testing
    const mockDate = new Date('2025-07-19T12:00:00Z');
    const id = generateAuditId(mockDate);
    
    // Expected format: YYYYMMDD-AUD-QXX-XX
    const regex = /^\d{8}-AUD-Q0[1-4]-\d{2}$/;
    expect(id).toMatch(regex);
    
    // Check date part
    expect(id.startsWith('20250719')).toBe(true);
  });

  it('should increment sequence numbers correctly', () => {
    const mockDate = new Date('2025-07-19T12:00:00Z');
    
    // First ID
    const id1 = generateAuditId(mockDate);
    expect(id1.endsWith('-01')).toBe(true);
    
    // Second ID should increment sequence
    const id2 = generateAuditId(mockDate);
    expect(id2.endsWith('-01')).toBe(true);
    
    // Third ID with same date should increment sequence
    const id3 = generateAuditId(mockDate);
    expect(id3.endsWith('-02')).toBe(true);
  });

  it('should parse datahall names correctly', () => {
    const date = new Date('2025-02-15T12:00:00Z');

    const id1 = generateAuditId(date, undefined, 'Quebec island 01');
    expect(id1).toContain('-Q01-');

    const id2 = generateAuditId(date, undefined, 'Quebec island 02');
    expect(id2).toContain('-Q02-');

    const id3 = generateAuditId(date, undefined, 'Quebec island 03');
    expect(id3).toContain('-Q03-');

    const id4 = generateAuditId(date, undefined, 'Quebec island 04');
    expect(id4).toContain('-Q04-');
  });

  it('should reset sequence when it reaches 99', () => {
    const mockDate = new Date('2025-07-19T12:00:00Z');
    
    // Set sequence to 99
    for (let i = 0; i < 99; i++) {
      const id = generateAuditId(mockDate);
      console.log(`Generated ID ${i+1}: ${id}`);
    }
    
    // Next ID should be 99
    const id99 = generateAuditId(mockDate);
    console.log(`ID 99: ${id99}`);
    expect(id99.endsWith('-99')).toBe(true);
    
    // Following ID should reset to 01
    const id100 = generateAuditId(mockDate);
    console.log(`ID 100: ${id100}`);
    expect(id100.endsWith('-01')).toBe(true);
  });

  it('should handle different dates correctly', () => {
    const date1 = new Date('2025-01-01T00:00:00Z');
    const date2 = new Date('2025-12-31T23:59:59Z');
    
    console.log('Date 1:', date1.toISOString());
    const id1 = generateAuditId(date1);
    console.log('ID 1:', id1);
    
    console.log('Date 2:', date2.toISOString());
    const id2 = generateAuditId(date2);
    console.log('ID 2:', id2);
    
    // Different dates should have different date parts
    console.log('ID 1 starts with 20250101?:', id1.startsWith('20250101'));
    console.log('ID 2 starts with 20251231?:', id2.startsWith('20251231'));
    
    expect(id1.startsWith('20250101')).toBe(true);
    expect(id2.startsWith('20251231')).toBe(true);
    
    // Both should have sequence starting at 01
    console.log('ID 1 ends with -01?:', id1.endsWith('-01'));
    console.log('ID 2 ends with -01?:', id2.endsWith('-01'));
    
    expect(id1.endsWith('-01')).toBe(true);
    expect(id2.endsWith('-01')).toBe(true);
  });
});
