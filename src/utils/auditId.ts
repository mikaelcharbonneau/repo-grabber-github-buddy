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
 * @param date The date to get the quarter for
 */
function getQuarter(date: Date): string {
  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  const quarter = Math.ceil(month / 3);
  return quarter.toString().padStart(2, '0');
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

/**
 * Generates a unique audit ID
 * @param date Optional date to use for the ID (defaults to current date)
 * @param sequence Optional sequence number (auto-increments if not provided)
 * @returns Formatted audit ID string
 */
export function generateAuditId(date: Date = new Date(), sequence?: number): string {
  // Create a new date object to ensure we're working with a clean copy
  const dateObj = new Date(date);
  
  // Format date as YYYYMMDD using UTC to avoid timezone issues
  const year = dateObj.getUTCFullYear();
  const month = padNumber(dateObj.getUTCMonth() + 1);
  const day = padNumber(dateObj.getUTCDate());
  const dateStr = `${year}${month}${day}`;
  
  // Get quarter (01-04)
  const quarter = getQuarter(dateObj);
  
  // Create a unique key for this date and quarter
  const sequenceKey = `${dateStr}-Q${quarter}`;
  
  // Handle sequence number
  let seqNum: number;
  
  if (sequence !== undefined) {
    // Use the provided sequence number for testing
    seqNum = sequence;
    // Don't update the counter when a specific sequence is provided
  } else {
    // For normal operation, get the next sequence number
    if (sequenceCounters[sequenceKey] === undefined) {
      // First time for this key, start at 1
      seqNum = 1;
      sequenceCounters[sequenceKey] = 1; // Next will be 1
    } else {
      // Get the current sequence number
      seqNum = sequenceCounters[sequenceKey];
      
      // If we've reached the max, reset to 1 for the next time
      if (seqNum >= 99) {
        sequenceCounters[sequenceKey] = 1;
      } else {
        // Otherwise, increment for next time
        sequenceCounters[sequenceKey] = seqNum + 1;
      }
    }
  }
  
  // Format sequence with leading zeros
  const seqStr = padNumber(seqNum);
  
  // Combine all parts
  return `${dateStr}-AUD-Q${quarter}-${seqStr}`;
}

/**
 * Resets the sequence counters (useful for testing)
 */
export function resetSequenceCounter(): void {
  sequenceCounters = {};
}
