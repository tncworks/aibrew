import { Timestamp } from 'firebase-admin/firestore';

/**
 * Convert Firestore Timestamp or various date formats to JavaScript Date.
 * Returns null if conversion fails.
 */
export function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  // Handle Firestore Timestamp-like object (e.g., from JSON)
  if (
    value &&
    typeof value === 'object' &&
    '_seconds' in value &&
    typeof (value as { _seconds: number })._seconds === 'number'
  ) {
    return new Date((value as { _seconds: number })._seconds * 1000);
  }
  return null;
}

/**
 * Convert Firestore Timestamp to Date, with a fallback default value.
 */
export function toDateOrDefault(value: unknown, defaultValue: Date = new Date()): Date {
  return toDate(value) ?? defaultValue;
}
