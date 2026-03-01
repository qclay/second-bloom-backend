/**
 * Serialize a date to ISO string for API responses. Returns null for null/undefined.
 */
export function toISOString(
  value: Date | string | null | undefined,
): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}
