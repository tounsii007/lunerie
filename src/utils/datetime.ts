export function safeIsoDate(value: string | number | Date | undefined, fallback = new Date()): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback.toISOString() : parsed.toISOString();
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback.toISOString() : parsed.toISOString();
  }

  return fallback.toISOString();
}
