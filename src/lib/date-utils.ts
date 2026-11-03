/**
 * Kisan Mitra - Date and Timezone Utilities
 * Enforces Asia/Kolkata (IST, UTC+05:30) timezone rules across all client and server operations.
 */

/**
 * Returns the current date (or the date corresponding to the provided timestamp)
 * as an ISO 'YYYY-MM-DD' string strictly in the 'Asia/Kolkata' timezone.
 *
 * Prevents UTC day-rollover bugs where timestamps between 00:00 and 05:30 IST
 * yield the previous calendar date.
 */
export function toLocalISODate(date: Date | string | number = new Date()): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided to toLocalISODate: ${date}`);
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Returns current hours and minutes in IST as numbers [hour, minute].
 */
export function getISTCurrentTime(date: Date = new Date()): [number, number] {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return [hour, minute];
}

