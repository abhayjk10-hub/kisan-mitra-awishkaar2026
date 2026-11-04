/**
 * Warehouse & Cold Storage Booking Service
 * Handles farmer storage slot reservations, ticket generation,
 * and server/client mandi-jurisdiction matching.
 */

import { StorageFacility, VERIFIED_STORAGE_FACILITIES } from './cold-storage-service';
import { Mandi, DEFAULT_MANDIS } from './mandi-service';
import { WarehouseBooking, CreateWarehouseBookingInput } from '@/types/warehouse';
import { createClient, hasValidSupabaseConfig } from './supabase/client';

const STORAGE_KEY_WH_BOOKINGS = 'km_warehouse_bookings_list';
const STORAGE_KEY_LATEST_FARMER_WH_BOOKING = 'km_latest_farmer_warehouse_booking';

// Canonical Seed Bookings for offline/demo/testing resilience
export const INITIAL_SEED_WAREHOUSE_BOOKINGS: WarehouseBooking[] = [
  {
    id: 'b1111111-2222-3333-4444-555555555001',
    ticket_number: 'WH-PUN-20261104-1001',
    warehouse_id: 'cs-pun-01',
    warehouse_name: 'Pune Agro Cold Chain & CA Store',
    warehouse_type: 'cold_storage',
    warehouse_address: 'Near Gultekdi APMC Gate 4, Market Yard, Pune 411037',
    nearest_apmc_mandi: 'Pune APMC (Gultekdi Market Yard)',
    mandi_id: 'a1b2c3d4-e5f6-7890-abcd-111111111111',
    farmer_name: 'Anagha Katkar',
    farmer_phone: '8928909642',
    crop_name: 'Tomato',
    quantity_quintals: 20,
    rate_per_quintal_month: 110,
    estimated_monthly_charge: 2200,
    storage_duration_months: 1,
    temperature_range: '0°C to 4°C',
    humidity_range: '90% - 95% RH',
    manager_name: 'Suresh More',
    manager_phone: '+919822451122',
    manager_email: 'pune.coldchain@agristorage.in',
    license_no: 'WDRA-MH-PUN-2023-018',
    status: 'done',
    booked_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b1111111-2222-3333-4444-555555555002',
    ticket_number: 'WH-PUN-20261104-1002',
    warehouse_id: 'wh-pun-02',
    warehouse_name: 'Maharashtra State Warehousing Corp (MSWC) Godown 12',
    warehouse_type: 'dry_warehouse',
    warehouse_address: 'Hadapsar Industrial Estate, Near Gadital, Pune 411028',
    nearest_apmc_mandi: 'Pune APMC (Gultekdi Market Yard)',
    mandi_id: 'a1b2c3d4-e5f6-7890-abcd-111111111111',
    farmer_name: 'Dnyaneshwar Shinde',
    farmer_phone: '9822114455',
    crop_name: 'Soyabean',
    quantity_quintals: 60,
    rate_per_quintal_month: 32,
    estimated_monthly_charge: 1920,
    storage_duration_months: 1,
    temperature_range: 'Ambient (18°C - 32°C)',
    humidity_range: '< 65% RH',
    manager_name: 'Anil Kulkarni',
    manager_phone: '+919822340099',
    manager_email: 'mswc.hadapsar@maawarehouse.com',
    license_no: 'WDRA-MH-PUN-2022-004',
    status: 'done',
    booked_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b1111111-2222-3333-4444-555555555003',
    ticket_number: 'WH-NSK-20261104-2001',
    warehouse_id: 'cs-nsk-01',
    warehouse_name: 'Nashik Agro Pre-Cooling & Cold Logistics',
    warehouse_type: 'cold_storage',
    warehouse_address: 'Panchavati APMC Agro Zone, Dindori Road, Nashik 422003',
    nearest_apmc_mandi: 'Nashik APMC (Panchavati Grain & Veg Yard)',
    mandi_id: 'a1b2c3d4-e5f6-7890-abcd-444444444444',
    farmer_name: 'Balu Eknath Wagh',
    farmer_phone: '9822336699',
    crop_name: 'Grapes',
    quantity_quintals: 35,
    rate_per_quintal_month: 120,
    estimated_monthly_charge: 4200,
    storage_duration_months: 1,
    temperature_range: '-0.5°C to 2°C',
    humidity_range: '92% - 96% RH',
    manager_name: 'Sachin Gaikwad',
    manager_phone: '+919823112233',
    manager_email: 'nashik.agrofreezer@agristorage.in',
    license_no: 'NHB-MH-NSK-2023-092',
    status: 'done',
    booked_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// In-memory store for server-side / test runtime
let memoryBookings: WarehouseBooking[] = [...INITIAL_SEED_WAREHOUSE_BOOKINGS];

/**
 * Resets memory store (primarily for unit test isolation)
 */
export function resetMemoryWarehouseBookings(): void {
  memoryBookings = [...INITIAL_SEED_WAREHOUSE_BOOKINGS];
}

/**
 * Helper to get local cache safely in browser
 */
function getLocalBookings(): WarehouseBooking[] {
  if (typeof window === 'undefined') {
    return memoryBookings;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WH_BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_WH_BOOKINGS, JSON.stringify(INITIAL_SEED_WAREHOUSE_BOOKINGS));
      return INITIAL_SEED_WAREHOUSE_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_WAREHOUSE_BOOKINGS;
  } catch {
    return memoryBookings;
  }
}

function setLocalBookings(list: WarehouseBooking[]): void {
  memoryBookings = list;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_WH_BOOKINGS, JSON.stringify(list));
      window.dispatchEvent(new Event('km_storage_sync'));
    } catch {
      // storage quota or private browsing
    }
  }
}

/**
 * Derive the warehouse-to-mandi relationship strictly from the
 * `nearest-APMC` field in the warehouse data.
 */
export function doesWarehouseMatchMandi(
  facility: StorageFacility | { nearApmcMandi: string; id?: string; name?: string },
  mandi: Mandi | { id: string; name?: string; code?: string; district?: string }
): boolean {
  if (!facility || !mandi) return false;

  const whMandi = (facility.nearApmcMandi || '').toLowerCase().trim();
  const mandiName = (mandi.name || '').toLowerCase().trim();
  const mandiCode = (mandi.code || '').toLowerCase().trim();
  const mandiDistrict = (mandi.district || '').toLowerCase().trim();
  const mandiId = mandi.id || '';

  // Direct string equality / containment
  if (whMandi === mandiName) return true;
  if (whMandi.length > 5 && (whMandi.includes(mandiName) || (mandiName.length > 5 && mandiName.includes(whMandi)))) {
    return true;
  }

  // Pune APMC / Gultekdi Market Yard
  if (whMandi.includes('pune') || whMandi.includes('gultekdi')) {
    return (
      mandiId === 'a1b2c3d4-e5f6-7890-abcd-111111111111' ||
      mandiCode === 'apmc-pun-01' ||
      (mandiDistrict === 'pune' && mandiName.includes('pune') && !mandiName.includes('baramati'))
    );
  }

  // Nashik APMC / Panchavati
  if (whMandi.includes('nashik') || whMandi.includes('panchavati')) {
    return (
      mandiId === 'a1b2c3d4-e5f6-7890-abcd-444444444444' ||
      mandiCode === 'apmc-nsk-04' ||
      (mandiDistrict === 'nashik' && mandiName.includes('nashik') && !mandiName.includes('lasalgaon'))
    );
  }

  // Lasalgaon APMC
  if (whMandi.includes('lasalgaon')) {
    return (
      mandiId === 'a1b2c3d4-e5f6-7890-abcd-555555555555' ||
      mandiCode === 'apmc-lsg-05' ||
      mandiName.includes('lasalgaon')
    );
  }

  // Baramati APMC Yard
  if (whMandi.includes('baramati')) {
    return (
      mandiId === 'a1b2c3d4-e5f6-7890-abcd-222222222222' ||
      mandiCode === 'apmc-brm-02' ||
      mandiName.includes('baramati')
    );
  }

  // Ahmednagar APMC
  if (whMandi.includes('ahmednagar')) {
    return (
      mandiId === 'a1b2c3d4-e5f6-7890-abcd-333333333333' ||
      mandiCode === 'apmc-ahm-03' ||
      mandiName.includes('ahmednagar')
    );
  }

  // Solapur APMC
  if (whMandi.includes('solapur')) {
    return (
      mandiId === 'a1b2c3d4-e5f6-7890-abcd-666666666666' ||
      mandiCode === 'apmc-sol-06' ||
      mandiName.includes('solapur')
    );
  }

  // Kolhapur APMC
  if (whMandi.includes('kolhapur')) {
    return (
      mandiId === 'a1b2c3d4-e5f6-7890-abcd-777777777777' ||
      mandiCode === 'apmc-kol-07' ||
      mandiName.includes('kolhapur')
    );
  }

  // Nagpur APMC
  if (whMandi.includes('nagpur')) {
    return (
      mandiId === 'a1b2c3d4-e5f6-7890-abcd-888888888888' ||
      mandiCode === 'apmc-ngp-08' ||
      mandiName.includes('nagpur')
    );
  }

  return false;
}

/**
 * Validates storage reservation input parameters.
 */
export function validateWarehouseBookingInput(input: CreateWarehouseBookingInput): { valid: boolean; error?: string } {
  if (!input.farmer_name || input.farmer_name.trim().length < 2) {
    return { valid: false, error: 'Farmer full name must be at least 2 characters.' };
  }

  const cleanPhone = (input.farmer_phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return { valid: false, error: 'Please enter a valid 10-digit mobile number.' };
  }

  if (!input.crop_name || input.crop_name.trim().length < 2) {
    return { valid: false, error: 'Please specify the crop to be stored.' };
  }

  const qty = Number(input.quantity_quintals);
  if (isNaN(qty) || qty <= 0) {
    return { valid: false, error: 'Storage quantity must be a positive number greater than 0 quintals.' };
  }

  if (qty > 10000) {
    return { valid: false, error: 'Requested allocation exceeds single batch limits (max 10,000 quintals).' };
  }

  const facility = VERIFIED_STORAGE_FACILITIES.find((f) => f.id === input.warehouse_id);
  if (!facility) {
    return { valid: false, error: 'Selected warehouse or cold storage facility was not found.' };
  }

  return { valid: true };
}

/**
 * Resolves the matching Mandi for a given warehouse facility.
 */
export function findMatchingMandiForFacility(facility: StorageFacility): Mandi | null {
  for (const mandi of DEFAULT_MANDIS) {
    if (doesWarehouseMatchMandi(facility, mandi)) {
      return mandi;
    }
  }
  return null;
}

/**
 * Creates and records a warehouse slot booking reservation.
 */
export async function createWarehouseBooking(
  input: CreateWarehouseBookingInput
): Promise<{ success: boolean; booking?: WarehouseBooking; error?: string }> {
  const validation = validateWarehouseBookingInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const facility = VERIFIED_STORAGE_FACILITIES.find((f) => f.id === input.warehouse_id)!;
  const matchingMandi = findMatchingMandiForFacility(facility);
  const qty = Number(input.quantity_quintals);
  const duration = input.storage_duration_months || 1;
  const monthlyCharge = Math.round(qty * facility.ratePerQuintalMonth * duration);

  const cleanPhone = input.farmer_phone.replace(/\D/g, '').slice(-10);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `WH-${facility.code}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomSuffix}`;

  const newBooking: WarehouseBooking = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `wh-bk-${Date.now()}-${randomSuffix}`,
    ticket_number: ticketNumber,
    warehouse_id: facility.id,
    warehouse_name: facility.name,
    warehouse_type: facility.type,
    warehouse_address: facility.address,
    nearest_apmc_mandi: facility.nearApmcMandi,
    mandi_id: matchingMandi?.id,
    farmer_id: input.farmer_id,
    farmer_name: input.farmer_name.trim(),
    farmer_phone: cleanPhone,
    crop_name: input.crop_name.trim(),
    quantity_quintals: qty,
    rate_per_quintal_month: facility.ratePerQuintalMonth,
    estimated_monthly_charge: monthlyCharge,
    storage_duration_months: duration,
    temperature_range: facility.temperatureRange,
    humidity_range: facility.humidityRange,
    manager_name: facility.contactPerson,
    manager_phone: facility.contactPhone,
    manager_email: facility.contactEmail,
    license_no: facility.licenseNo,
    status: 'done', // Status explicitly set to done on confirmation
    booked_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  // 1. Try persisting to Supabase database if connected
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      await supabase.from('warehouse_bookings').insert({
        id: newBooking.id,
        ticket_number: newBooking.ticket_number,
        warehouse_id: newBooking.warehouse_id,
        warehouse_name: newBooking.warehouse_name,
        warehouse_type: newBooking.warehouse_type,
        warehouse_address: newBooking.warehouse_address,
        nearest_apmc_mandi: newBooking.nearest_apmc_mandi,
        mandi_id: newBooking.mandi_id,
        farmer_name: newBooking.farmer_name,
        farmer_phone: newBooking.farmer_phone,
        crop_name: newBooking.crop_name,
        quantity_quintals: newBooking.quantity_quintals,
        rate_per_quintal_month: newBooking.rate_per_quintal_month,
        estimated_monthly_charge: newBooking.estimated_monthly_charge,
        storage_duration_months: newBooking.storage_duration_months,
        temperature_range: newBooking.temperature_range,
        humidity_range: newBooking.humidity_range,
        manager_name: newBooking.manager_name,
        manager_phone: newBooking.manager_phone,
        manager_email: newBooking.manager_email,
        license_no: newBooking.license_no,
        status: newBooking.status,
        booked_at: newBooking.booked_at,
      });
    } catch {
      // fallback to memory/localStorage below
    }
  }

  // 2. Persist to local & memory store
  const current = getLocalBookings();
  const updated = [newBooking, ...current];
  setLocalBookings(updated);

  // 3. Save as latest booking for current farmer session
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_LATEST_FARMER_WH_BOOKING, JSON.stringify(newBooking));
    } catch {}
  }

  return { success: true, booking: newBooking };
}

/**
 * Returns all warehouse bookings stored in the application.
 */
export async function getAllWarehouseBookings(): Promise<WarehouseBooking[]> {
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('warehouse_bookings')
        .select('*')
        .order('booked_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as WarehouseBooking[];
      }
    } catch {
      // fallback
    }
  }

  return getLocalBookings();
}

/**
 * Returns the latest booking made by the farmer in their browser session.
 */
export function getLatestFarmerWarehouseBooking(): WarehouseBooking | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LATEST_FARMER_WH_BOOKING);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears or updates the stored farmer warehouse booking token.
 */
export function clearStoredFarmerWarehouseBooking(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_LATEST_FARMER_WH_BOOKING);
    } catch {}
  }
}

/**
 * SERVER & CLIENT ENFORCED FILTERING:
 * Each Mandi user sees ONLY warehouses whose nearest APMC market matches that user's own mandi.
 * Example: a warehouse nearest to Pune APMC (Gultekdi Market Yard) appears only when a Pune Mandi
 * user is logged in, never for users of other mandis.
 */
export function filterWarehouseBookingsForMandi(
  bookings: WarehouseBooking[],
  mandi: Mandi | { id: string; name?: string; code?: string; district?: string }
): WarehouseBooking[] {
  if (!mandi || !mandi.id) return [];

  return bookings.filter((booking) => {
    // 1. Direct mandi ID match if present
    if (booking.mandi_id && booking.mandi_id === mandi.id) {
      return true;
    }

    // 2. Derive match from nearest_apmc_mandi field in the warehouse data
    return doesWarehouseMatchMandi({ nearApmcMandi: booking.nearest_apmc_mandi }, mandi);
  });
}

/**
 * Retrieves facilities whose nearest APMC matches the specified Mandi.
 */
export function getFacilitiesForMandi(
  mandi: Mandi | { id: string; name?: string; code?: string; district?: string }
): StorageFacility[] {
  if (!mandi || !mandi.id) return [];
  return VERIFIED_STORAGE_FACILITIES.filter((facility) => doesWarehouseMatchMandi(facility, mandi));
}

