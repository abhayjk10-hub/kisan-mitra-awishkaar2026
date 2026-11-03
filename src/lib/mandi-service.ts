import { createClient, hasValidSupabaseConfig } from './supabase/client';
import { toLocalISODate, getISTCurrentTime } from './date-utils';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Mandi, SlotBooking, FarmerDelay, SlotStatus, MandiRegistrationInput, MandiSession } from '@/types';
export type { Mandi };

// Default seed mandis (Maharashtra APMC Market Yards with real coordinates)
export const DEFAULT_MANDIS: Mandi[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-111111111111',
    name: 'Pune APMC Market Yard',
    code: 'APMC-PUN-01',
    license_no: 'DEMO-LIC-MH-PUN-001',
    district: 'Pune',
    state: 'Maharashtra',
    address: 'Gultekdi Market Yard, Pune, Maharashtra 411037',
    latitude: 18.4907,
    longitude: 73.8683,
    contact_person: 'Suresh Patil (Secretary)',
    contact_phone: '+919822012345',
    contact_email: 'pune.apmc@demo-apmc.kisanmitra.org',
    slot_capacity: 6,
    opening_time: '06:00',
    closing_time: '18:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-222222222222',
    name: 'Baramati APMC Yard',
    code: 'APMC-BRM-02',
    license_no: 'DEMO-LIC-MH-BRM-089',
    district: 'Pune',
    state: 'Maharashtra',
    address: 'MIDC Road, Baramati, District Pune 413133',
    latitude: 18.1517,
    longitude: 74.5772,
    contact_person: 'Rajendra Deshmukh',
    contact_phone: '+919822054321',
    contact_email: 'baramati.apmc@demo-apmc.kisanmitra.org',
    slot_capacity: 5,
    opening_time: '06:30',
    closing_time: '17:30',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-333333333333',
    name: 'Ahmednagar APMC Main Yard',
    code: 'APMC-AHM-03',
    license_no: 'DEMO-LIC-MH-AHM-042',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    address: 'Station Road, Near Railway Goods Shed, Ahmednagar 414001',
    latitude: 19.0948,
    longitude: 74.7480,
    contact_person: 'Vikas Gaikwad',
    contact_phone: '+919823198765',
    contact_email: 'ahmednagar.apmc@demo-apmc.kisanmitra.org',
    slot_capacity: 8,
    opening_time: '06:00',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-444444444444',
    name: 'Nashik APMC Onion & Grain Yard',
    code: 'APMC-NSK-04',
    license_no: 'DEMO-LIC-MH-NSK-118',
    district: 'Nashik',
    state: 'Maharashtra',
    address: 'Peth Road, Panchavati, Nashik 422003',
    latitude: 20.0125,
    longitude: 73.7915,
    contact_person: 'Bhausaheb Jadhav',
    contact_phone: '+919822456789',
    contact_email: 'nashik.apmc@demo-apmc.kisanmitra.org',
    slot_capacity: 10,
    opening_time: '05:30',
    closing_time: '19:30',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-555555555555',
    name: 'Lasalgaon APMC (Asia Largest Onion Yard)',
    code: 'APMC-LSG-05',
    license_no: 'DEMO-LIC-MH-LSG-007',
    district: 'Nashik',
    state: 'Maharashtra',
    address: 'Niphad Taluka, Lasalgaon 422306',
    latitude: 20.1458,
    longitude: 74.2287,
    contact_person: 'Dattatray Shinde',
    contact_phone: '+919822998877',
    contact_email: 'lasalgaon.apmc@demo-apmc.kisanmitra.org',
    slot_capacity: 12,
    opening_time: '06:00',
    closing_time: '18:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-666666666666',
    name: 'Solapur Cotton & Pulse Yard',
    code: 'APMC-SOL-06',
    license_no: 'DEMO-LIC-MH-SOL-054',
    district: 'Solapur',
    state: 'Maharashtra',
    address: 'Saat Rasta, Siddheshwar Peth, Solapur 413001',
    latitude: 17.6599,
    longitude: 75.9064,
    contact_person: 'Anil Kulkarni',
    contact_phone: '+919823334455',
    contact_email: 'solapur.apmc@demo-apmc.kisanmitra.org',
    slot_capacity: 6,
    opening_time: '07:00',
    closing_time: '18:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-777777777777',
    name: 'Kolhapur Jaggery & Spice APMC',
    code: 'APMC-KOL-07',
    license_no: 'DEMO-LIC-MH-KOL-019',
    district: 'Kolhapur',
    state: 'Maharashtra',
    address: 'Shahupuri, Near Old Palace, Kolhapur 416001',
    latitude: 16.7050,
    longitude: 74.2433,
    contact_person: 'Mahadev Bhosale',
    contact_phone: '+919823901234',
    contact_email: 'kolhapur.apmc@demo-apmc.kisanmitra.org',
    slot_capacity: 5,
    opening_time: '06:30',
    closing_time: '17:30',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-888888888888',
    name: 'Nagpur Orange & Grain Yard',
    code: 'APMC-NGP-08',
    license_no: 'DEMO-LIC-MH-NGP-093',
    district: 'Nagpur',
    state: 'Maharashtra',
    address: 'Kalamna Market, Central Avenue, Nagpur 440008',
    latitude: 21.1685,
    longitude: 79.1389,
    contact_person: 'Pravin Wankhede',
    contact_phone: '+919822887766',
    contact_email: 'nagpur.apmc@kisanmitra.org',
    slot_capacity: 8,
    opening_time: '06:00',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-888888888889',
    name: 'Nagpur Orange & Grain Yard (Alternate / Typo Code)',
    code: 'APMC-MGP-08',
    license_no: 'DEMO-LIC-MH-MGP-093',
    district: 'Nagpur',
    state: 'Maharashtra',
    address: 'Kalamna Market, Central Avenue, Nagpur 440008',
    latitude: 21.1685,
    longitude: 79.1389,
    contact_person: 'Pravin Wankhede',
    contact_phone: '+919822887766',
    contact_email: 'nagpur.mgp@kisanmitra.org',
    slot_capacity: 8,
    opening_time: '06:00',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999909',
    name: 'Surat APMC Krushi Bazar',
    code: 'APMC-SUR-09',
    license_no: 'LIC-GJ-SUR-2024-015',
    district: 'Surat',
    state: 'Gujarat',
    address: 'Sardar Market, Sahara Darwaja, Ring Road, Surat 395002',
    latitude: 21.1895,
    longitude: 72.8530,
    contact_person: 'Kishorbhai Patel',
    contact_phone: '+919825123456',
    contact_email: 'surat.apmc@kisanmitra.org',
    slot_capacity: 12,
    opening_time: '05:00',
    closing_time: '18:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999910',
    name: 'Rajkot APMC Bedi Yard',
    code: 'APMC-RJK-10',
    license_no: 'LIC-GJ-RJK-2024-022',
    district: 'Rajkot',
    state: 'Gujarat',
    address: 'Bedi Marketing Yard, Rajkot-Morbi Highway, Rajkot 360003',
    latitude: 22.3551,
    longitude: 70.8038,
    contact_person: 'Jayeshbhai Radadiya',
    contact_phone: '+919825234567',
    contact_email: 'rajkot.apmc@kisanmitra.org',
    slot_capacity: 10,
    opening_time: '06:00',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999911',
    name: 'Ahmedabad APMC Market Yard',
    code: 'APMC-ADI-11',
    license_no: 'LIC-GJ-ADI-2024-001',
    district: 'Ahmedabad',
    state: 'Gujarat',
    address: 'Vasna APMC Market, Sarkhej Road, Ahmedabad 380007',
    latitude: 23.0033,
    longitude: 72.5447,
    contact_person: 'Hiteshbhai Patel',
    contact_phone: '+919825345678',
    contact_email: 'ahmedabad.apmc@kisanmitra.org',
    slot_capacity: 10,
    opening_time: '05:30',
    closing_time: '18:30',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999912',
    name: 'Gondal APMC Market Yard',
    code: 'APMC-GDL-12',
    license_no: 'LIC-GJ-GDL-2024-034',
    district: 'Rajkot',
    state: 'Gujarat',
    address: 'Marketing Yard Road, National Highway 27, Gondal 360311',
    latitude: 21.9619,
    longitude: 70.7937,
    contact_person: 'Aljibhai Donga',
    contact_phone: '+919825456789',
    contact_email: 'gondal.apmc@kisanmitra.org',
    slot_capacity: 12,
    opening_time: '06:00',
    closing_time: '18:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999913',
    name: 'Ludhiana Dana Mandi (Grain Market)',
    code: 'APMC-LDH-13',
    license_no: 'LIC-PB-LDH-2024-051',
    district: 'Ludhiana',
    state: 'Punjab',
    address: 'Dana Mandi, Gill Road, Ludhiana 141003',
    latitude: 30.8797,
    longitude: 75.8617,
    contact_person: 'Gurpreet Singh Sandhu',
    contact_phone: '+919814123456',
    contact_email: 'ludhiana.apmc@kisanmitra.org',
    slot_capacity: 10,
    opening_time: '06:00',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999914',
    name: 'Khanna APMC (Asia Largest Grain Market)',
    code: 'APMC-KHN-14',
    license_no: 'LIC-PB-KHN-2024-002',
    district: 'Ludhiana',
    state: 'Punjab',
    address: 'GT Road, Khanna, District Ludhiana 141401',
    latitude: 30.7046,
    longitude: 76.2217,
    contact_person: 'Harinder Singh Gill',
    contact_phone: '+919814234567',
    contact_email: 'khanna.apmc@kisanmitra.org',
    slot_capacity: 16,
    opening_time: '05:00',
    closing_time: '20:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999915',
    name: 'Amritsar APMC Bhagtanwala Grain Market',
    code: 'APMC-ASR-15',
    license_no: 'LIC-PB-ASR-2024-018',
    district: 'Amritsar',
    state: 'Punjab',
    address: 'Bhagtanwala Dana Mandi, Amritsar 143001',
    latitude: 31.6111,
    longitude: 74.8722,
    contact_person: 'Manjit Singh Randhawa',
    contact_phone: '+919814345678',
    contact_email: 'amritsar.apmc@kisanmitra.org',
    slot_capacity: 8,
    opening_time: '06:00',
    closing_time: '18:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999916',
    name: 'Indore APMC Choithram Mandi',
    code: 'APMC-IND-16',
    license_no: 'LIC-MP-IND-2024-011',
    district: 'Indore',
    state: 'Madhya Pradesh',
    address: 'Choithram Mandi, Manik Bagh Road, Indore 452014',
    latitude: 22.6841,
    longitude: 75.8450,
    contact_person: 'Rajesh Sharma',
    contact_phone: '+919826123456',
    contact_email: 'indore.apmc@kisanmitra.org',
    slot_capacity: 14,
    opening_time: '05:30',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999917',
    name: 'Ujjain APMC Krishi Upaj Mandi',
    code: 'APMC-UJN-17',
    license_no: 'LIC-MP-UJN-2024-029',
    district: 'Ujjain',
    state: 'Madhya Pradesh',
    address: 'Maksi Road Krishi Upaj Mandi, Ujjain 456010',
    latitude: 23.1828,
    longitude: 75.8080,
    contact_person: 'Mukesh Patidar',
    contact_phone: '+919826234567',
    contact_email: 'ujjain.apmc@kisanmitra.org',
    slot_capacity: 8,
    opening_time: '06:00',
    closing_time: '18:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999918',
    name: 'Yeshwanthpur APMC Yard (Bengaluru)',
    code: 'APMC-BLR-18',
    license_no: 'LIC-KA-BLR-2024-001',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    address: 'Tumkur Road, Yeshwanthpur, Bengaluru 560022',
    latitude: 13.0238,
    longitude: 77.5505,
    contact_person: 'K. R. Shivakumar',
    contact_phone: '+919845123456',
    contact_email: 'bengaluru.apmc@kisanmitra.org',
    slot_capacity: 12,
    opening_time: '05:00',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999919',
    name: 'Hubballi APMC Amargol Market Yard',
    code: 'APMC-HBL-19',
    license_no: 'LIC-KA-HBL-2024-045',
    district: 'Dharwad',
    state: 'Karnataka',
    address: 'Amargol APMC Yard, Hubli-Dharwad Highway, Hubballi 580025',
    latitude: 15.3942,
    longitude: 75.1051,
    contact_person: 'Basavaraj Horatti',
    contact_phone: '+919845234567',
    contact_email: 'hubli.apmc@kisanmitra.org',
    slot_capacity: 10,
    opening_time: '06:00',
    closing_time: '18:30',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999920',
    name: 'Kota APMC Bhamashah Mandi',
    code: 'APMC-KTA-20',
    license_no: 'LIC-RJ-KTA-2024-003',
    district: 'Kota',
    state: 'Rajasthan',
    address: 'Bhamashah Mandi, Anantpura, Jhalawar Road, Kota 324005',
    latitude: 25.1388,
    longitude: 75.8498,
    contact_person: 'Rakesh Meena',
    contact_phone: '+919829123456',
    contact_email: 'kota.apmc@kisanmitra.org',
    slot_capacity: 12,
    opening_time: '06:00',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-999999999921',
    name: 'Jaipur APMC Muhana Terminal Market',
    code: 'APMC-JPR-21',
    license_no: 'LIC-RJ-JPR-2024-008',
    district: 'Jaipur',
    state: 'Rajasthan',
    address: 'Muhana Mandi, Sanganer, Jaipur 302029',
    latitude: 26.8042,
    longitude: 75.7656,
    contact_person: 'Gopal Lal Sharma',
    contact_phone: '+919829234567',
    contact_email: 'jaipur.apmc@kisanmitra.org',
    slot_capacity: 14,
    opening_time: '05:00',
    closing_time: '19:00',
    is_active: true,
    is_verified: true,
  },
];

// Haversine formula to compute great-circle distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Local cache keys
const STORAGE_BOOKINGS = 'km_slot_bookings';
const STORAGE_MANDIS = 'km_registered_mandis';
const STORAGE_DELAYS = 'km_farmer_delays';
const STORAGE_MANDI_SESSION = 'km_mandi_session';

// Cross-tab broadcast channel for instantaneous zero-latency sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('km_mandi_sync');
  } catch {
    // BroadcastChannel unsupported or restricted
  }
}

function notifyBroadcast(type: string, payload: unknown) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('km_sync_event', { detail: { type, payload } }));
  }
}

// Helper: read local cache
function getLocalCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Helper: write local cache
function setLocalCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * MANDI DISCOVERY & RETRIEVAL
 * ───────────────────────────────────────────────────────────────────────── */
export async function getMandis(
  userLat?: number,
  userLng?: number,
  includeUnverified: boolean = false
): Promise<Mandi[]> {
  let list: Mandi[] = [];

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      let query = supabase.from('mandis').select('*').eq('is_active', true);
      if (!includeUnverified) {
        query = query.eq('is_verified', true);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        list = data as Mandi[];
      }
    } catch {
      // Fallback to local
    }
  }

  // Merge with locally registered custom mandis
  const localMandis = getLocalCache<Mandi[]>(STORAGE_MANDIS, []);
  if (list.length === 0) {
    list = [...DEFAULT_MANDIS];
  }

  // Append any local custom ones not in list
  for (const lm of localMandis) {
    if (includeUnverified || lm.is_verified) {
      if (!list.some((m) => m.id === lm.id || m.code === lm.code)) {
        list.push(lm);
      }
    }
  }

  // If user coordinates provided, compute distance and sort
  if (userLat !== undefined && userLng !== undefined) {
    list = list.map((m) => ({
      ...m,
      distance_km: calculateDistanceKm(userLat, userLng, m.latitude, m.longitude),
    }));
    list.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
  }

  return list;
}

export async function getMandiById(mandiId: string): Promise<Mandi | null> {
  const mandis = await getMandis(undefined, undefined, true);
  return mandis.find((m) => m.id === mandiId || m.code === mandiId) || null;
}

/* ─────────────────────────────────────────────────────────────────────────
 * MANDI REGISTRATION & AUTH
 * ───────────────────────────────────────────────────────────────────────── */
export async function registerMandi(input: MandiRegistrationInput): Promise<{ mandi?: Mandi; error?: string }> {
  const cleanCode = input.code.trim().toUpperCase();

  // 1. Validate geographical coordinates range (M2)
  if (
    typeof input.latitude !== 'number' ||
    typeof input.longitude !== 'number' ||
    isNaN(input.latitude) ||
    isNaN(input.longitude) ||
    input.latitude < -90 ||
    input.latitude > 90 ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    return {
      error: 'Invalid geographical coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.',
    };
  }

  // 2. Check for duplicate mandi code (M2)
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data: existingRemote } = await supabase
        .from('mandis')
        .select('id, code')
        .ilike('code', cleanCode)
        .maybeSingle();

      if (existingRemote) {
        return {
          error: `Mandi registration failed: Code "${cleanCode}" is already in use by another market yard.`,
        };
      }
    } catch {
      // If Supabase check fails due to network, check local cache below
    }
  }

  const localMandis = getLocalCache<Mandi[]>(STORAGE_MANDIS, []);
  if (
    localMandis.some((m) => m.code.toUpperCase() === cleanCode) ||
    DEFAULT_MANDIS.some((m) => m.code.toUpperCase() === cleanCode)
  ) {
    return {
      error: `Mandi registration failed: Code "${cleanCode}" is already registered.`,
    };
  }

  const newId = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  const newMandi: Mandi = {
    id: newId,
    name: input.name.trim(),
    code: cleanCode,
    license_no: input.license_no?.trim(),
    district: input.district.trim(),
    state: input.state.trim() || 'Maharashtra',
    address: input.address.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    contact_person: input.contact_person.trim(),
    contact_phone: input.contact_phone.trim(),
    contact_email: input.contact_email.trim(),
    slot_capacity: input.slot_capacity || 6,
    opening_time: input.opening_time || '06:00',
    closing_time: input.closing_time || '18:00',
    is_active: true,
    is_verified: false, // Default to unverified until admin verification (M2)
    created_at: nowIso,
    updated_at: nowIso,
  };

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('mandis').insert(newMandi);
      if (error) {
        console.error('[MandiService] registerMandi Supabase error:', error);
        return { error: `Database error while registering mandi: ${error.message}` };
      }
    } catch (err: unknown) {
      console.error('[MandiService] registerMandi exception:', err);
      return { error: err instanceof Error ? err.message : 'Database communication error while registering mandi.' };
    }
  }

  // Save to local cache
  localMandis.push(newMandi);
  setLocalCache(STORAGE_MANDIS, localMandis);

  // Auto sign in to session
  const session: MandiSession = {
    mandi: newMandi,
    loggedInAt: nowIso,
  };
  setLocalCache(STORAGE_MANDI_SESSION, session);
  notifyBroadcast('MANDI_REGISTERED', newMandi);

  return { mandi: newMandi };
}

export const COMMON_MANDI_PASSWORD = 'KisanMitra@Apmc2026!';

export async function loginMandi(
  identifier: string,
  password?: string
): Promise<{ session: MandiSession | null; error?: string }> {
  const clean = identifier.trim();
  if (!clean) {
    return { session: null, error: 'Mandi code or operator email is required.' };
  }
  if (!password) {
    return { session: null, error: 'Password is required.' };
  }

  // 1. Resolve Mandi from code, email, or name across registered yards and Supabase
  let matchedMandi: Mandi | null = null;
  const mandis = await getMandis(undefined, undefined, true);
  matchedMandi =
    mandis.find(
      (m) =>
        m.code.toLowerCase() === clean.toLowerCase() ||
        m.contact_email?.toLowerCase() === clean.toLowerCase() ||
        m.name.toLowerCase() === clean.toLowerCase()
    ) || null;

  if (!matchedMandi && hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      let query = supabase.from('mandis').select('*');
      if (clean.includes('@')) {
        query = query.ilike('contact_email', clean);
      } else {
        query = query.ilike('code', clean);
      }
      const { data } = await query.maybeSingle();
      if (data) {
        matchedMandi = data as Mandi;
      }
    } catch {
      // ignore
    }
  }

  if (!matchedMandi) {
    return {
      session: null,
      error: `No registered mandi found with code "${clean}".`,
    };
  }

  // 2. Validate Credentials
  // Path A: Common access password (or demo123 in demo mode)
  const isCommonPassword =
    password === COMMON_MANDI_PASSWORD ||
    (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && password === 'demo123');

  // Path B: Supabase Auth (Email + Password)
  let isSupabaseAuthed = false;
  let supabaseMandi: Mandi | null = null;

  if (hasValidSupabaseConfig() && matchedMandi.contact_email) {
    try {
      const supabase = createClient();
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: matchedMandi.contact_email.toLowerCase(),
        password: password,
      });

      if (!authErr && authData.user) {
        const { data: staffRec } = await supabase
          .from('mandi_staff')
          .select('mandi_id, mandis (*)')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (staffRec?.mandis) {
          isSupabaseAuthed = true;
          supabaseMandi = staffRec.mandis as unknown as Mandi;
        } else {
          isSupabaseAuthed = true;
        }
      }
    } catch {
      // Supabase network / table unavailable
    }
  }

  if (!isCommonPassword && !isSupabaseAuthed) {
    return {
      session: null,
      error: 'Invalid operator credentials. Please check your password.',
    };
  }

  // 3. Establish Verified Operator Session
  const finalMandi = supabaseMandi || matchedMandi;
  const session: MandiSession = {
    mandi: finalMandi,
    loggedInAt: new Date().toISOString(),
  };

  setLocalCache(STORAGE_MANDI_SESSION, session);
  if (typeof document !== 'undefined') {
    document.cookie = `km_demo_mandi=${finalMandi.id}; path=/; max-age=86400; SameSite=Lax`;
  }
  notifyBroadcast('MANDI_LOGGED_IN', session);
  return { session };
}

export function getCurrentMandiSession(): MandiSession | null {
  return getLocalCache<MandiSession | null>(STORAGE_MANDI_SESSION, null);
}

export async function logoutMandi(): Promise<void> {
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err: unknown) {
      console.error('[MandiService] signOut error:', err);
    }
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_MANDI_SESSION);
      document.cookie = 'km_demo_mandi=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch {}
  }
  notifyBroadcast('MANDI_LOGGED_OUT', null);
}

/* ─────────────────────────────────────────────────────────────────────────
 * TOKEN GENERATION (30-MIN WINDOWS)
 * ───────────────────────────────────────────────────────────────────────── */
export function generateSlotTimes(openingTime = '06:00', closingTime = '18:00'): { start: string; end: string; label: string }[] {
  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  let currentMinutes = (isNaN(openH) ? 6 : openH) * 60 + (isNaN(openM) ? 0 : openM);
  const endMinutes = (isNaN(closeH) ? 18 : closeH) * 60 + (isNaN(closeM) ? 0 : closeM);

  const slots: { start: string; end: string; label: string }[] = [];

  while (currentMinutes + 30 <= endMinutes) {
    const sH = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
    const sM = String(currentMinutes % 60).padStart(2, '0');
    const nextMinutes = currentMinutes + 30;
    const eH = String(Math.floor(nextMinutes / 60)).padStart(2, '0');
    const eM = String(nextMinutes % 60).padStart(2, '0');

    slots.push({
      start: `${sH}:${sM}`,
      end: `${eH}:${eM}`,
      label: `${sH}:${sM} – ${eH}:${eM}`,
    });

    currentMinutes += 30;
  }

  return slots;
}

export function generateTokenNumber(mandiCode: string, date: string, seq: number): string {
  const cleanCode = mandiCode.replace(/[^A-Za-z0-9]/g, '').slice(-3).toUpperCase() || 'MND';
  const cleanDate = date.replace(/-/g, '').slice(4); // MMDD
  const paddedSeq = String(seq).padStart(3, '0');
  return `TK-${cleanCode}-${cleanDate}-${paddedSeq}`;
}

/* ─────────────────────────────────────────────────────────────────────────
 * SLOT BOOKING (FARMER SIDE)
 * ───────────────────────────────────────────────────────────────────────── */
export interface CreateSlotBookingInput {
  mandi_id: string;
  mandi_name: string;
  farmer_id?: string;
  farmer_name: string;
  farmer_phone: string;
  crop_name: string;
  quantity_quintals: number;
  vehicle_number?: string;
  booking_date: string;
  slot_start_time: string;
  slot_end_time?: string;
  is_walkin?: boolean;
}

export async function createSlotBooking(input: CreateSlotBookingInput): Promise<{ booking: SlotBooking; error?: string }> {
  // Compute end time: start + 30 mins
  let endTime = input.slot_end_time;
  if (!endTime) {
    const [h, m] = input.slot_start_time.split(':').map(Number);
    const totalMin = h * 60 + m + 30;
    endTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }

  const isValidUUID = (val?: string): boolean =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

  const validFarmerId = isValidUUID(input.farmer_id) ? input.farmer_id : null;
  const mandiUuid = isValidUUID(input.mandi_id) ? input.mandi_id : null;

  // 1. Primary path: Invoke PostgreSQL atomic book_slot function (H3, H4, H7)
  if (hasValidSupabaseConfig() && mandiUuid) {
    try {
      const supabase = createClient();
      const { data: rpcBooking, error: rpcError } = await supabase.rpc('book_slot', {
        p_mandi_id: mandiUuid,
        p_farmer_id: validFarmerId,
        p_farmer_name: input.farmer_name.trim(),
        p_farmer_phone: input.farmer_phone.trim(),
        p_crop_name: input.crop_name.trim(),
        p_quantity_quintals: Number(input.quantity_quintals) || 10,
        p_vehicle_number: input.vehicle_number?.trim().toUpperCase() || null,
        p_booking_date: input.booking_date,
        p_slot_start_time: input.slot_start_time,
        p_slot_end_time: endTime,
        p_is_walkin: Boolean(input.is_walkin),
      });

      if (rpcError) {
        const isSchemaCacheError =
          rpcError.code === 'PGRST202' ||
          rpcError.message?.toLowerCase().includes('schema cache') ||
          rpcError.message?.toLowerCase().includes('could not find the function');

        if (!isSchemaCacheError) {
          console.error('[MandiService] book_slot RPC rejected booking:', rpcError);
          return { booking: null as unknown as SlotBooking, error: rpcError.message };
        }

        console.warn('[MandiService] book_slot RPC missing or schema cache stale, falling back to direct booking:', rpcError.message);
      } else if (rpcBooking) {
        const bookedRecord = rpcBooking as unknown as SlotBooking;
        // Save to local cache
        const localList = getLocalCache<SlotBooking[]>(STORAGE_BOOKINGS, []);
        const existingIdx = localList.findIndex((b) => b.id === bookedRecord.id);
        if (existingIdx !== -1) {
          localList[existingIdx] = bookedRecord;
        } else {
          localList.push(bookedRecord);
        }
        setLocalCache(STORAGE_BOOKINGS, localList);
        notifyBroadcast('SLOT_BOOKED', bookedRecord);
        return { booking: bookedRecord };
      }
    } catch (rpcExc: unknown) {
      console.warn('[MandiService] book_slot RPC exception (network/offline):', rpcExc);
    }
  }

  // 2. Offline / local fallback check with strict validation
  const existing = await getMandiQueue(input.mandi_id, input.booking_date);
  const cleanPhone = input.farmer_phone.replace(/\D/g, '').slice(-10);

  // Duplicate active booking check for farmer (H7)
  const hasActiveFarmerBooking = existing.some(
    (b) =>
      b.farmer_phone.replace(/\D/g, '').slice(-10) === cleanPhone &&
      (b.status === 'waiting' || b.status === 'active' || b.status === 'waitlisted')
  );
  if (hasActiveFarmerBooking) {
    return {
      booking: null as unknown as SlotBooking,
      error: 'DUPLICATE_FARMER: You already have an active booking at this Mandi for this date.',
    };
  }

  // Duplicate vehicle booking check in same 30-min window (H7)
  if (input.vehicle_number) {
    const cleanVeh = input.vehicle_number.trim().toUpperCase();
    const hasActiveVehicle = existing.some(
      (b) =>
        b.vehicle_number?.toUpperCase() === cleanVeh &&
        b.slot_start_time === input.slot_start_time &&
        (b.status === 'waiting' || b.status === 'active' || b.status === 'waitlisted')
    );
    if (hasActiveVehicle) {
      return {
        booking: null as unknown as SlotBooking,
        error: `DUPLICATE_VEHICLE: Vehicle ${cleanVeh} already has a booking for this time window.`,
      };
    }
  }

  // Capacity check for this specific 30-min window (H3)
  const mandi = await getMandiById(input.mandi_id);
  const capacity = mandi?.slot_capacity || 6;
  const activeInSlot = existing.filter(
    (b) => b.slot_start_time === input.slot_start_time && (b.status === 'waiting' || b.status === 'active')
  );
  if (activeInSlot.length >= capacity) {
    return {
      booking: null as unknown as SlotBooking,
      error: `SLOT_FULL: This 30-minute time slot is fully booked (${activeInSlot.length} of ${capacity} slots filled).`,
    };
  }

  // Generate sequence under mandi code (H4)
  const seq = existing.length + 1;
  const tokenNumber = generateTokenNumber(mandi?.code || 'MND', input.booking_date, seq);

  const newId = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  const newBooking: SlotBooking = {
    id: newId,
    token_number: tokenNumber,
    mandi_id: input.mandi_id,
    mandi_name: input.mandi_name,
    farmer_id: validFarmerId || undefined,
    farmer_name: input.farmer_name.trim(),
    farmer_phone: input.farmer_phone.trim(),
    crop_name: input.crop_name.trim(),
    quantity_quintals: Number(input.quantity_quintals) || 10,
    vehicle_number: input.vehicle_number?.trim().toUpperCase() || undefined,
    booking_date: input.booking_date,
    slot_start_time: input.slot_start_time,
    slot_end_time: endTime,
    status: 'waiting',
    is_walkin: Boolean(input.is_walkin),
    created_at: nowIso,
    updated_at: nowIso,
  };

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('slot_bookings').insert(newBooking).select().single();
      if (error) {
        console.warn('[MandiService] Direct insert failed, using local offline queue:', error.message);
      } else if (data) {
        newBooking.id = data.id;
      }
    } catch {
      // Offline queue
    }
  }

  // Save to local cache
  const localList = getLocalCache<SlotBooking[]>(STORAGE_BOOKINGS, []);
  localList.push(newBooking);
  setLocalCache(STORAGE_BOOKINGS, localList);

  // Broadcast to Mandi dashboard immediately
  notifyBroadcast('SLOT_BOOKED', newBooking);

  return { booking: newBooking };
}

/* ─────────────────────────────────────────────────────────────────────────
 * MANUAL PHYSICAL TOKEN REGISTRATION (WALK-IN GATE ENTRY)
 * ───────────────────────────────────────────────────────────────────────── */
export async function createWalkinToken(
  mandiId: string,
  data: {
    farmer_name: string;
    farmer_phone: string;
    crop_name: string;
    quantity_quintals: number;
    vehicle_number?: string;
  }
): Promise<{ booking: SlotBooking; error?: string }> {
  const mandi = await getMandiById(mandiId);
  if (!mandi) {
    throw new Error('Mandi not found.');
  }
  const mandiName = mandi.name || 'APMC Yard';

  const todayStr = toLocalISODate();
  const [istHour, istMinute] = getISTCurrentTime();
  const currentMinutes = istHour * 60 + istMinute;

  const [openH, openM] = (mandi.opening_time || '06:00').split(':').map(Number);
  const [closeH, closeM] = (mandi.closing_time || '18:00').split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
    throw new Error(
      `Walk-in gate entry is closed. Operating hours are ${mandi.opening_time || '06:00'} to ${mandi.closing_time || '18:00'} IST.`
    );
  }

  // Round up to current or next 30-min window
  let roundedMin = Math.ceil(currentMinutes / 30) * 30;
  if (roundedMin < openMinutes) roundedMin = openMinutes;
  if (roundedMin >= closeMinutes) {
    throw new Error(
      `Walk-in gate entry is closed for today. Operating hours end at ${mandi.closing_time || '18:00'} IST.`
    );
  }

  const sH = String(Math.floor(roundedMin / 60)).padStart(2, '0');
  const sM = String(roundedMin % 60).padStart(2, '0');
  const startTime = `${sH}:${sM}`;

  return createSlotBooking({
    mandi_id: mandiId,
    mandi_name: mandiName,
    farmer_name: data.farmer_name,
    farmer_phone: data.farmer_phone,
    crop_name: data.crop_name,
    quantity_quintals: data.quantity_quintals,
    vehicle_number: data.vehicle_number,
    booking_date: todayStr,
    slot_start_time: startTime,
    is_walkin: true,
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * MANDI QUEUE & STATUS MANAGEMENT
 * ───────────────────────────────────────────────────────────────────────── */
export async function getMandiQueue(mandiId: string, date?: string): Promise<SlotBooking[]> {
  const targetDate = date || toLocalISODate();
  let list: SlotBooking[] = [];

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      let query = supabase
        .from('slot_bookings')
        .select('*')
        .eq('mandi_id', mandiId);

      if (targetDate) {
        query = query.eq('booking_date', targetDate);
      }

      const { data, error } = await query.order('slot_start_time', { ascending: true });
      if (!error && data) {
        list = data as SlotBooking[];
      }
    } catch {
      // fallback
    }
  }

  // Merge with local cache
  const localList = getLocalCache<SlotBooking[]>(STORAGE_BOOKINGS, []);
  const matchingLocal = localList.filter((b) => b.mandi_id === mandiId && (!targetDate || b.booking_date === targetDate));

  for (const item of matchingLocal) {
    const idx = list.findIndex((b) => b.id === item.id || b.token_number === item.token_number);
    if (idx === -1) {
      list.push(item);
    } else {
      // Prioritize freshest status
      if (item.status !== list[idx].status) {
        list[idx] = item;
      }
    }
  }

  // Sort by start time, then created_at
  list.sort((a, b) => a.slot_start_time.localeCompare(b.slot_start_time) || a.created_at.localeCompare(b.created_at));

  return list;
}

export async function updateTokenStatus(
  bookingId: string,
  newStatus: SlotStatus,
  options?: {
    delay_minutes?: number;
    reason?: string;
    reported_by?: string;
    penalty_points?: number;
  }
): Promise<{ success: boolean; booking?: SlotBooking; error?: string }> {
  const nowIso = new Date().toISOString();
  const updateFields: Partial<SlotBooking> = {
    status: newStatus,
    updated_at: nowIso,
  };

  if (newStatus === 'active') {
    updateFields.arrival_time = nowIso;
  } else if (newStatus === 'completed') {
    updateFields.completion_time = nowIso;
  } else if (newStatus === 'no-show') {
    updateFields.delay_minutes = options?.delay_minutes ?? 30;
  }

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('slot_bookings').update(updateFields).eq('id', bookingId);
      if (error) {
        console.error('[MandiService] updateTokenStatus Supabase error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: unknown) {
      console.warn('[MandiService] updateTokenStatus Supabase exception (offline mode):', err);
    }
  }

  // Update in local cache
  const localList = getLocalCache<SlotBooking[]>(STORAGE_BOOKINGS, []);
  const index = localList.findIndex((b) => b.id === bookingId);
  let updatedBooking: SlotBooking | undefined;

  if (index !== -1) {
    localList[index] = {
      ...localList[index],
      ...updateFields,
    };
    updatedBooking = localList[index];
    setLocalCache(STORAGE_BOOKINGS, localList);
  }

  // If status is 'no-show' or delay logged, write to cross-mandi farmer_delays table
  if (newStatus === 'no-show' || (options?.delay_minutes && options.delay_minutes > 0)) {
    const booking = updatedBooking || localList.find((b) => b.id === bookingId);
    if (booking) {
      await logFarmerDelay({
        booking_id: booking.id,
        farmer_phone: booking.farmer_phone,
        farmer_name: booking.farmer_name,
        mandi_id: booking.mandi_id,
        mandi_name: booking.mandi_name,
        delay_type: newStatus === 'no-show' ? 'no_show' : 'late_arrival',
        delay_minutes: options?.delay_minutes ?? 30,
        penalty_points: options?.penalty_points ?? (newStatus === 'no-show' ? 2 : 1),
        reason:
          options?.reason ||
          (newStatus === 'no-show'
            ? 'Farmer did not arrive for allocated 30-min window'
            : 'Delayed arrival at market yard gate'),
        reported_by: options?.reported_by || 'APMC Gate Officer',
      });
    }
  }

  // If status is 'no-show' or 'cancelled', vacate slot and promote next waitlisted farmer in offline mode (Postgres trigger handles it online)
  let promotedBooking: SlotBooking | null = null;
  if (!hasValidSupabaseConfig() && (newStatus === 'no-show' || newStatus === 'cancelled') && (updatedBooking || localList.find((b) => b.id === bookingId))) {
    const target = updatedBooking || localList.find((b) => b.id === bookingId);
    if (target) {
      promotedBooking = await promoteNextWaitlistedFarmer(target.mandi_id, target.booking_date, target.slot_start_time);
    }
  }

  // Broadcast token update
  notifyBroadcast('TOKEN_STATUS_UPDATED', { bookingId, status: newStatus, booking: updatedBooking, promotedBooking });

  return { success: true, booking: updatedBooking };
}

/**
 * Computes real-time queue position for a farmer booking (H9).
 */
export async function getMandiQueuePosition(
  mandiId: string,
  bookingId: string,
  bookingDate: string
): Promise<{
  totalAhead: number;
  currentToken: number;
  estimatedWaitMinutes: number;
  status: SlotStatus;
}> {
  const queue = await getMandiQueue(mandiId, bookingDate);
  const targetBooking = queue.find((b) => b.id === bookingId);

  if (!targetBooking) {
    return {
      totalAhead: 0,
      currentToken: 1,
      estimatedWaitMinutes: 0,
      status: 'waiting',
    };
  }

  // Active bookings in queue sorted by slot start time and created_at
  const activeQueue = queue.filter((b) => b.status === 'active' || b.status === 'waiting');
  const targetIndex = activeQueue.findIndex((b) => b.id === bookingId);

  // If farmer is currently active, 0 ahead, 0 wait
  if (targetBooking.status === 'active') {
    return {
      totalAhead: 0,
      currentToken: 1,
      estimatedWaitMinutes: 0,
      status: 'active',
    };
  }

  const totalAhead = targetIndex >= 0 ? targetIndex : 0;
  // Estimated wait: ~15 mins per farmer ahead
  const estimatedWaitMinutes = totalAhead * 15;

  // The active or next token number index
  const currentlyActiveIndex = activeQueue.findIndex((b) => b.status === 'active');
  const currentToken = currentlyActiveIndex >= 0 ? currentlyActiveIndex + 1 : 1;

  return {
    totalAhead,
    currentToken,
    estimatedWaitMinutes,
    status: targetBooking.status,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * FARMER-SIDE SLOT CANCELLATION & WAITLIST AUTOMATION
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Validates whether a slot booking is eligible for cancellation.
 * STRICT RULE: Farmer can cancel ONLY up to one day before the slot date.
 * Same-day or past cancellations are strictly blocked.
 */
export function canCancelSlotBooking(
  bookingDate: string,
  nowInput?: Date | string
): { allowed: boolean; reasonKey?: string; message: string } {
  const todayIST = toLocalISODate(nowInput);

  if (bookingDate <= todayIST) {
    return {
      allowed: false,
      reasonKey: 'slot.cancellationBlockedSameDay',
      message: 'Cancellations are only allowed up to 1 day before the scheduled slot date. Same-day or past cancellations cannot be processed.',
    };
  }

  return {
    allowed: true,
    message: 'Eligible for cancellation.',
  };
}

/**
 * Promotes the next waitlisted farmer for a vacated slot.
 */
export async function promoteNextWaitlistedFarmer(
  mandiId: string,
  bookingDate: string,
  slotStartTime: string
): Promise<SlotBooking | null> {
  let promotedBooking: SlotBooking | null = null;

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      // 1. Try PostgreSQL function if available in database
      const { data: rpcPromotedId } = await supabase.rpc('promote_next_waitlisted_farmer', {
        p_mandi_id: mandiId,
        p_booking_date: bookingDate,
        p_slot_start_time: slotStartTime,
      });

      if (rpcPromotedId) {
        const { data } = await supabase.from('slot_bookings').select('*').eq('id', rpcPromotedId).single();
        if (data) promotedBooking = data as SlotBooking;
      } else {
        // 2. Direct query fallback
        const { data: waitlisted } = await supabase
          .from('slot_bookings')
          .select('*')
          .eq('mandi_id', mandiId)
          .eq('booking_date', bookingDate)
          .eq('slot_start_time', slotStartTime)
          .eq('status', 'waitlisted')
          .order('waitlist_position', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true })
          .limit(1);

        if (waitlisted && waitlisted.length > 0) {
          const target = waitlisted[0];
          const { data: updated } = await supabase
            .from('slot_bookings')
            .update({ status: 'waiting', waitlist_position: null })
            .eq('id', target.id)
            .select()
            .single();
          if (updated) promotedBooking = updated as SlotBooking;
        }
      }
    } catch {
      // Supabase query fallback handled below
    }
  }

  // 3. Update local cache
  const localList = getLocalCache<SlotBooking[]>(STORAGE_BOOKINGS, []);
  const waitlistIndex = localList.findIndex(
    (b) =>
      b.mandi_id === mandiId &&
      b.booking_date === bookingDate &&
      b.slot_start_time === slotStartTime &&
      b.status === 'waitlisted'
  );

  if (waitlistIndex !== -1) {
    localList[waitlistIndex] = {
      ...localList[waitlistIndex],
      status: 'waiting',
      waitlist_position: undefined,
    };
    if (!promotedBooking) {
      promotedBooking = localList[waitlistIndex];
    }
    setLocalCache(STORAGE_BOOKINGS, localList);
  }

  if (promotedBooking) {
    notifyBroadcast('SLOT_PROMOTED', {
      booking: promotedBooking,
      farmerPhone: promotedBooking.farmer_phone,
      bookingId: promotedBooking.id,
    });
    notifyBroadcast('TOKEN_STATUS_UPDATED', {
      bookingId: promotedBooking.id,
      status: 'waiting',
      booking: promotedBooking,
    });
  }

  return promotedBooking;
}

/**
 * Cancels a farmer's slot booking with 1-day advance notice validation,
 * frees the slot in Supabase, and reassigns it to the next waitlisted farmer.
 */
export async function cancelSlotBooking(
  bookingId: string,
  reason: string = 'Cancelled by farmer'
): Promise<{ success: boolean; error?: string; booking?: SlotBooking; promotedBooking?: SlotBooking | null }> {
  const localList = getLocalCache<SlotBooking[]>(STORAGE_BOOKINGS, []);
  const localBooking = localList.find((b) => b.id === bookingId);

  // Harmless double-cancel check: if already cancelled, succeed idempotently
  if (localBooking?.status === 'cancelled') {
    return { success: true, booking: localBooking, promotedBooking: null };
  }

  let bookingDate = localBooking?.booking_date;
  let targetMandiId = localBooking?.mandi_id;
  let targetSlotTime = localBooking?.slot_start_time;

  // Retrieve details from Supabase if not found locally
  if (!bookingDate && hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('slot_bookings').select('*').eq('id', bookingId).single();
      if (data) {
        if (data.status === 'cancelled') {
          return { success: true, booking: data as SlotBooking, promotedBooking: null };
        }
        bookingDate = data.booking_date;
        targetMandiId = data.mandi_id;
        targetSlotTime = data.slot_start_time;
      }
    } catch {
      // ignore
    }
  }

  if (!bookingDate) {
    return { success: false, error: 'Booking record not found.' };
  }

  // 1-Day rule check
  const check = canCancelSlotBooking(bookingDate);
  if (!check.allowed) {
    return { success: false, error: check.message };
  }

  const nowIso = new Date().toISOString();
  let updatedBooking: SlotBooking | undefined;

  // 1. Try Supabase RPC or direct update
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { error: rpcErr } = await supabase.rpc('cancel_farmer_slot', {
        p_booking_id: bookingId,
        p_reason: reason,
      });

      if (rpcErr) {
        await supabase
          .from('slot_bookings')
          .update({
            status: 'cancelled',
            cancelled_at: nowIso,
            cancellation_reason: reason,
          })
          .eq('id', bookingId);
      }
    } catch {
      // fallback
    }
  }

  // 2. Update local cache
  const idx = localList.findIndex((b) => b.id === bookingId);
  if (idx !== -1) {
    localList[idx] = {
      ...localList[idx],
      status: 'cancelled',
      cancelled_at: nowIso,
      cancellation_reason: reason,
    };
    updatedBooking = localList[idx];
    setLocalCache(STORAGE_BOOKINGS, localList);
  }

  // 3. Automatically promote next waitlisted farmer for this exact slot in offline mode (Postgres trigger handles it online)
  let promotedBooking: SlotBooking | null = null;
  if (!hasValidSupabaseConfig() && targetMandiId && bookingDate && targetSlotTime) {
    promotedBooking = await promoteNextWaitlistedFarmer(targetMandiId, bookingDate, targetSlotTime);
  }

  // 4. Notify all tabs & components
  notifyBroadcast('SLOT_CANCELLED', {
    bookingId,
    booking: updatedBooking,
    promotedBooking,
  });
  notifyBroadcast('TOKEN_STATUS_UPDATED', {
    bookingId,
    status: 'cancelled',
    booking: updatedBooking,
  });

  return { success: true, booking: updatedBooking, promotedBooking };
}

/**
 * Retrieves all bookings associated with a farmer's mobile number or user ID.
 */
export async function getFarmerBookings(phoneOrUserId: string): Promise<SlotBooking[]> {
  const cleanPhone = phoneOrUserId.replace(/\D/g, '').slice(-10);
  let list: SlotBooking[] = [];

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      let query = supabase.from('slot_bookings').select('*');
      if (cleanPhone) {
        query = query.or(`farmer_phone.eq.${phoneOrUserId},farmer_phone.ilike.%${cleanPhone}%,farmer_id.eq.${phoneOrUserId}`);
      } else {
        query = query.eq('farmer_id', phoneOrUserId);
      }

      const { data, error } = await query
        .order('booking_date', { ascending: false })
        .order('slot_start_time', { ascending: false });

      if (!error && data) {
        list = data as SlotBooking[];
      }
    } catch {
      // fallback
    }
  }

  const localList = getLocalCache<SlotBooking[]>(STORAGE_BOOKINGS, []);
  for (const item of localList) {
    const matchPhone = cleanPhone && item.farmer_phone?.replace(/\D/g, '').slice(-10) === cleanPhone;
    const matchId = item.farmer_id === phoneOrUserId;
    if (matchPhone || matchId) {
      const existingIdx = list.findIndex((b) => b.id === item.id);
      if (existingIdx === -1) {
        list.push(item);
      } else {
        list[existingIdx] = item;
      }
    }
  }

  list.sort((a, b) => b.booking_date.localeCompare(a.booking_date) || b.slot_start_time.localeCompare(a.slot_start_time));
  return list;
}

/* ─────────────────────────────────────────────────────────────────────────
 * CROSS-MANDI FARMER DELAY & PENALTY TRACKING
 * ───────────────────────────────────────────────────────────────────────── */
export async function logFarmerDelay(input: Omit<FarmerDelay, 'id' | 'created_at'>): Promise<FarmerDelay> {
  const newDelay: FarmerDelay = {
    ...input,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('farmer_delays').insert(newDelay);
      if (error) {
        console.error('[MandiService] logFarmerDelay Supabase error:', error);
      }
    } catch (err: unknown) {
      console.warn('[MandiService] logFarmerDelay exception (offline mode):', err);
    }
  }

  // Save to local cache
  const delays = getLocalCache<FarmerDelay[]>(STORAGE_DELAYS, []);
  delays.push(newDelay);
  setLocalCache(STORAGE_DELAYS, delays);

  notifyBroadcast('FARMER_DELAY_RECORDED', newDelay);
  return newDelay;
}

export async function getFarmerDelays(farmerPhone: string): Promise<FarmerDelay[]> {
  const cleanPhone = farmerPhone.replace(/\D/g, '').slice(-10);
  let list: FarmerDelay[] = [];

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('farmer_delays')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        list = data as FarmerDelay[];
      }
    } catch {
      // fallback
    }
  }

  const localDelays = getLocalCache<FarmerDelay[]>(STORAGE_DELAYS, []);
  for (const ld of localDelays) {
    if (!list.some((d) => d.id === ld.id)) {
      list.push(ld);
    }
  }

  return list.filter((d) => d.farmer_phone.replace(/\D/g, '').slice(-10) === cleanPhone);
}

export async function getAllFarmerDelays(): Promise<FarmerDelay[]> {
  let list: FarmerDelay[] = [];

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('farmer_delays')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        list = data as FarmerDelay[];
      }
    } catch {
      // fallback
    }
  }

  const localDelays = getLocalCache<FarmerDelay[]>(STORAGE_DELAYS, []);
  for (const ld of localDelays) {
    if (!list.some((d) => d.id === ld.id)) {
      list.push(ld);
    }
  }

  return list;
}

/* ─────────────────────────────────────────────────────────────────────────
 * REAL-TIME SUBSCRIPTIONS
 * ───────────────────────────────────────────────────────────────────────── */
type MandiQueueEvent = {
  type?: string;
  payload?: {
    mandi_id?: string;
    token_number?: SlotBooking['token_number'];
    farmer_name?: string;
    booking?: Partial<SlotBooking>;
    bookingId?: string;
  };
};

export function subscribeToMandiQueue(mandiId: string, onUpdate: (event: MandiQueueEvent) => void): () => void {
  let supabaseSub: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
  let supabaseInstance: ReturnType<typeof createClient> | null = null;

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      supabaseInstance = supabase;
      supabaseSub = supabase
        .channel(`mandi_queue_${mandiId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'slot_bookings',
            filter: `mandi_id=eq.${mandiId}`,
          },
          () => {
            onUpdate({});
          }
        )
        .subscribe();
    } catch {
      // ignore
    }
  }

  // Cross-tab broadcast listener
  const handleBroadcast = (e: MessageEvent<MandiQueueEvent>) => {
    if (e.data?.payload?.mandi_id === mandiId || e.data?.type === 'TOKEN_STATUS_UPDATED') {
      onUpdate(e.data);
    }
  };

  const handleCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent<MandiQueueEvent>).detail;
    if (detail?.payload?.mandi_id === mandiId || detail?.type === 'TOKEN_STATUS_UPDATED') {
      onUpdate(detail);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('km_sync_event', handleCustomEvent);
  }

  return () => {
    if (supabaseSub && supabaseInstance) {
      try {
        supabaseInstance.removeChannel(supabaseSub);
      } catch {
        // ignore
      }
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('km_sync_event', handleCustomEvent);
    }
  };
}

export function subscribeToFarmerBooking(bookingId: string, onUpdate: (booking: SlotBooking) => void): () => void {
  let supabaseSub: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
  let supabaseInstance: ReturnType<typeof createClient> | null = null;

  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      supabaseInstance = supabase;
      supabaseSub = supabase
        .channel(`farmer_booking_${bookingId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'slot_bookings',
            filter: `id=eq.${bookingId}`,
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            if (payload.new) {
              onUpdate(payload.new as SlotBooking);
            }
          }
        )
        .subscribe();
    } catch {
      // ignore
    }
  }

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.payload?.bookingId === bookingId && e.data?.payload?.booking) {
      onUpdate(e.data.payload.booking);
    }
  };

  const handleCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.payload?.bookingId === bookingId && detail?.payload?.booking) {
      onUpdate(detail.payload.booking);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('km_sync_event', handleCustomEvent);
  }

  return () => {
    if (supabaseSub && supabaseInstance) {
      try {
        supabaseInstance.removeChannel(supabaseSub);
      } catch {
        // ignore
      }
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('km_sync_event', handleCustomEvent);
    }
  };
}
