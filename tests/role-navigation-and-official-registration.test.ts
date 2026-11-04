import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_OFFICIALS,
  loginGovernmentOfficial,
  registerGovernmentOfficial,
  logoutGovernmentOfficial,
  getCurrentGovernmentOfficialSession,
} from '@/lib/government-procurement-service';
import { FARM_MACHINERY_CATALOG } from '@/lib/machinery-data';

describe('Government Officials Seed Accounts & Registration', () => {
  beforeEach(() => {
    logoutGovernmentOfficial();
  });

  it('contains at least 5 realistic seed government officials with all schema fields', () => {
    expect(DEFAULT_OFFICIALS.length).toBeGreaterThanOrEqual(5);

    DEFAULT_OFFICIALS.slice(0, 5).forEach((official) => {
      expect(official.id).toBeDefined();
      expect(official.full_name).toBeTruthy();
      expect(official.employee_id).toMatch(/^[A-Z0-9-]+$/);
      expect(official.designation).toBeTruthy();
      expect(official.department).toBeTruthy();
      expect(official.procurement_agency_id).toBeTruthy();
      expect(official.state).toBeTruthy();
      expect(official.district).toBeTruthy();
      expect(official.taluka).toBeTruthy();
      expect(official.assigned_procurement_centre_id).toBeTruthy();
      expect(official.official_mobile).toMatch(/^\+91\d{10}$/);
      expect(official.official_email).toMatch(/^.+@.+\..+$/);
      expect(official.verification_status).toBe('verified');
      expect(official.account_status).toBe('active');
    });
  });

  it('authenticates each of the 5 seed officials successfully', async () => {
    for (const official of DEFAULT_OFFICIALS.slice(0, 5)) {
      const res = await loginGovernmentOfficial(official.employee_id, official.password_plain);
      expect(res.success).toBe(true);
      expect(res.session).toBeDefined();
      expect(res.session?.official.employee_id).toBe(official.employee_id);
    }
  });

  it('validates required fields during official registration', async () => {
    // Missing full name
    const res1 = await registerGovernmentOfficial({
      full_name: 'A',
      employee_id: 'TEST-EMP-01',
      designation: 'Officer',
      department: 'Procurement',
      procurement_agency_id: '11111111-2222-3333-4444-555555555501',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Haveli',
      official_mobile: '9822112233',
      official_email: 'test@fci.gov.in',
      password: 'password123',
    });
    expect(res1.success).toBe(false);
    expect(res1.error).toContain('Full name must be at least 3 characters');

    // Invalid email
    const res2 = await registerGovernmentOfficial({
      full_name: 'Valid Name',
      employee_id: 'TEST-EMP-02',
      designation: 'Officer',
      department: 'Procurement',
      procurement_agency_id: '11111111-2222-3333-4444-555555555501',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Haveli',
      official_mobile: '9822112233',
      official_email: 'invalid-email',
      password: 'password123',
    });
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('valid official email address');

    // Short password
    const res3 = await registerGovernmentOfficial({
      full_name: 'Valid Name',
      employee_id: 'TEST-EMP-03',
      designation: 'Officer',
      department: 'Procurement',
      procurement_agency_id: '11111111-2222-3333-4444-555555555501',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Haveli',
      official_mobile: '9822112233',
      official_email: 'test@fci.gov.in',
      password: '123',
    });
    expect(res3.success).toBe(false);
    expect(res3.error).toContain('Password must be at least 6 characters');
  });

  it('successfully registers a new official and allows immediate login with registered credentials', async () => {
    const newEmpId = `TEST-REG-${Date.now()}`;
    const newEmail = `officer-${Date.now()}@fci.gov.in`;
    const newPassword = 'SecureOfficial@2026';

    const regRes = await registerGovernmentOfficial({
      full_name: 'Anand Mohan Rao',
      employee_id: newEmpId,
      designation: 'Sub-Divisional Procurement Inspector',
      department: 'Food Safety & Procurement Vigilance',
      procurement_agency_id: '11111111-2222-3333-4444-555555555501',
      procurement_agency_name: 'Food Corporation of India (FCI)',
      state: 'Maharashtra',
      district: 'Nagpur',
      taluka: 'Kalamna',
      official_mobile: '9876543210',
      official_email: newEmail,
      password: newPassword,
    });

    expect(regRes.success).toBe(true);
    expect(regRes.official).toBeDefined();
    expect(regRes.official?.employee_id).toBe(newEmpId);

    // Attempt login with newly registered employee ID and password
    const loginRes = await loginGovernmentOfficial(newEmpId, newPassword);
    expect(loginRes.success).toBe(true);
    expect(loginRes.session?.official.full_name).toBe('Anand Mohan Rao');
    expect(getCurrentGovernmentOfficialSession()?.official.employee_id).toBe(newEmpId);
  });
});

describe('Farm Machinery SVG Catalog Specification', () => {
  it('contains all 8 distinct machinery items across all farming stages', () => {
    expect(FARM_MACHINERY_CATALOG.length).toBe(8);

    const ids = FARM_MACHINERY_CATALOG.map((m) => m.id);
    expect(ids).toContain('mac-plough-01');
    expect(ids).toContain('mac-rotavator-02');
    expect(ids).toContain('mac-drill-03');
    expect(ids).toContain('mac-harvester-04');
    expect(ids).toContain('mac-thresher-05');
    expect(ids).toContain('mac-huller-06');
    expect(ids).toContain('mac-laser-07');
    expect(ids).toContain('mac-sprayer-08');

    FARM_MACHINERY_CATALOG.forEach((machine) => {
      expect(machine.name).toBeTruthy();
      expect(machine.hourlyRentalRate).toBeGreaterThan(0);
      expect(machine.provider.operatorName).toBeTruthy();
      expect(machine.provider.operatorPhone).toBeTruthy();
    });
  });
});

