import { describe, it, expect, beforeEach } from 'vitest';
import {
  createWarehouseBooking,
  validateWarehouseBookingInput,
  doesWarehouseMatchMandi,
  filterWarehouseBookingsForMandi,
  getFacilitiesForMandi,
  resetMemoryWarehouseBookings,
  INITIAL_SEED_WAREHOUSE_BOOKINGS,
} from '@/lib/warehouse-booking-service';
import { VERIFIED_STORAGE_FACILITIES } from '@/lib/cold-storage-service';
import { DEFAULT_MANDIS } from '@/lib/mandi-service';
import { NextRequest } from 'next/server';
import { GET as getMandiWarehouseBookings } from '@/app/api/mandi/warehouse-bookings/route';
import { POST as postWarehouseBooking } from '@/app/api/warehouse-bookings/route';

describe('Warehouse Slot Booking & Input Validation (Farmer Side)', () => {
  beforeEach(() => {
    resetMemoryWarehouseBookings();
  });

  it('rejects invalid or missing farmer names', () => {
    const res = validateWarehouseBookingInput({
      warehouse_id: 'cs-pun-01',
      farmer_name: ' ',
      farmer_phone: '8928909642',
      crop_name: 'Tomato',
      quantity_quintals: 20,
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Farmer full name must be at least 2 characters');
  });

  it('rejects invalid phone numbers that do not have 10 digits', () => {
    const res = validateWarehouseBookingInput({
      warehouse_id: 'cs-pun-01',
      farmer_name: 'Anagha Katkar',
      farmer_phone: '12345',
      crop_name: 'Tomato',
      quantity_quintals: 20,
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('valid 10-digit mobile number');
  });

  it('rejects zero or negative storage quantities', () => {
    const resZero = validateWarehouseBookingInput({
      warehouse_id: 'cs-pun-01',
      farmer_name: 'Anagha Katkar',
      farmer_phone: '8928909642',
      crop_name: 'Tomato',
      quantity_quintals: 0,
    });
    expect(resZero.valid).toBe(false);
    expect(resZero.error).toContain('greater than 0 quintals');

    const resNeg = validateWarehouseBookingInput({
      warehouse_id: 'cs-pun-01',
      farmer_name: 'Anagha Katkar',
      farmer_phone: '8928909642',
      crop_name: 'Tomato',
      quantity_quintals: -5,
    });
    expect(resNeg.valid).toBe(false);
    expect(resNeg.error).toContain('greater than 0 quintals');
  });

  it('rejects non-existent warehouse IDs', () => {
    const res = validateWarehouseBookingInput({
      warehouse_id: 'invalid-warehouse-999',
      farmer_name: 'Anagha Katkar',
      farmer_phone: '8928909642',
      crop_name: 'Tomato',
      quantity_quintals: 20,
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('warehouse or cold storage facility was not found');
  });

  it('successfully creates a booking with full token, status DONE, and manager details', async () => {
    const result = await createWarehouseBooking({
      warehouse_id: 'cs-pun-01',
      farmer_name: 'Anagha Katkar',
      farmer_phone: '8928909642',
      crop_name: 'Tomato',
      quantity_quintals: 20,
      storage_duration_months: 1,
    });

    expect(result.success).toBe(true);
    expect(result.booking).toBeDefined();

    const booking = result.booking!;
    expect(booking.ticket_number).toMatch(/^WH-CS-PUN-01-\d{8}-\d{4}$/);
    expect(booking.status).toBe('done');
    expect(booking.farmer_name).toBe('Anagha Katkar');
    expect(booking.farmer_phone).toBe('8928909642');
    expect(booking.crop_name).toBe('Tomato');
    expect(booking.quantity_quintals).toBe(20);
    expect(booking.rate_per_quintal_month).toBe(110);
    expect(booking.estimated_monthly_charge).toBe(2200); // 20 Qtl * 110/Qtl/Month
    expect(booking.warehouse_name).toBe('Pune Agro Cold Chain & CA Store');
    expect(booking.warehouse_address).toContain('Near Gultekdi APMC Gate 4');
    expect(booking.nearest_apmc_mandi).toBe('Pune APMC (Gultekdi Market Yard)');

    // Owner / Manager verification
    expect(booking.manager_name).toBe('Suresh More');
    expect(booking.manager_phone).toBe('+919822451122');
    expect(booking.manager_email).toBe('pune.coldchain@agristorage.in');
    expect(booking.license_no).toBe('WDRA-MH-PUN-2023-018');
  });
});

describe('Mandi Jurisdiction Warehouse Matching & Server Isolation', () => {
  const puneMandi = DEFAULT_MANDIS.find((m) => m.code === 'APMC-PUN-01')!;
  const nashikMandi = DEFAULT_MANDIS.find((m) => m.code === 'APMC-NSK-04')!;
  const solapurMandi = DEFAULT_MANDIS.find((m) => m.code === 'APMC-SOL-06')!;

  it('verifies that Pune Mandi matches only Pune warehouses', () => {
    const puneColdStore = VERIFIED_STORAGE_FACILITIES.find((f) => f.id === 'cs-pun-01')!;
    const puneGodown = VERIFIED_STORAGE_FACILITIES.find((f) => f.id === 'wh-pun-02')!;
    const nashikColdStore = VERIFIED_STORAGE_FACILITIES.find((f) => f.id === 'cs-nsk-01')!;

    expect(doesWarehouseMatchMandi(puneColdStore, puneMandi)).toBe(true);
    expect(doesWarehouseMatchMandi(puneGodown, puneMandi)).toBe(true);
    expect(doesWarehouseMatchMandi(nashikColdStore, puneMandi)).toBe(false);
  });

  it('verifies that Nashik Mandi matches only Nashik warehouses', () => {
    const puneColdStore = VERIFIED_STORAGE_FACILITIES.find((f) => f.id === 'cs-pun-01')!;
    const nashikColdStore = VERIFIED_STORAGE_FACILITIES.find((f) => f.id === 'cs-nsk-01')!;

    expect(doesWarehouseMatchMandi(nashikColdStore, nashikMandi)).toBe(true);
    expect(doesWarehouseMatchMandi(puneColdStore, nashikMandi)).toBe(false);
  });

  it('enforces isolation in filterWarehouseBookingsForMandi: Pune user vs Nashik user', () => {
    const puneBookings = filterWarehouseBookingsForMandi(INITIAL_SEED_WAREHOUSE_BOOKINGS, puneMandi);
    expect(puneBookings.length).toBe(2);
    expect(puneBookings.every((b) => b.nearest_apmc_mandi.includes('Pune'))).toBe(true);
    expect(puneBookings.some((b) => b.warehouse_name.includes('Nashik'))).toBe(false);

    const nashikBookings = filterWarehouseBookingsForMandi(INITIAL_SEED_WAREHOUSE_BOOKINGS, nashikMandi);
    expect(nashikBookings.length).toBe(1);
    expect(nashikBookings[0].warehouse_name).toBe('Nashik Agro Pre-Cooling & Cold Logistics');
    expect(nashikBookings.some((b) => b.warehouse_name.includes('Pune'))).toBe(false);

    // Solapur user has 0 bookings in initial seed (empty state handling)
    const solapurBookings = filterWarehouseBookingsForMandi(INITIAL_SEED_WAREHOUSE_BOOKINGS, solapurMandi);
    expect(solapurBookings).toEqual([]);
  });

  it('derives facilities accurately for a Mandi jurisdiction', () => {
    const puneFacilities = getFacilitiesForMandi(puneMandi);
    expect(puneFacilities.length).toBe(2);
    expect(puneFacilities.map((f) => f.id)).toContain('cs-pun-01');
    expect(puneFacilities.map((f) => f.id)).toContain('wh-pun-02');

    const nashikFacilities = getFacilitiesForMandi(nashikMandi);
    expect(nashikFacilities.length).toBe(1);
    expect(nashikFacilities[0].id).toBe('cs-nsk-01');
  });
});

describe('Server-Side API Route Authentication & Gating (/api/mandi/warehouse-bookings)', () => {
  beforeEach(() => {
    resetMemoryWarehouseBookings();
  });

  it('rejects unauthenticated requests without session with HTTP 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/mandi/warehouse-bookings');
    const res = await getMandiWarehouseBookings(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Unauthorized: Valid Mandi operator session required');
  });

  it('enforces server-side isolation for a Pune Mandi user and ignores client-supplied params', async () => {
    const puneMandiId = 'a1b2c3d4-e5f6-7890-abcd-111111111111';
    // User tries to sneak in client query parameter ?mandi_id=nashik
    const req = new NextRequest(
      'http://localhost:3000/api/mandi/warehouse-bookings?mandi_id=a1b2c3d4-e5f6-7890-abcd-444444444444',
      {
        headers: {
          'x-mandi-session-id': puneMandiId,
        },
      }
    );

    const res = await getMandiWarehouseBookings(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.mandi.id).toBe(puneMandiId);
    expect(data.mandi.name).toContain('Pune');

    // Must strictly return Pune bookings only, never Nashik
    expect(data.bookings.length).toBeGreaterThanOrEqual(2);
    data.bookings.forEach((booking: { nearest_apmc_mandi: string; warehouse_name: string }) => {
      expect(booking.nearest_apmc_mandi).toContain('Pune');
      expect(booking.warehouse_name).not.toContain('Nashik');
    });
  });

  it('enforces server-side isolation for a Nashik Mandi user', async () => {
    const nashikMandiId = 'a1b2c3d4-e5f6-7890-abcd-444444444444';
    const req = new NextRequest('http://localhost:3000/api/mandi/warehouse-bookings', {
      headers: {
        'x-mandi-session-id': nashikMandiId,
      },
    });

    const res = await getMandiWarehouseBookings(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.mandi.id).toBe(nashikMandiId);
    expect(data.mandi.name).toContain('Nashik');

    // Must strictly return Nashik bookings only, never Pune
    expect(data.bookings.length).toBe(1);
    expect(data.bookings[0].warehouse_name).toBe('Nashik Agro Pre-Cooling & Cold Logistics');
    expect(data.bookings.some((b: { warehouse_name: string }) => b.warehouse_name.includes('Pune'))).toBe(false);
  });
});

describe('Server-Side Booking Creation API (/api/warehouse-bookings)', () => {
  it('validates and creates warehouse booking via API endpoint', async () => {
    const req = new NextRequest('http://localhost:3000/api/warehouse-bookings', {
      method: 'POST',
      body: JSON.stringify({
        warehouse_id: 'cs-pun-01',
        farmer_name: 'Anagha Katkar',
        farmer_phone: '8928909642',
        crop_name: 'Tomato',
        quantity_quintals: 20,
      }),
    });

    const res = await postWarehouseBooking(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.booking.status).toBe('done');
    expect(data.booking.estimated_monthly_charge).toBe(2200);
    expect(data.booking.manager_name).toBe('Suresh More');
  });

  it('returns 400 for invalid booking payload via API', async () => {
    const req = new NextRequest('http://localhost:3000/api/warehouse-bookings', {
      method: 'POST',
      body: JSON.stringify({
        warehouse_id: 'cs-pun-01',
        farmer_name: '', // invalid
        farmer_phone: '8928909642',
        crop_name: 'Tomato',
        quantity_quintals: 20,
      }),
    });

    const res = await postWarehouseBooking(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

