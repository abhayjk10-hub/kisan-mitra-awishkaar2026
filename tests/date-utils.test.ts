import { describe, it, expect } from 'vitest';
import { toLocalISODate, getISTCurrentTime } from '@/lib/date-utils';

describe('Date & IST Timezone Helper (H5)', () => {
  it('correctly returns current date at 00:30 IST when UTC is still previous day (19:00 UTC)', () => {
    // 2026-11-04 00:30:00 IST is 2026-11-03 19:00:00Z UTC
    const dateAtMidnightHalfIST = new Date('2026-11-03T19:00:00.000Z');
    
    // Naive UTC date string would incorrectly return 2026-11-03
    expect(dateAtMidnightHalfIST.toISOString().split('T')[0]).toBe('2026-11-03');
    
    // toLocalISODate must return 2026-11-04
    expect(toLocalISODate(dateAtMidnightHalfIST)).toBe('2026-11-04');
  });

  it('correctly returns current date at 23:30 IST (18:00 UTC)', () => {
    // 2026-11-04 23:30:00 IST is 2026-11-04 18:00:00Z UTC
    const dateAtLateNightIST = new Date('2026-11-04T18:00:00.000Z');
    expect(toLocalISODate(dateAtLateNightIST)).toBe('2026-11-04');
  });

  it('extracts IST hours and minutes accurately', () => {
    const dateAtMidnightHalfIST = new Date('2026-11-03T19:30:00.000Z');
    const [h, m] = getISTCurrentTime(dateAtMidnightHalfIST);
    expect(h).toBe(1);
    expect(m).toBe(0);
  });
});

