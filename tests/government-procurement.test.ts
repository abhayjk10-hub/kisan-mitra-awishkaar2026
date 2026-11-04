import { describe, it, expect, beforeEach } from 'vitest';
import {
  loginGovernmentOfficial,
  getCurrentGovernmentOfficialSession,
  logoutGovernmentOfficial,
  checkMspEligibility,
  submitProcurementApplication,
  scheduleInspectionAppointment,
  evaluateParameterResult,
  submitQualityInspectionDecision,
  submitFarmerComplaint,
  getFarmerComplaints,
  updateComplaintStatus,
  getProcurementAuditLogs,
  getQualityStandardsForCrop,
  getAllCentres,
} from '@/lib/government-procurement-service';

describe('Government Procurement (MSP) Module', () => {
  beforeEach(() => {
    logoutGovernmentOfficial();
  });

  describe('1. Government Official Authentication', () => {
    it('authenticates a verified official with employee ID and official password', async () => {
      const res = await loginGovernmentOfficial('GOV-MS-FCI-001', 'govt@kisan2026');
      expect(res.success).toBe(true);
      expect(res.session).toBeDefined();
      expect(res.session?.official.employee_id).toBe('FCI-MH-2024-8841');
      expect(res.session?.official.full_name).toContain('Rajeshwar');
      expect(res.session?.official.verification_status).toBe('verified');
    });

    it('authenticates via official email address', async () => {
      const res = await loginGovernmentOfficial('sunita.more@nafed-india.com', 'govt@kisan2026');
      expect(res.success).toBe(true);
      expect(res.session?.official.procurement_agency_name).toBe('NAFED');
    });

    it('rejects unverified or invalid official identifiers', async () => {
      const res = await loginGovernmentOfficial('UNAUTHORIZED-OFFICER-999', 'govt@kisan2026');
      expect(res.success).toBe(false);
      expect(res.error).toContain('No registered government official found');
    });

    it('rejects incorrect password for official account', async () => {
      const res = await loginGovernmentOfficial('GOV-MS-FCI-001', 'wrong_password');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid');
    });

    it('clears session on official logout', async () => {
      await loginGovernmentOfficial('GOV-MS-FCI-001', 'govt@kisan2026');
      expect(getCurrentGovernmentOfficialSession()).not.toBeNull();
      logoutGovernmentOfficial();
      expect(getCurrentGovernmentOfficialSession()).toBeNull();
    });
  });

  describe('2. MSP Eligibility & Scheme Engine', () => {
    it('resolves active MSP rates for Wheat under Rabi season', () => {
      const eligibility = checkMspEligibility('Wheat', 'FAQ Standard', 'Maharashtra', 'Rabi 2025-26');
      expect(eligibility.eligible).toBe(true);
      expect(eligibility.msp_record).toBeDefined();
      expect(eligibility.msp_record?.msp_per_quintal).toBe(2275);
      expect(eligibility.scheme?.agency_name).toBe('Food Corporation of India');
    });

    it('resolves active MSP rates for Soybean under Kharif season', () => {
      const eligibility = checkMspEligibility('Soybean', 'Yellow (FAQ)', 'Maharashtra', 'Kharif 2025-26');
      expect(eligibility.eligible).toBe(true);
      expect(eligibility.msp_record?.msp_per_quintal).toBe(4892);
      expect(eligibility.scheme?.agency_name).toBe('NAFED');
    });

    it('provides standard centers across agricultural hubs', () => {
      const centres = getAllCentres();
      expect(centres.length).toBeGreaterThanOrEqual(4);
      expect(centres.some((c) => c.district === 'Pune')).toBe(true);
      expect(centres.some((c) => c.district === 'Nashik')).toBe(true);
    });
  });

  describe('3. Application Submission & Strict Aadhaar DBT Gating', () => {
    it('STRICTLY BLOCKS application submission if Aadhaar DBT declaration is false or absent', async () => {
      const res = await submitProcurementApplication({
        farmer_id: 'test-farmer-01',
        farmer_name: 'Suresh Patil',
        farmer_phone: '9822001122',
        crop_name: 'Wheat',
        crop_variety: 'FAQ Standard',
        declared_quantity_quintals: 40,
        proposed_inspection_quantity_quintals: 40,
        harvest_date: '2026-03-20',
        harvest_season: 'Rabi 2025-26',
        village: 'Panchavati',
        taluka: 'Nashik',
        district: 'Nashik',
        state: 'Maharashtra',
        has_aadhaar_dbt_bank_account: false, // NOT DECLARED
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Aadhaar-seeded DBT');
      expect(res.application).toBeUndefined();
    });

    it('successfully registers application when Aadhaar DBT declaration is true and generates KM-MSP-2026-XXXX ID', async () => {
      const res = await submitProcurementApplication({
        farmer_id: 'test-farmer-02',
        farmer_name: 'Ananda Shinde',
        farmer_phone: '9822334455',
        crop_name: 'Paddy (Dhan)',
        crop_variety: 'Common',
        declared_quantity_quintals: 60,
        proposed_inspection_quantity_quintals: 60,
        harvest_date: '2026-03-25',
        harvest_season: 'Kharif 2025-26',
        village: 'Baramati',
        taluka: 'Baramati',
        district: 'Pune',
        state: 'Maharashtra',
        has_aadhaar_dbt_bank_account: true, // AFFIRMATIVE DECLARATION
      });

      expect(res.success).toBe(true);
      expect(res.application).toBeDefined();
      expect(res.application?.application_number).toMatch(/^KM-MSP-2026-\d{4}$/);
      expect(res.application?.application_status).toBe('submitted');
      expect(res.application?.has_aadhaar_dbt_bank_account).toBe(true);
    });
  });

  describe('4. Inspection Appointment Scheduling & Verbatim Notification', () => {
    it('schedules appointment and produces verbatim required notification message format', async () => {
      // Login as official
      await loginGovernmentOfficial('GOV-MS-FCI-001', 'govt@kisan2026');

      // Create app
      const appRes = await submitProcurementApplication({
        farmer_id: 'test-farmer-03',
        farmer_name: 'Rameshwar Pawar',
        farmer_phone: '9822998877',
        crop_name: 'Wheat',
        crop_variety: 'FAQ Standard',
        declared_quantity_quintals: 50,
        proposed_inspection_quantity_quintals: 50,
        harvest_date: '2026-03-28',
        harvest_season: 'Rabi 2025-26',
        village: 'Lasalgaon',
        taluka: 'Niphad',
        district: 'Nashik',
        state: 'Maharashtra',
        has_aadhaar_dbt_bank_account: true,
      });

      const appId = appRes.application!.id;

      // Schedule inspection
      const schedRes = await scheduleInspectionAppointment({
        application_id: appId,
        appointment_date: '2026-04-05',
        appointment_time_slot: '10:00 AM – 12:00 PM',
        centre_name: 'Lasalgaon Central Grain Procurement Depot',
        centre_id: '22222222-3333-4444-5555-666666666604',
        instructions_for_farmer: 'Bring clean bags and land 7/12 record.',
      });

      expect(schedRes.success).toBe(true);
      expect(schedRes.appointment).toBeDefined();
      expect(schedRes.appointment!.appointment_status).toBe('scheduled');

      // Verify exact notification text template
      expect(schedRes.notificationMessage).toContain('DEAR FARMER RAMESHWAR PAWAR');
      expect(schedRes.notificationMessage).toContain('You are requested to bring your agricultural produce for quality inspection');
      expect(schedRes.notificationMessage).toContain('10:00 AM – 12:00 PM');
      expect(schedRes.notificationMessage).toContain('Lasalgaon Central Grain Procurement Depot');
      expect(schedRes.notificationMessage).toContain('– KISAN MITRA');
    });
  });

  describe('5. FAQ Quality Inspection Evaluation & Three-Way Decisions', () => {
    it('evaluates PASS / FAIL correctly against crop FAQ limits', () => {
      // Moisture limit for Wheat is max 12.0%
      expect(evaluateParameterResult(11.4, null, 12.0)).toBe('PASS');
      expect(evaluateParameterResult(12.0, null, 12.0)).toBe('PASS');
      expect(evaluateParameterResult(13.5, null, 12.0)).toBe('FAIL');

      // Foreign Matter limit is max 0.75%
      expect(evaluateParameterResult(0.4, null, 0.75)).toBe('PASS');
      expect(evaluateParameterResult(1.2, null, 0.75)).toBe('FAIL');
    });

    it('approves produce and generates official Inspection Certificate report', async () => {
      await loginGovernmentOfficial('GOV-MS-FCI-001', 'govt@kisan2026');

      const appRes = await submitProcurementApplication({
        farmer_id: 'test-farmer-04',
        farmer_name: 'Dnyaneshwar More',
        farmer_phone: '9822445566',
        crop_name: 'Wheat',
        crop_variety: 'FAQ Standard',
        declared_quantity_quintals: 45,
        proposed_inspection_quantity_quintals: 45,
        harvest_date: '2026-03-29',
        harvest_season: 'Rabi 2025-26',
        village: 'Gultekdi',
        taluka: 'Haveli',
        district: 'Pune',
        state: 'Maharashtra',
        has_aadhaar_dbt_bank_account: true,
      });

      const appId = appRes.application!.id;

      const standards = getQualityStandardsForCrop('Wheat');
      const passingParams = standards.map((s) => ({
        parameter_id: s.id,
        parameter_name: s.parameter_name,
        unit: s.unit,
        permissible_minimum: s.permissible_minimum,
        permissible_maximum: s.permissible_maximum,
        measured_value: s.permissible_maximum ? s.permissible_maximum * 0.8 : 0,
        result: 'PASS' as const,
      }));

      const decRes = await submitQualityInspectionDecision({
        application_id: appId,
        decision: 'APPROVE',
        inspected_quantity_quintals: 45,
        parameters_tested: passingParams,
        sample_seal_number: 'SEAL-PUN-001',
        observation_remarks: 'Luster good, completely clean.',
      });

      expect(decRes.success).toBe(true);
      expect(decRes.record?.decision).toBe('APPROVE');
      expect(decRes.report).toBeDefined();
      expect(decRes.report?.report_number).toMatch(/^REP-MSP-2026-\d{4}$/);
      expect(decRes.notificationMessage).toContain('passed the preliminary quality inspection');
    });

    it('requires mandatory rejection reason when decision is REJECT', async () => {
      await loginGovernmentOfficial('GOV-MS-FCI-001', 'govt@kisan2026');

      const appRes = await submitProcurementApplication({
        farmer_id: 'test-farmer-05',
        farmer_name: 'Babanrao Shirole',
        farmer_phone: '9822112233',
        crop_name: 'Soybean',
        crop_variety: 'Yellow (FAQ)',
        declared_quantity_quintals: 30,
        proposed_inspection_quantity_quintals: 30,
        harvest_date: '2026-03-29',
        harvest_season: 'Kharif 2025-26',
        village: 'Saat Rasta',
        taluka: 'Solapur',
        district: 'Solapur',
        state: 'Maharashtra',
        has_aadhaar_dbt_bank_account: true,
      });

      const appId = appRes.application!.id;

      // Fail without reason
      const failNoReason = await submitQualityInspectionDecision({
        application_id: appId,
        decision: 'REJECT',
        inspected_quantity_quintals: 30,
        parameters_tested: [],
        rejection_reason: '', // Missing
      });
      expect(failNoReason.success).toBe(false);

      // Succeed with reason
      const succeedWithReason = await submitQualityInspectionDecision({
        application_id: appId,
        decision: 'REJECT',
        inspected_quantity_quintals: 30,
        parameters_tested: [],
        rejection_reason: 'Moisture is 16.5% (max allowed 12.0%) and high percentage of weevilled seeds.',
      });
      expect(succeedWithReason.success).toBe(true);
      expect(succeedWithReason.record?.decision).toBe('REJECT');
      expect(succeedWithReason.notificationMessage).toContain('REASON FOR REJECTION');
    });

    it('handles RECHECK with instructional note and flag for re-inspection', async () => {
      await loginGovernmentOfficial('GOV-MS-FCI-001', 'govt@kisan2026');

      const appRes = await submitProcurementApplication({
        farmer_id: 'test-farmer-06',
        farmer_name: 'Kisanrao Gadre',
        farmer_phone: '9822667788',
        crop_name: 'Wheat',
        crop_variety: 'FAQ Standard',
        declared_quantity_quintals: 25,
        proposed_inspection_quantity_quintals: 25,
        harvest_date: '2026-03-30',
        harvest_season: 'Rabi 2025-26',
        village: 'Kalamna',
        taluka: 'Nagpur',
        district: 'Nagpur',
        state: 'Maharashtra',
        has_aadhaar_dbt_bank_account: true,
      });

      const appId = appRes.application!.id;

      const recheckRes = await submitQualityInspectionDecision({
        application_id: appId,
        decision: 'RECHECK',
        inspected_quantity_quintals: 25,
        parameters_tested: [],
        reinspection_reason: 'Moisture at 13.1%. Farmer advised to sun-dry for 24 hours and re-present for sampling.',
      });

      expect(recheckRes.success).toBe(true);
      expect(recheckRes.record?.decision).toBe('RECHECK');
      expect(recheckRes.notificationMessage).toContain('flagged for RECHECK');
    });
  });

  describe('6. Anti-Corruption Audit Trail & Farmer Grievances', () => {
    it('records immutable audit logs for procurement events', async () => {
      const logs = getProcurementAuditLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].id).toBeDefined();
      expect(logs[0].actor_role).toBeDefined();
    });

    it('allows farmer to submit formal complaint generating CMP-MSP-2026-XXXX ID', async () => {
      const complaintRes = await submitFarmerComplaint({
        application_id: 'test-app-id-999',
        farmer_id: 'farmer-complainer',
        complaint_category: 'QUALITY_DISPUTE',
        complaint_description: 'Moisture reading was taken using uncalibrated meter. Requesting supervisory re-test.',
      });

      expect(complaintRes.success).toBe(true);
      expect(complaintRes.complaint?.complaint_number).toMatch(/^CMP-MSP-2026-\d{4}$/);
      expect(complaintRes.complaint?.status).toBe('submitted');

      // Update complaint status by official
      const updateOk = updateComplaintStatus(
        complaintRes.complaint!.id,
        'resolved',
        'Supervisor tested with secondary calibrated bench meter. Readings verified.',
        'GOV-MS-FCI-001'
      );
      expect(updateOk).toBe(true);

      const farmerComplaints = getFarmerComplaints('farmer-complainer');
      expect(farmerComplaints[0].status).toBe('resolved');
    });
  });
});
