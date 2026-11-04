import { createClient, hasValidSupabaseConfig } from '@/lib/supabase/client';
import { OfficerProfile, CreateOfficerInput, OfficerAuthSession } from '@/types/officer';

export const SHARED_DEMO_PASSWORD = 'Demo@12345';

/**
 * 10 Realistic Fictional Seed Records for APMC Crop Inspection Officers
 * Matching Supabase Migration: 20261104_apmc_crop_inspection_officers.sql
 */
export const SEED_OFFICERS: (OfficerProfile & { email: string; password_plain: string })[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    officer_id: 'OFF-001',
    full_name: 'Suresh M. Deshmukh',
    contact_number: '+91 98220 01001',
    batch_id: 'APMC-B01',
    email: 'officer001@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    officer_id: 'OFF-002',
    full_name: 'Anita R. Shinde',
    contact_number: '+91 98220 01002',
    batch_id: 'APMC-B02',
    email: 'officer002@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    officer_id: 'OFF-003',
    full_name: 'Vikram P. Jadhav',
    contact_number: '+91 98220 01003',
    batch_id: 'APMC-B03',
    email: 'officer003@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    officer_id: 'OFF-004',
    full_name: 'Meena K. Patil',
    contact_number: '+91 98220 01004',
    batch_id: 'APMC-B04',
    email: 'officer004@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000105',
    officer_id: 'OFF-005',
    full_name: 'Rajesh V. Kulkarni',
    contact_number: '+91 98220 01005',
    batch_id: 'APMC-B05',
    email: 'officer005@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000106',
    officer_id: 'OFF-006',
    full_name: 'Sunita B. Chavan',
    contact_number: '+91 98220 01006',
    batch_id: 'APMC-B06',
    email: 'officer006@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000107',
    officer_id: 'OFF-007',
    full_name: 'Deepak N. Pawar',
    contact_number: '+91 98220 01007',
    batch_id: 'APMC-B07',
    email: 'officer007@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000108',
    officer_id: 'OFF-008',
    full_name: 'Kavita S. Gaikwad',
    contact_number: '+91 98220 01008',
    batch_id: 'APMC-B08',
    email: 'officer008@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000109',
    officer_id: 'OFF-009',
    full_name: 'Santosh G. More',
    contact_number: '+91 98220 01009',
    batch_id: 'APMC-B09',
    email: 'officer009@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000110',
    officer_id: 'OFF-010',
    full_name: 'Archana T. Jagtap',
    contact_number: '+91 98220 01010',
    batch_id: 'APMC-B10',
    email: 'officer010@apmc-demo.local',
    password_plain: SHARED_DEMO_PASSWORD,
    created_at: '2026-11-04T00:00:00Z',
  },
];

const STORAGE_OFFICER_SESSION = 'km_officer_session';
const STORAGE_LOCAL_OFFICERS = 'km_local_officers';

const memoryStore = new Map<string, unknown>();

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return memoryStore.has(key) ? (memoryStore.get(key) as T) : defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    memoryStore.set(key, value);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[OfficerService] localStorage set failed for ${key}:`, err);
  }
}

/**
 * 1. Log in an inspection officer with email and password
 * Authenticates against Supabase Auth, then loads the matching public.officers row.
 */
export async function loginOfficer(
  email: string,
  password: string
): Promise<{ success: boolean; session?: OfficerAuthSession; error?: string }> {
  let cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@')) {
    const match = SEED_OFFICERS.find((s) => s.officer_id.toLowerCase() === cleanEmail);
    if (match) {
      cleanEmail = match.email;
    } else {
      cleanEmail = `${cleanEmail}@apmc-demo.local`;
    }
  }

  // A. Supabase Auth Login
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!authError && authData?.user && authData?.session) {
        // Query officer profile from public.officers (enforces RLS)
        const { data: profile, error: profileError } = await supabase
          .from('officers')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        const officerProfile: OfficerProfile = profile || {
          id: authData.user.id,
          officer_id: (authData.user.user_metadata?.officer_id as string) || `OFF-${authData.user.id.slice(0, 4)}`,
          full_name: (authData.user.user_metadata?.full_name as string) || authData.user.email?.split('@')[0] || 'Inspection Officer',
          contact_number: (authData.user.user_metadata?.contact_number as string) || '+91 98220 00000',
          batch_id: (authData.user.user_metadata?.batch_id as string) || 'APMC-B00',
          email: authData.user.email,
          created_at: authData.user.created_at,
        };

        if (profileError) {
          console.warn('[OfficerService] Profile fetch warning:', profileError.message);
        }

        const session: OfficerAuthSession = {
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          officer: officerProfile,
          access_token: authData.session.access_token,
        };

        setStorageItem(STORAGE_OFFICER_SESSION, session);
        return { success: true, session };
      }
    } catch (err) {
      console.warn('[OfficerService] Supabase auth attempt failed, falling back to local seed:', err);
    }
  }

  // B. Fallback to Local/Demonstration Catalog (Seeds & Manually Added Officers)
  const localOfficers = getStorageItem<(OfficerProfile & { email: string; password_plain: string })[]>(
    STORAGE_LOCAL_OFFICERS,
    []
  );
  const allKnownOfficers = [...localOfficers, ...SEED_OFFICERS];

  const matched = allKnownOfficers.find(
    (o) =>
      o.email.toLowerCase() === cleanEmail ||
      o.officer_id.toLowerCase() === cleanEmail ||
      o.contact_number.replace(/\s+/g, '') === cleanEmail.replace(/\s+/g, '')
  );

  if (!matched) {
    return {
      success: false,
      error: `No inspection officer found with identifier '${email}'. Please verify your officer credentials.`,
    };
  }

  if (password !== matched.password_plain && password !== SHARED_DEMO_PASSWORD) {
    return {
      success: false,
      error: 'Invalid password. Please check your APMC access password.',
    };
  }

  const session: OfficerAuthSession = {
    user: {
      id: matched.id,
      email: matched.email,
    },
    officer: {
      id: matched.id,
      officer_id: matched.officer_id,
      full_name: matched.full_name,
      contact_number: matched.contact_number,
      batch_id: matched.batch_id,
      email: matched.email,
      created_at: matched.created_at,
    },
    access_token: `DEMO-OFFICER-TOKEN-${Date.now()}`,
  };

  setStorageItem(STORAGE_OFFICER_SESSION, session);
  return { success: true, session };
}

/**
 * 2. Register a new inspection officer manually
 * Takes name, contact number, batch ID, and optional officer ID / email / password.
 * Routes through secure server API /api/officers/register to use Supabase Admin API
 * without exposing the service-role key in client code.
 */
export async function registerOfficer(
  input: CreateOfficerInput
): Promise<{ success: boolean; officer?: OfficerProfile; error?: string }> {
  // Client-side Input Validation
  if (!input.full_name || input.full_name.trim().length < 3) {
    return { success: false, error: 'Full name is required and must be at least 3 characters long.' };
  }
  if (!input.contact_number || input.contact_number.trim().length < 8) {
    return { success: false, error: 'Please enter a valid 10-digit officer contact phone number.' };
  }
  if (!input.batch_id || input.batch_id.trim().length < 2) {
    return { success: false, error: 'Batch ID is required (e.g. APMC-B11).' };
  }

  // Auto-generate officer_id and email if omitted
  const cleanNameSlug = input.full_name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const officerId = input.officer_id?.trim().toUpperCase() || `OFF-${randomSuffix}`;
  const email =
    input.email?.trim().toLowerCase() ||
    `${cleanNameSlug || 'officer'}${randomSuffix}@apmc-demo.local`;
  const password = input.password || SHARED_DEMO_PASSWORD;

  // Dispatch to Secure Server Route in browser context (Uses Supabase Admin API)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/officers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: input.full_name.trim(),
          contact_number: input.contact_number.trim(),
          batch_id: input.batch_id.trim(),
          officer_id: officerId,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.officer) {
        // Also cache in local officers store for seamless offline/demo access
        const localOfficers = getStorageItem<(OfficerProfile & { email: string; password_plain: string })[]>(
          STORAGE_LOCAL_OFFICERS,
          []
        );
        localOfficers.push({
          ...data.officer,
          email,
          password_plain: password,
        });
        setStorageItem(STORAGE_LOCAL_OFFICERS, localOfficers);

        return { success: true, officer: data.officer };
      }

      if (data?.error && !data.error.includes('Server route fallback')) {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.warn('[OfficerService] API registration call failed, saving to local store:', err);
    }
  }

  // Standalone / Offline Fallback Registration
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-0000-0000-${Date.now()}`;
  const fallbackOfficer: OfficerProfile & { email: string; password_plain: string } = {
    id: newId,
    officer_id: officerId,
    full_name: input.full_name.trim(),
    contact_number: input.contact_number.trim(),
    batch_id: input.batch_id.trim(),
    email,
    password_plain: password,
    created_at: new Date().toISOString(),
  };

  const localOfficers = getStorageItem<(OfficerProfile & { email: string; password_plain: string })[]>(
    STORAGE_LOCAL_OFFICERS,
    []
  );
  localOfficers.push(fallbackOfficer);
  setStorageItem(STORAGE_LOCAL_OFFICERS, localOfficers);

  return { success: true, officer: fallbackOfficer };
}

/**
 * 3. List all officers (combines database rows via server API, local officers, and seed data)
 */
export async function listAllOfficers(): Promise<OfficerProfile[]> {
  // A. In browser context, query the server endpoint /api/officers (which queries with service-role permissions)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/officers');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.officers) && json.officers.length > 0) {
          const localOfficers = getStorageItem<OfficerProfile[]>(STORAGE_LOCAL_OFFICERS, []);
          const merged = [...localOfficers, ...json.officers];
          const unique = new Map<string, OfficerProfile>();
          merged.forEach((o) => {
            if (!unique.has(o.officer_id)) {
              unique.set(o.officer_id, o);
            }
          });
          return Array.from(unique.values()).sort((a, b) => a.officer_id.localeCompare(b.officer_id));
        }
      }
    } catch (err) {
      console.warn('[OfficerService] /api/officers fetch failed, falling back:', err);
    }
  }

  // B. Direct Supabase client query
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('officer_id', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as OfficerProfile[];
      }
    } catch {
      // fallback
    }
  }

  // C. Fallback: local store and seed catalog
  const localOfficers = getStorageItem<OfficerProfile[]>(STORAGE_LOCAL_OFFICERS, []);
  const all = [...localOfficers, ...SEED_OFFICERS];
  const unique = new Map<string, OfficerProfile>();
  all.forEach((o) => {
    if (!unique.has(o.officer_id)) {
      unique.set(o.officer_id, o);
    }
  });
  return Array.from(unique.values()).sort((a, b) => a.officer_id.localeCompare(b.officer_id));
}

/**
 * 4. Get active officer session
 */
export function getCurrentOfficerSession(): OfficerAuthSession | null {
  return getStorageItem<OfficerAuthSession | null>(STORAGE_OFFICER_SESSION, null);
}

/**
 * 5. Logout current officer
 */
export async function logoutOfficer(): Promise<void> {
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_OFFICER_SESSION);
  } else {
    memoryStore.delete(STORAGE_OFFICER_SESSION);
  }
}
