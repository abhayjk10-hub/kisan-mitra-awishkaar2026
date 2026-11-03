import { describe, it, expect } from 'vitest';
import {
  generateSlotTimes,
  generateTokenNumber,
  canCancelSlotBooking,
  createSlotBooking,
} from '@/lib/mandi-service';
import { toLocalISODate } from '@/lib/date-utils';

describe('Slot Booking Logic & Generation (H3, H4, H5)', () => {
  it('generates 30-minute slots between opening and closing time', () => {
    const slots = generateSlotTimes('08:00', '10:00');
    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({
      start: '08:00',
      end: '08:30',
      label: '08:00 – 08:30',
    });
    expect(slots[3]).toEqual({
      start: '09:30',
      end: '10:00',
      label: '09:30 – 10:00',
    });
  });

  it('generates token numbers using mandi code and padded sequence', () => {
    const token = generateTokenNumber('APMC-PUN-01', '2026-11-04', 5);
    // cleanCode: 'PUN' (last 3 alphanumeric chars of 'APMCPUN01' or code), cleanDate: '1104', padded: '005'
    expect(token).toBe('TK-N01-1104-005');

    const token2 = generateTokenNumber('PUN', '2026-11-04', 12);
    expect(token2).toBe('TK-PUN-1104-012');
  });

  it('strictly validates 1-day advance notice for cancellation in IST', () => {
    const todayIST = toLocalISODate();
    
    // Cancellation for today must be rejected
    const checkToday = canCancelSlotBooking(todayIST);
    expect(checkToday.allowed).toBe(false);
    expect(checkToday.message).toContain('Cancellations are only allowed up to 1 day before');

    // Cancellation for tomorrow must be allowed
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIST = toLocalISODate(tomorrow);
    const checkTomorrow = canCancelSlotBooking(tomorrowIST);
    expect(checkTomorrow.allowed).toBe(true);

    // Cancellation for past date must be rejected
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIST = toLocalISODate(yesterday);
    const checkYesterday = canCancelSlotBooking(yesterdayIST);
    expect(checkYesterday.allowed).toBe(false);
  });

  it('evaluates boundary times at 23:59 IST and 00:01 IST correctly for cancellation', () => {
    // 23:59 IST is 18:29 UTC
    const lateNightIST = new Date('2026-11-03T18:29:00.000Z');
    const todayDate = toLocalISODate(lateNightIST);
    expect(todayDate).toBe('2026-11-03');

    // At 23:59 IST on Nov 3, booking for Nov 3 is disallowed
    expect(canCancelSlotBooking('2026-11-03', lateNightIST).allowed).toBe(false);
    // Booking for Nov 4 is allowed (1 day ahead)
    expect(canCancelSlotBooking('2026-11-04', lateNightIST).allowed).toBe(true);

    // 00:01 IST on Nov 4 is 18:31 UTC on Nov 3
    const earlyMorningIST = new Date('2026-11-03T18:31:00.000Z');
    const nextDate = toLocalISODate(earlyMorningIST);
    expect(nextDate).toBe('2026-11-04');

    // At 00:01 IST on Nov 4, booking for Nov 4 is now disallowed (it is today)
    expect(canCancelSlotBooking('2026-11-04', earlyMorningIST).allowed).toBe(false);
    // Booking for Nov 5 is allowed
    expect(canCancelSlotBooking('2026-11-05', earlyMorningIST).allowed).toBe(true);
  });

  it('creates slot booking and generates a token without errors', async () => {
    const bookingResult = await createSlotBooking({
      mandi_id: 'a1b2c3d4-e5f6-7890-abcd-111111111111',
      mandi_name: 'Pune APMC Market Yard',
      farmer_name: 'Ramesh Patil',
      farmer_phone: '9876543210',
      crop_name: 'Soybean',
      quantity_quintals: 25,
      vehicle_number: 'MH-12-AB-1234',
      booking_date: '2026-11-10',
      slot_start_time: '09:00',
      slot_end_time: '09:30',
      is_walkin: false,
    });

    expect(bookingResult.error).toBeUndefined();
    expect(bookingResult.booking).toBeDefined();
    expect(bookingResult.booking.token_number).toMatch(/^TK-/);
    expect(bookingResult.booking.status).toBe('waiting');
  });
});
