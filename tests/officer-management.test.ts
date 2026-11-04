import { describe, it, expect, beforeEach } from 'vitest';
import {
  SEED_OFFICERS,
  SHARED_DEMO_PASSWORD,
  loginOfficer,
  registerOfficer,
  listAllOfficers,
  getCurrentOfficerSession,
  logoutOfficer,
} from '@/lib/officer-service';
import * as fs from 'fs';
import * as path from 'path';

describe('APMC Crop Inspection Officers - Data Layer & Auth Workflows', () => {
  beforeEach(async () => {
    await logoutOfficer();
  });

  describe('1. 10 Seed Inspection Officers Specification', () => {
    it('contains exactly 10 seeded APMC inspection officers', () => {
      expect(SEED_OFFICERS).toHaveLength(10);
    });

    it('each seeded officer has realistic name, unique contact number, batch ID, officer ID, and login email', () => {
      const officerIds = new Set<string>();
      const contacts = new Set<string>();
      const emails = new Set<string>();
      const batchIds = new Set<string>();

      SEED_OFFICERS.forEach((officer, index) => {
        const expectedIndexStr = String(index + 1).padStart(2, '0');
        const expectedIndex3Str = String(index + 1).padStart(3, '0');

        // officer_id format: OFF-001 ... OFF-010
        expect(officer.officer_id).toBe(`OFF-${expectedIndex3Str}`);
        expect(officerIds.has(officer.officer_id)).toBe(false);
        officerIds.add(officer.officer_id);

        // batch_id format: APMC-B01 ... APMC-B10
        expect(officer.batch_id).toBe(`APMC-B${expectedIndexStr}`);
        batchIds.add(officer.batch_id);

        // full_name
        expect(officer.full_name).toBeTruthy();
        expect(officer.full_name.length).toBeGreaterThan(4);

        // contact_number format: +91 98220 01001 ... +91 98220 01010
        expect(officer.contact_number).toMatch(/^\+91 98220 \d{5}$/);
        expect(contacts.has(officer.contact_number)).toBe(false);
        contacts.add(officer.contact_number);

        // email format: officer001@apmc-demo.local ... officer010@apmc-demo.local
        expect(officer.email).toBe(`officer${expectedIndex3Str}@apmc-demo.local`);
        expect(emails.has(officer.email)).toBe(false);
        emails.add(officer.email);
      });

      expect(batchIds.size).toBe(10);
    });

    it('all 10 seeded officers share the specified demo password "Demo@12345"', () => {
      expect(SHARED_DEMO_PASSWORD).toBe('Demo@12345');
      SEED_OFFICERS.forEach((officer) => {
        expect(officer.password_plain).toBe('Demo@12345');
      });
    });
  });

  describe('2. SQL Migration & Schema Specification', () => {
    it('provides idempotent SQL migration with public.officers table and RLS policies', () => {
      const migrationPath = path.resolve(
        process.cwd(),
        'supabase/migrations/20261104_apmc_crop_inspection_officers.sql'
      );
      expect(fs.existsSync(migrationPath)).toBe(true);

      const sqlContent = fs.readFileSync(migrationPath, 'utf8');

      // Schema checks
      expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.officers');
      expect(sqlContent).toContain('id UUID PRIMARY KEY REFERENCES auth.users(id)');
      expect(sqlContent).toContain('officer_id TEXT NOT NULL UNIQUE');
      expect(sqlContent).toContain('full_name TEXT NOT NULL');
      expect(sqlContent).toContain('contact_number TEXT NOT NULL UNIQUE');
      expect(sqlContent).toContain('batch_id TEXT NOT NULL');
      expect(sqlContent).toContain('created_at TIMESTAMPTZ');

      // RLS and policy checks
      expect(sqlContent).toContain('ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;');
      expect(sqlContent).toContain('CREATE POLICY "Officers can read own profile"');
      expect(sqlContent).toContain('CREATE POLICY "Officers can update own profile"');
      expect(sqlContent).toContain('CREATE POLICY "Admins can view all officers"');
      expect(sqlContent).toContain('CREATE POLICY "Service role has full access"');

      // Seeding into auth.users and auth.identities
      expect(sqlContent).toContain('INSERT INTO auth.users');
      expect(sqlContent).toContain('INSERT INTO auth.identities');
      expect(sqlContent).toContain('extensions.crypt(\'Demo@12345\'');
    });
  });

  describe('3. Officer Authentication (loginOfficer)', () => {
    it('authenticates every seeded officer with email and Demo@12345', async () => {
      for (const seeded of SEED_OFFICERS) {
        const res = await loginOfficer(seeded.email, SHARED_DEMO_PASSWORD);
        expect(res.success).toBe(true);
        expect(res.session).toBeDefined();
        expect(res.session?.officer.officer_id).toBe(seeded.officer_id);
        expect(res.session?.officer.full_name).toBe(seeded.full_name);
        expect(res.session?.officer.batch_id).toBe(seeded.batch_id);

        const current = getCurrentOfficerSession();
        expect(current?.officer.officer_id).toBe(seeded.officer_id);
      }
    });

    it('also allows logging in using officer ID (e.g. OFF-001) as login identifier', async () => {
      const res = await loginOfficer('OFF-001', SHARED_DEMO_PASSWORD);
      expect(res.success).toBe(true);
      expect(res.session?.officer.officer_id).toBe('OFF-001');
    });

    it('rejects authentication with invalid password', async () => {
      const res = await loginOfficer('officer001@apmc-demo.local', 'WrongPassword!123');
      expect(res.success).toBe(false);
      expect(res.session).toBeUndefined();
      expect(res.error).toMatch(/invalid|failed/i);
    });

    it('rejects authentication with non-existent officer email', async () => {
      const res = await loginOfficer('nobody@apmc-demo.local', SHARED_DEMO_PASSWORD);
      expect(res.success).toBe(false);
      expect(res.session).toBeUndefined();
      expect(res.error).toMatch(/not found|no inspection officer|invalid/i);
    });

    it('clears session on logout', async () => {
      await loginOfficer('officer001@apmc-demo.local', SHARED_DEMO_PASSWORD);
      expect(getCurrentOfficerSession()).not.toBeNull();

      await logoutOfficer();
      expect(getCurrentOfficerSession()).toBeNull();
    });
  });

  describe('4. Manual Officer Registration (registerOfficer)', () => {
    it('validates required fields: full_name, contact_number, and batch_id', async () => {
      // Missing name
      const res1 = await registerOfficer({
        full_name: '',
        contact_number: '+91 98220 99991',
        batch_id: 'APMC-B11',
      });
      expect(res1.success).toBe(false);
      expect(res1.error).toContain('Full name is required');

      // Invalid contact
      const res2 = await registerOfficer({
        full_name: 'Prakash Rao',
        contact_number: '1234',
        batch_id: 'APMC-B11',
      });
      expect(res2.success).toBe(false);
      expect(res2.error).toContain('valid 10-digit');

      // Missing batch ID
      const res3 = await registerOfficer({
        full_name: 'Prakash Rao',
        contact_number: '+91 98220 99991',
        batch_id: '',
      });
      expect(res3.success).toBe(false);
      expect(res3.error).toContain('Batch ID is required');
    });

    it('successfully registers a new officer with auto-generated ID, email, and default shared password', async () => {
      const res = await registerOfficer({
        full_name: 'Mahesh G. Patil',
        contact_number: '+91 98220 77701',
        batch_id: 'APMC-B11',
      });

      expect(res.success).toBe(true);
      expect(res.officer).toBeDefined();
      expect(res.officer?.full_name).toBe('Mahesh G. Patil');
      expect(res.officer?.batch_id).toBe('APMC-B11');
      expect(res.officer?.officer_id).toMatch(/^OFF-/);
      expect(res.officer?.email).toContain('@apmc-demo.local');

      // Newly registered officer can immediately log in with default shared demo password
      const loginRes = await loginOfficer(res.officer!.email!, SHARED_DEMO_PASSWORD);
      expect(loginRes.success).toBe(true);
      expect(loginRes.session?.officer.full_name).toBe('Mahesh G. Patil');
    });

    it('supports custom officer_id, email, and custom password during manual registration', async () => {
      const res = await registerOfficer({
        full_name: 'Pooja V. Joshi',
        contact_number: '+91 98220 77702',
        batch_id: 'APMC-B12',
        officer_id: 'OFF-099',
        email: 'officer099@apmc-demo.local',
        password: 'CustomPassword@2026',
      });

      expect(res.success).toBe(true);
      expect(res.officer?.officer_id).toBe('OFF-099');
      expect(res.officer?.email).toBe('officer099@apmc-demo.local');

      // Can log in with custom password
      const loginRes = await loginOfficer('officer099@apmc-demo.local', 'CustomPassword@2026');
      expect(loginRes.success).toBe(true);
      expect(loginRes.session?.officer.officer_id).toBe('OFF-099');
    });

    it('retrieves all officers including seed and newly registered via listAllOfficers', async () => {
      const list = await listAllOfficers();
      expect(list.length).toBeGreaterThanOrEqual(10);

      // Verify seed officers are present
      const officer1 = list.find((o) => o.officer_id === 'OFF-001');
      expect(officer1).toBeDefined();
      expect(officer1?.full_name).toBe('Suresh M. Deshmukh');

      const officer10 = list.find((o) => o.officer_id === 'OFF-010');
      expect(officer10).toBeDefined();
      expect(officer10?.full_name).toBe('Archana T. Jagtap');
    });
  });
});
