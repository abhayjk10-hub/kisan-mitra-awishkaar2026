import { describe, it, expect } from 'vitest';
import { registerMandi, loginMandi, COMMON_MANDI_PASSWORD } from '@/lib/mandi-service';

describe('Mandi Registration Validation (M2)', () => {
  it('rejects invalid latitude and longitude ranges', async () => {
    const invalidLat = await registerMandi({
      name: 'Test APMC',
      code: 'APMC-TEST-99',
      district: 'Pune',
      state: 'Maharashtra',
      address: 'Test address',
      latitude: 105, // > 90
      longitude: 74,
      contact_person: 'Admin',
      contact_phone: '+919876543210',
      contact_email: 'test@example.com',
      slot_capacity: 6,
      opening_time: '06:00',
      closing_time: '18:00',
    });
    expect(invalidLat.error).toContain('Latitude must be between -90 and 90');

    const invalidLng = await registerMandi({
      name: 'Test APMC',
      code: 'APMC-TEST-99',
      district: 'Pune',
      state: 'Maharashtra',
      address: 'Test address',
      latitude: 18.5,
      longitude: 195, // > 180
      contact_person: 'Admin',
      contact_phone: '+919876543210',
      contact_email: 'test@example.com',
      slot_capacity: 6,
      opening_time: '06:00',
      closing_time: '18:00',
    });
    expect(invalidLng.error).toContain('longitude between -180 and 180');
  });

  it('rejects duplicate mandi code against existing mandis', async () => {
    const dup = await registerMandi({
      name: 'Duplicate Pune Yard',
      code: 'APMC-PUN-01', // Already in DEFAULT_MANDIS
      district: 'Pune',
      state: 'Maharashtra',
      address: 'Test address',
      latitude: 18.49,
      longitude: 73.86,
      contact_person: 'Admin',
      contact_phone: '+919876543210',
      contact_email: 'test@example.com',
      slot_capacity: 6,
      opening_time: '06:00',
      closing_time: '18:00',
    });
    expect(dup.error).toContain('already registered');
  });

  describe('Mandi Portal Authentication & Code Resolution', () => {
    it('successfully logs in with APMC-PUN-01 and common password', async () => {
      const res = await loginMandi('APMC-PUN-01', COMMON_MANDI_PASSWORD);
      expect(res.error).toBeUndefined();
      expect(res.session).toBeDefined();
      expect(res.session?.mandi.code).toBe('APMC-PUN-01');
      expect(res.session?.mandi.name).toContain('Pune');
    });

    it('successfully logs in with APMC-NSK-04 and common password', async () => {
      const res = await loginMandi('APMC-NSK-04', COMMON_MANDI_PASSWORD);
      expect(res.error).toBeUndefined();
      expect(res.session).toBeDefined();
      expect(res.session?.mandi.code).toBe('APMC-NSK-04');
      expect(res.session?.mandi.name).toContain('Nashik');
    });

    it('successfully logs in with screenshot code APMC-MGP-08 (Nagpur alternate)', async () => {
      const res = await loginMandi('APMC-MGP-08', COMMON_MANDI_PASSWORD);
      expect(res.error).toBeUndefined();
      expect(res.session).toBeDefined();
      expect(res.session?.mandi.code).toBe('APMC-MGP-08');
      expect(res.session?.mandi.name).toContain('Nagpur');
    });

    it('rejects non-existent yard code with exact error message', async () => {
      const res = await loginMandi('APMC-UNKNOWN-99', COMMON_MANDI_PASSWORD);
      expect(res.session).toBeNull();
      expect(res.error).toContain('No registered mandi found with code "APMC-UNKNOWN-99"');
    });

    it('rejects invalid password for registered mandi', async () => {
      const res = await loginMandi('APMC-PUN-01', 'wrong_password_123');
      expect(res.session).toBeNull();
      expect(res.error).toContain('Invalid operator credentials');
    });
  });
});


