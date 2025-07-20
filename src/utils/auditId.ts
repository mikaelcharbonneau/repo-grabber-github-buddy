/**
 * Generates a unique audit ID in the format: YYYYMMDD-AUD-QXX-XX
 * Where:
 * - YYYYMMDD is the current date
 * - AUD is a static identifier
 * - QXX represents the quarter (Q1-Q4)
 * - XX is a sequential number for the audit in that quarter
 */

/**
 * Gets the current quarter (1-4) based on the current date
 */
function getCurrentQuarter(): number {
  const month = new Date().getMonth() + 1; // getMonth() is 0-indexed
  return Math.ceil(month / 3);
}

/**
 * Pads a number with leading zeros to ensure it has at least 2 digits
 */
function padNumber(num: number, length = 2): string {
  return num.toString().padStart(length, '0');
}

// In-memory counter for sequence number (in a real app, this should be persisted in the database)
let sequenceCounter = 1;
const MAX_SEQUENCE = 99; // Maximum sequence number before rolling over

/**
 * Generates a unique audit ID
 * @param date Optional date to use for the ID (defaults to current date)
 * @param sequence Optional sequence number (auto-increments if not provided)
 * @returns Formatted audit ID string
 */
export function generateAuditId(date: Date = new Date(), sequence?: number): string {
  // Format date as YYYYMMDD
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const dateStr = `${year}${month}${day}`;
  
  // Get quarter (1-4)
  const quarter = getCurrentQuarter();
  
  // Use provided sequence or increment the counter
  let seqNum = sequence || sequenceCounter++;
  
  // Reset sequence if it exceeds max (or handle overflow as needed)
  if (seqNum > MAX_SEQUENCE) {
    seqNum = 1; // Reset to 1 or handle overflow differently
    sequenceCounter = 2; // Reset counter to next value
  } else if (!sequence) {
    sequenceCounter = seqNum + 1; // Update counter for next call
  }
  
  // Format sequence with leading zeros
  const seqStr = padNumber(seqNum);
  
  // Combine all parts
  return `${dateStr}-AUD-Q${padNumber(quarter)}-${seqStr}`;
}

/**
 * Resets the sequence counter (useful for testing)
 */
export function resetSequenceCounter(): void {
  sequenceCounter = 1;
}
