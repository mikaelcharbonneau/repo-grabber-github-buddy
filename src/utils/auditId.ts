/**
 * Generates a unique audit ID in the format: YYYYMMDD-AUD-QXX-XX
 * Where:
 * - YYYYMMDD is the current date
 * - AUD is a static identifier
 * - QXX represents the quarter (Q1-Q4)
 * - XX is a sequential number for the audit in that quarter
 */

/**
 * Gets the current quarter (1-4) based on the provided date
 * @param date The date to get the quarter for (defaults to current date)
 */
function getQuarter(date: Date = new Date()): number {
  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  return Math.floor((month - 1) / 3) + 1;
}

/**
 * Pads a number with leading zeros to ensure it has at least 2 digits
 */
function padNumber(num: number, length = 2): string {
  return num.toString().padStart(length, '0');
}

// In-memory counter for sequence number (in a real app, this should be persisted in the database)
let sequenceCounters: Record<string, number> = {};
const MAX_SEQUENCE = 99; // Maximum sequence number before rolling over

// Helper function to get the sequence key for a given date and quarter
function getSequenceKey(date: Date, quarter: number): string {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  return `${year}${month}${day}-Q${quarter}`;
}

/**
 * Generates a unique audit ID
 * @param date Optional date to use for the ID (defaults to current date)
 * @param sequence Optional sequence number (auto-increments if not provided)
 * @returns Formatted audit ID string
 */
export function generateAuditId(date: Date = new Date(), sequence?: number): string {
  // Create a new date object to ensure we're working with a clean copy
  const dateObj = new Date(date);
  
  // Format date as YYYYMMDD
  const year = dateObj.getFullYear();
  const month = padNumber(dateObj.getMonth() + 1);
  const day = padNumber(dateObj.getDate());
  const dateStr = `${year}${month}${day}`;
  
  // Get quarter (1-4)
  const quarter = getQuarter(dateObj);
  
  // Get the sequence key for this date and quarter
  const sequenceKey = getSequenceKey(dateObj, quarter);
  
  // Handle sequence number
  let seqNum: number;
  
  if (sequence !== undefined) {
    // Use the provided sequence number for testing
    seqNum = sequence;
    // Set the next sequence to be one more than the provided sequence
    sequenceCounters[sequenceKey] = sequence + 1;
  } else {
    // For normal operation, get the next sequence number
    if (sequenceCounters[sequenceKey] === undefined) {
      // First time for this key, start at 1
      seqNum = 1;
      sequenceCounters[sequenceKey] = 2; // Next will be 2
    } else {
      // Get the current sequence number
      seqNum = sequenceCounters[sequenceKey];
      
      // Increment for next time, handling reset if needed
      if (seqNum >= MAX_SEQUENCE) {
        sequenceCounters[sequenceKey] = 1; // Will wrap around to 1 next time
      } else {
        sequenceCounters[sequenceKey] = seqNum + 1;
      }
    }
  }
  
  // Format sequence with leading zeros
  const seqStr = padNumber(seqNum);
  
  // Combine all parts
  return `${dateStr}-AUD-Q${padNumber(quarter)}-${seqStr}`;
}

/**
 * Resets the sequence counters (useful for testing)
 */
export function resetSequenceCounter(): void {
  sequenceCounters = {};
}
