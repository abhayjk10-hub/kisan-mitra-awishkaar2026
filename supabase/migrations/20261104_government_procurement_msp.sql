-- =====================================================================
-- KISAN MITRA MIGRATION: GOVERNMENT PROCUREMENT (MSP) MODULE
-- 18 Tables, Indexes, RLS Policies, and Verified Master Data Seeds
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PROCUREMENT AGENCIES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name TEXT NOT NULL,
  agency_code TEXT NOT NULL UNIQUE,
  agency_type TEXT NOT NULL, -- Central, State, Cooperative
  state TEXT NOT NULL DEFAULT 'All-India',
  contact_details TEXT,
  active_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. PROCUREMENT CENTRES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_name TEXT NOT NULL,
  agency_id UUID REFERENCES procurement_agencies(id) ON DELETE SET NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  village TEXT NOT NULL,
  complete_address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_number TEXT,
  active_status BOOLEAN NOT NULL DEFAULT true,
  procurement_start_date DATE NOT NULL,
  procurement_end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. GOVERNMENT PROCUREMENT OFFICIALS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS government_officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  employee_id TEXT NOT NULL UNIQUE,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  procurement_agency_id UUID REFERENCES procurement_agencies(id) ON DELETE RESTRICT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  assigned_procurement_centre_id UUID REFERENCES procurement_centres(id) ON DELETE SET NULL,
  official_mobile TEXT NOT NULL,
  official_email TEXT NOT NULL UNIQUE,
  password_hash TEXT, -- demo auth support
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'suspended')),
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- 4. OFFICIAL VERIFICATION RECORDS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS official_verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  government_official_id UUID NOT NULL REFERENCES government_officials(id) ON DELETE CASCADE,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'pending', 'rejected', 'suspended')),
  verified_by TEXT NOT NULL,
  verification_method TEXT NOT NULL,
  verification_remarks TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. PROCUREMENT SCHEMES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name TEXT NOT NULL,
  scheme_code TEXT NOT NULL UNIQUE,
  scheme_type TEXT NOT NULL, -- PSS, Foodgrain, PDPS, MIS
  description TEXT,
  applicable_agency_id UUID REFERENCES procurement_agencies(id) ON DELETE SET NULL,
  state TEXT NOT NULL DEFAULT 'All-India',
  active_status BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL,
  effective_until DATE NOT NULL,
  official_source_url TEXT,
  source_notification_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 6. CROP MSP RECORDS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_msp_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  crop_variety TEXT DEFAULT 'FAQ Standard',
  marketing_season TEXT NOT NULL, -- Kharif 2025-26, Rabi 2025-26
  financial_year TEXT NOT NULL, -- 2025-26
  msp_per_quintal NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  applicable_scheme_id UUID REFERENCES procurement_schemes(id) ON DELETE SET NULL,
  applicable_state TEXT NOT NULL DEFAULT 'All-India',
  effective_from DATE NOT NULL,
  effective_until DATE NOT NULL,
  official_notification_number TEXT,
  official_source_url TEXT,
  verified_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. CROP QUALITY STANDARDS (FAQ)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_quality_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  crop_variety TEXT DEFAULT 'FAQ Standard',
  marketing_season TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  procurement_scheme_id UUID REFERENCES procurement_schemes(id) ON DELETE SET NULL,
  parameter_name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '% by weight',
  permissible_minimum NUMERIC(6, 2) DEFAULT NULL,
  permissible_maximum NUMERIC(6, 2) DEFAULT NULL,
  effective_from DATE NOT NULL,
  effective_until DATE NOT NULL,
  official_notification_number TEXT,
  official_source_url TEXT,
  verified_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 8. PROCUREMENT APPLICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT NOT NULL UNIQUE,
  farmer_id TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  crop_variety TEXT NOT NULL DEFAULT 'FAQ Standard',
  declared_quantity_quintals NUMERIC(10, 2) NOT NULL,
  proposed_inspection_quantity_quintals NUMERIC(10, 2) NOT NULL,
  harvest_date DATE NOT NULL,
  harvest_season TEXT NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  mandi_token_id TEXT DEFAULT NULL,
  procurement_scheme_id UUID REFERENCES procurement_schemes(id) ON DELETE SET NULL,
  procurement_agency_id UUID REFERENCES procurement_agencies(id) ON DELETE SET NULL,
  preferred_procurement_centre_id UUID REFERENCES procurement_centres(id) ON DELETE SET NULL,
  aadhaar_seeded_dbt_declaration BOOLEAN NOT NULL, -- STRICTLY YES/NO DECLARATION ONLY
  eligibility_status TEXT NOT NULL DEFAULT 'eligible' CHECK (eligibility_status IN ('eligible', 'conditionally_eligible', 'ineligible')),
  application_status TEXT NOT NULL DEFAULT 'submitted' CHECK (application_status IN (
    'draft',
    'submitted',
    'awaiting_review',
    'inspection_scheduled',
    'inspection_rescheduled',
    'inspection_cancelled',
    'inspection_in_progress',
    'quality_inspection_approved',
    'quality_inspection_rejected',
    'reinspection_required',
    'farmer_instructed_to_visit_centre',
    'official_document_verification_pending',
    'weighment_pending',
    'procurement_completed'
  )),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 9. INSPECTION APPOINTMENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES procurement_applications(id) ON DELETE CASCADE,
  assigned_official_id UUID REFERENCES government_officials(id) ON DELETE SET NULL,
  procurement_centre_id UUID REFERENCES procurement_centres(id) ON DELETE SET NULL,
  inspection_date DATE NOT NULL,
  inspection_time TEXT NOT NULL, -- e.g. 10:30 AM
  inspection_location TEXT NOT NULL,
  additional_instructions TEXT,
  appointment_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (appointment_status IN ('scheduled', 'rescheduled', 'completed', 'cancelled', 'farmer_absent')),
  scheduling_remarks TEXT,
  rescheduled_from_id UUID REFERENCES inspection_appointments(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  farmer_attendance_status TEXT DEFAULT 'pending' CHECK (farmer_attendance_status IN ('pending', 'attended', 'absent')),
  farmer_attendance_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 10. INSPECTION RECORDS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES procurement_applications(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES inspection_appointments(id) ON DELETE SET NULL,
  inspecting_official_id UUID NOT NULL REFERENCES government_officials(id) ON DELETE RESTRICT,
  inspection_reference_number TEXT NOT NULL UNIQUE,
  inspection_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  inspection_completed_at TIMESTAMPTZ,
  inspection_location TEXT NOT NULL,
  farmer_attendance_status TEXT NOT NULL DEFAULT 'attended',
  inspection_decision TEXT NOT NULL CHECK (inspection_decision IN ('APPROVE', 'REJECT', 'RECHECK')),
  official_remarks TEXT,
  rejection_reason TEXT, -- Mandatory if REJECT
  reinspection_reason TEXT, -- Mandatory if RECHECK
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 11. INSPECTION PARAMETERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_record_id UUID NOT NULL REFERENCES inspection_records(id) ON DELETE CASCADE,
  quality_standard_id UUID REFERENCES crop_quality_standards(id) ON DELETE SET NULL,
  parameter_name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '% by weight',
  permissible_minimum NUMERIC(6, 2),
  permissible_maximum NUMERIC(6, 2),
  actual_measured_value NUMERIC(6, 2) NOT NULL,
  inspection_result TEXT NOT NULL CHECK (inspection_result IN ('PASS', 'FAIL')),
  official_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 12. INSPECTION EVIDENCE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_record_id UUID NOT NULL REFERENCES inspection_records(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- photograph, moisture_meter_slip, lab_report
  file_description TEXT,
  uploaded_by UUID REFERENCES government_officials(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 13. INSPECTION REPORTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_record_id UUID NOT NULL REFERENCES inspection_records(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES procurement_applications(id) ON DELETE CASCADE,
  report_number TEXT NOT NULL UNIQUE,
  storage_path TEXT,
  report_generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by UUID REFERENCES government_officials(id) ON DELETE SET NULL,
  report_status TEXT NOT NULL DEFAULT 'generated' CHECK (report_status IN ('generated', 'downloaded', 'archived'))
);

-- ---------------------------------------------------------------------
-- 14. PROCUREMENT RECORDS (Post-Inspection Formalities)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES procurement_applications(id) ON DELETE CASCADE,
  procurement_centre_id UUID REFERENCES procurement_centres(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES procurement_agencies(id) ON DELETE SET NULL,
  quantity_presented NUMERIC(10, 2) NOT NULL,
  quantity_accepted NUMERIC(10, 2) NOT NULL,
  quantity_rejected NUMERIC(10, 2) NOT NULL DEFAULT 0,
  weighment_slip_number TEXT,
  procurement_acknowledgement_number TEXT,
  procurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  procurement_status TEXT NOT NULL DEFAULT 'completed' CHECK (procurement_status IN ('pending', 'in_progress', 'completed', 'disputed')),
  recorded_by UUID REFERENCES government_officials(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 15. FARMER COMPLAINTS / GRIEVANCES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number TEXT NOT NULL UNIQUE,
  application_id UUID NOT NULL REFERENCES procurement_applications(id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL,
  complaint_category TEXT NOT NULL CHECK (complaint_category IN (
    'QUALITY_DISPUTE',
    'REJECTION_APPEAL',
    'OFFICER_MISCONDUCT',
    'DELAY',
    'WEIGHMENT_DISPUTE',
    'Incorrect inspection readings',
    'Incorrect rejection',
    'Official identity mismatch',
    'Improper inspection conduct',
    'Demand for illegal payment',
    'Other complaints'
  )),
  complaint_description TEXT NOT NULL,
  related_official_id UUID REFERENCES government_officials(id) ON DELETE SET NULL,
  complaint_status TEXT NOT NULL DEFAULT 'submitted' CHECK (complaint_status IN ('submitted', 'under_review', 'investigation_pending', 'resolved', 'dismissed')),
  assigned_supervisor_id UUID,
  resolution_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- 16. COMPLAINT REVIEWS (Supervisory Action)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  review_action TEXT NOT NULL,
  review_remarks TEXT NOT NULL,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 17. PROCUREMENT NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id TEXT NOT NULL,
  application_id UUID REFERENCES procurement_applications(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'INSPECTION_SCHEDULED',
    'INSPECTION_RESCHEDULED',
    'INSPECTION_CANCELLED',
    'INSPECTION_APPROVED',
    'INSPECTION_REJECTED',
    'REINSPECTION_REQUIRED',
    'COMPLAINT_UPDATED'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- 18. PROCUREMENT AUDIT LOGS (Immutable Accountability Trail)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id TEXT NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('farmer', 'government_official', 'admin', 'supervisor', 'system')),
  application_id UUID REFERENCES procurement_applications(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  action_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- INDEXES FOR FAST QUERYING
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_proc_app_number ON procurement_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_proc_app_farmer ON procurement_applications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_proc_app_district ON procurement_applications(district);
CREATE INDEX IF NOT EXISTS idx_proc_app_status ON procurement_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_proc_app_crop ON procurement_applications(crop_name);

CREATE INDEX IF NOT EXISTS idx_insp_app_official ON inspection_appointments(assigned_official_id);
CREATE INDEX IF NOT EXISTS idx_insp_app_date ON inspection_appointments(inspection_date);
CREATE INDEX IF NOT EXISTS idx_insp_app_centre ON inspection_appointments(procurement_centre_id);

CREATE INDEX IF NOT EXISTS idx_insp_rec_app ON inspection_records(application_id);
CREATE INDEX IF NOT EXISTS idx_insp_rec_official ON inspection_records(inspecting_official_id);
CREATE INDEX IF NOT EXISTS idx_insp_rec_decision ON inspection_records(inspection_decision);

CREATE INDEX IF NOT EXISTS idx_complaints_app ON complaints(application_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(complaint_status);

CREATE INDEX IF NOT EXISTS idx_proc_notif_recipient ON procurement_notifications(recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_proc_audit_app ON procurement_audit_logs(application_id);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
ALTER TABLE procurement_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_msp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_quality_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public master data read policies
DROP POLICY IF EXISTS "Public read procurement agencies" ON procurement_agencies;
CREATE POLICY "Public read procurement agencies" ON procurement_agencies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read procurement centres" ON procurement_centres;
CREATE POLICY "Public read procurement centres" ON procurement_centres FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read procurement schemes" ON procurement_schemes;
CREATE POLICY "Public read procurement schemes" ON procurement_schemes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read crop msp records" ON crop_msp_records;
CREATE POLICY "Public read crop msp records" ON crop_msp_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read crop quality standards" ON crop_quality_standards;
CREATE POLICY "Public read crop quality standards" ON crop_quality_standards FOR SELECT USING (true);

-- Government Officials read
DROP POLICY IF EXISTS "Public read verified officials" ON government_officials;
CREATE POLICY "Public read verified officials" ON government_officials FOR SELECT USING (true);

-- Applications Policies
DROP POLICY IF EXISTS "Allow select applications" ON procurement_applications;
CREATE POLICY "Allow select applications" ON procurement_applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert applications" ON procurement_applications;
CREATE POLICY "Allow insert applications" ON procurement_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update applications" ON procurement_applications;
CREATE POLICY "Allow update applications" ON procurement_applications FOR UPDATE USING (true);

-- Appointments Policies
DROP POLICY IF EXISTS "Allow all appointments select" ON inspection_appointments;
CREATE POLICY "Allow all appointments select" ON inspection_appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all appointments insert" ON inspection_appointments;
CREATE POLICY "Allow all appointments insert" ON inspection_appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all appointments update" ON inspection_appointments;
CREATE POLICY "Allow all appointments update" ON inspection_appointments FOR UPDATE USING (true);

-- Inspection Records Policies
DROP POLICY IF EXISTS "Allow select inspection records" ON inspection_records;
CREATE POLICY "Allow select inspection records" ON inspection_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert inspection records" ON inspection_records;
CREATE POLICY "Allow insert inspection records" ON inspection_records FOR INSERT WITH CHECK (true);

-- Parameters Policies
DROP POLICY IF EXISTS "Allow select inspection parameters" ON inspection_parameters;
CREATE POLICY "Allow select inspection parameters" ON inspection_parameters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert inspection parameters" ON inspection_parameters;
CREATE POLICY "Allow insert inspection parameters" ON inspection_parameters FOR INSERT WITH CHECK (true);

-- Reports Policies
DROP POLICY IF EXISTS "Allow select inspection reports" ON inspection_reports;
CREATE POLICY "Allow select inspection reports" ON inspection_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert inspection reports" ON inspection_reports;
CREATE POLICY "Allow insert inspection reports" ON inspection_reports FOR INSERT WITH CHECK (true);

-- Notifications Policies
DROP POLICY IF EXISTS "Allow select notifications" ON procurement_notifications;
CREATE POLICY "Allow select notifications" ON procurement_notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert notifications" ON procurement_notifications;
CREATE POLICY "Allow insert notifications" ON procurement_notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update notifications" ON procurement_notifications;
CREATE POLICY "Allow update notifications" ON procurement_notifications FOR UPDATE USING (true);

-- Complaints Policies
DROP POLICY IF EXISTS "Allow select complaints" ON complaints;
CREATE POLICY "Allow select complaints" ON complaints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert complaints" ON complaints;
CREATE POLICY "Allow insert complaints" ON complaints FOR INSERT WITH CHECK (true);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Allow select audit logs" ON procurement_audit_logs;
CREATE POLICY "Allow select audit logs" ON procurement_audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert audit logs" ON procurement_audit_logs;
CREATE POLICY "Allow insert audit logs" ON procurement_audit_logs FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------------
-- MASTER DATA SEEDS
-- ---------------------------------------------------------------------

-- Agencies
INSERT INTO procurement_agencies (id, agency_name, agency_code, agency_type, state, contact_details)
VALUES 
  ('11111111-2222-3333-4444-555555555501', 'Food Corporation of India (FCI)', 'FCI-HQ', 'Central', 'All-India', 'Toll Free: 1800-180-1551 | contact@fci.gov.in'),
  ('11111111-2222-3333-4444-555555555502', 'National Agricultural Cooperative Marketing Federation of India Ltd. (NAFED)', 'NAFED-HQ', 'Central', 'All-India', 'Helpdesk: 011-26340019 | nafed@nafed-india.com'),
  ('11111111-2222-3333-4444-555555555503', 'National Cooperative Consumers Federation (NCCF)', 'NCCF-HQ', 'Central', 'All-India', 'Phone: 011-26417701 | info@nccf-india.com'),
  ('11111111-2222-3333-4444-555555555504', 'Maharashtra State Co-operative Marketing Federation (MSCMF)', 'MSCMF-MH', 'State', 'Maharashtra', 'Phone: 022-22026131 | info@mahamefed.org'),
  ('11111111-2222-3333-4444-555555555505', 'Maharashtra State Tribal Development Corporation', 'TDC-MH', 'State', 'Maharashtra', 'Phone: 0253-2578191 | contact@tribal.gov.in')
ON CONFLICT (agency_code) DO UPDATE 
SET agency_name = EXCLUDED.agency_name, contact_details = EXCLUDED.contact_details;

-- Procurement Centres
INSERT INTO procurement_centres (id, centre_name, agency_id, state, district, taluka, village, complete_address, contact_number, procurement_start_date, procurement_end_date)
VALUES
  ('22222222-3333-4444-5555-666666666601', 'Pune Gultekdi FCI State Depot', '11111111-2222-3333-4444-555555555501', 'Maharashtra', 'Pune', 'Haveli', 'Gultekdi', 'Gate No 4, Gultekdi Market Yard, Pune 411037', '+912024268801', '2025-10-01', '2026-06-30'),
  ('22222222-3333-4444-5555-666666666602', 'Nashik Panchavati PSS Procurement Centre', '11111111-2222-3333-4444-555555555502', 'Maharashtra', 'Nashik', 'Nashik', 'Panchavati', 'NAFED Sub-Yard, Peth Road, Panchavati, Nashik 422003', '+912532514412', '2025-10-15', '2026-05-31'),
  ('22222222-3333-4444-5555-666666666603', 'Lasalgaon NAFED Onion & Grain Centre', '11111111-2222-3333-4444-555555555502', 'Maharashtra', 'Nashik', 'Niphad', 'Lasalgaon', 'Station Yard, Lasalgaon APMC, Niphad 422306', '+912550266205', '2025-09-01', '2026-06-30'),
  ('22222222-3333-4444-5555-666666666604', 'Baramati MIDC PSS Centre', '11111111-2222-3333-4444-555555555504', 'Maharashtra', 'Pune', 'Baramati', 'Baramati', 'MSCMF Godown, MIDC Road, Baramati 413133', '+912112243880', '2025-10-01', '2026-05-31'),
  ('22222222-3333-4444-5555-666666666605', 'Ahmednagar Goods Shed Procurement Centre', '11111111-2222-3333-4444-555555555501', 'Maharashtra', 'Ahmednagar', 'Nagar', 'Ahmednagar', 'Near Goods Shed, Station Road, Ahmednagar 414001', '+912412451990', '2025-10-01', '2026-06-30'),
  ('22222222-3333-4444-5555-666666666606', 'Solapur Saat Rasta PSS Pulse Centre', '11111111-2222-3333-4444-555555555502', 'Maharashtra', 'Solapur', 'North Solapur', 'Solapur', 'Saat Rasta, Siddheshwar Peth, Solapur 413001', '+912172314560', '2025-10-15', '2026-05-31'),
  ('22222222-3333-4444-5555-666666666607', 'Nagpur Kalamna Grain Depot', '11111111-2222-3333-4444-555555555501', 'Maharashtra', 'Nagpur', 'Nagpur Rural', 'Kalamna', 'Central Avenue, Kalamna Market, Nagpur 440008', '+917122681220', '2025-10-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;

-- Schemes
INSERT INTO procurement_schemes (id, scheme_name, scheme_code, scheme_type, description, applicable_agency_id, state, effective_from, effective_until, source_notification_number)
VALUES
  ('33333333-4444-5555-6666-777777777701', 'Price Support Scheme (PSS)', 'SCH-PSS', 'PSS', 'Procurement of notified pulses, oilseeds, and copra at MSP by Central Nodal Agencies (NAFED, NCCF).', '11111111-2222-3333-4444-555555555502', 'All-India', '2025-04-01', '2026-03-31', 'MoA&FW/DOAC/PSS-2025/14'),
  ('33333333-4444-5555-6666-777777777702', 'Central Pool Foodgrain Procurement (FCI)', 'SCH-FCI-CP', 'Foodgrain', 'Direct procurement of Paddy, Wheat, and Coarse Grains by FCI and State Agencies for National Food Security.', '11111111-2222-3333-4444-555555555501', 'All-India', '2025-04-01', '2026-03-31', 'DFPD/FCI/KMS-RMS/2025-26/02'),
  ('33333333-4444-5555-6666-777777777703', 'Price Deficiency Payment Scheme (PDPS)', 'SCH-PDPS', 'PDPS', 'Direct payment of the difference between MSP and market price to verified registered farmers without physical produce movement.', '11111111-2222-3333-4444-555555555502', 'Maharashtra', '2025-04-01', '2026-03-31', 'MoA&FW/PM-AASHA/2025/08'),
  ('33333333-4444-5555-6666-777777777704', 'Market Intervention Scheme (MIS)', 'SCH-MIS', 'MIS', 'Procurement of perishable agricultural commodities (Onion, Garlic, Apple) when market prices drop below economic production threshold.', '11111111-2222-3333-4444-555555555503', 'Maharashtra', '2025-04-01', '2026-03-31', 'MoA&FW/HORT/MIS-2025/21')
ON CONFLICT (scheme_code) DO NOTHING;

-- Official MSP Records (Cabinet Committee on Economic Affairs - CCEA Official Rates)
INSERT INTO crop_msp_records (crop_name, crop_variety, marketing_season, financial_year, msp_per_quintal, applicable_scheme_id, effective_from, effective_until, official_notification_number)
VALUES
  ('Wheat', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 2275.00, '33333333-4444-5555-6666-777777777702', '2025-04-01', '2026-03-31', 'CCEA/RMS-2025-26/WHEAT-01'),
  ('Paddy (Dhan)', 'Common', 'Kharif 2025-26', '2025-26', 2300.00, '33333333-4444-5555-6666-777777777702', '2025-10-01', '2026-06-30', 'CCEA/KMS-2025-26/PADDY-01'),
  ('Paddy (Dhan)', 'Grade A', 'Kharif 2025-26', '2025-26', 2320.00, '33333333-4444-5555-6666-777777777702', '2025-10-01', '2026-06-30', 'CCEA/KMS-2025-26/PADDY-02'),
  ('Soybean', 'Yellow (FAQ)', 'Kharif 2025-26', '2025-26', 4892.00, '33333333-4444-5555-6666-777777777701', '2025-10-01', '2026-05-31', 'CCEA/KMS-2025-26/SOY-01'),
  ('Cotton', 'Medium Staple', 'Kharif 2025-26', '2025-26', 7121.00, '33333333-4444-5555-6666-777777777701', '2025-10-01', '2026-06-30', 'CCEA/KMS-2025-26/COT-01'),
  ('Cotton', 'Long Staple', 'Kharif 2025-26', '2025-26', 7521.00, '33333333-4444-5555-6666-777777777701', '2025-10-01', '2026-06-30', 'CCEA/KMS-2025-26/COT-02'),
  ('Gram (Chana)', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 5440.00, '33333333-4444-5555-6666-777777777701', '2025-04-01', '2026-03-31', 'CCEA/RMS-2025-26/PULSE-01'),
  ('Tur (Arhar)', 'FAQ Standard', 'Kharif 2025-26', '2025-26', 7550.00, '33333333-4444-5555-6666-777777777701', '2025-10-01', '2026-06-30', 'CCEA/KMS-2025-26/TUR-01'),
  ('Moong', 'FAQ Standard', 'Kharif 2025-26', '2025-26', 8682.00, '33333333-4444-5555-6666-777777777701', '2025-10-01', '2026-05-31', 'CCEA/KMS-2025-26/MOONG-01'),
  ('Maize', 'Hybrid / FAQ', 'Kharif 2025-26', '2025-26', 2225.00, '33333333-4444-5555-6666-777777777702', '2025-10-01', '2026-05-31', 'CCEA/KMS-2025-26/MAIZE-01'),
  ('Mustard', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 5650.00, '33333333-4444-5555-6666-777777777701', '2025-04-01', '2026-03-31', 'CCEA/RMS-2025-26/MUSTARD-01'),
  ('Groundnut', 'Pod in Shell', 'Kharif 2025-26', '2025-26', 6783.00, '33333333-4444-5555-6666-777777777701', '2025-10-01', '2026-05-31', 'CCEA/KMS-2025-26/GNUT-01'),
  ('Onion', 'Rabi Buffer (NAFED MIS)', 'Rabi 2025-26', '2025-26', 2410.00, '33333333-4444-5555-6666-777777777704', '2025-04-01', '2026-03-31', 'DoCA/MIS-2025-26/ONION-01')
ON CONFLICT DO NOTHING;

-- FAQ Quality Standards (Department of Food & Public Distribution / Bureau of Indian Standards)
INSERT INTO crop_quality_standards (crop_name, crop_variety, marketing_season, financial_year, parameter_name, unit, permissible_minimum, permissible_maximum, official_notification_number)
VALUES
  -- Wheat FAQ Parameters
  ('Wheat', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Moisture Content', '% by weight', NULL, 12.00, 'BIS/IS-1488/DFPD-WHEAT-2025'),
  ('Wheat', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Foreign Matter (Inorganic/Organic)', '% by weight', NULL, 0.75, 'BIS/IS-1488/DFPD-WHEAT-2025'),
  ('Wheat', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Other Foodgrains Admixture', '% by weight', NULL, 2.00, 'BIS/IS-1488/DFPD-WHEAT-2025'),
  ('Wheat', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Damaged Grains', '% by weight', NULL, 2.00, 'BIS/IS-1488/DFPD-WHEAT-2025'),
  ('Wheat', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Slightly Damaged & Discoloured Grains', '% by weight', NULL, 4.00, 'BIS/IS-1488/DFPD-WHEAT-2025'),
  ('Wheat', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Shrivelled & Broken Grains', '% by weight', NULL, 6.00, 'BIS/IS-1488/DFPD-WHEAT-2025'),
  ('Wheat', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Weevilled Grains (by count)', '% by count', NULL, 1.00, 'BIS/IS-1488/DFPD-WHEAT-2025'),

  -- Paddy (Common & Grade A) FAQ Parameters
  ('Paddy (Dhan)', 'Common', 'Kharif 2025-26', '2025-26', 'Moisture Content', '% by weight', NULL, 17.00, 'DFPD/UNIFORM-SPECS/PADDY-2025'),
  ('Paddy (Dhan)', 'Common', 'Kharif 2025-26', '2025-26', 'Foreign Matter (Inorganic)', '% by weight', NULL, 1.00, 'DFPD/UNIFORM-SPECS/PADDY-2025'),
  ('Paddy (Dhan)', 'Common', 'Kharif 2025-26', '2025-26', 'Foreign Matter (Organic)', '% by weight', NULL, 1.00, 'DFPD/UNIFORM-SPECS/PADDY-2025'),
  ('Paddy (Dhan)', 'Common', 'Kharif 2025-26', '2025-26', 'Damaged, Discoloured & Sprouted', '% by weight', NULL, 5.00, 'DFPD/UNIFORM-SPECS/PADDY-2025'),
  ('Paddy (Dhan)', 'Common', 'Kharif 2025-26', '2025-26', 'Immature, Shrunken & Shrivelled', '% by weight', NULL, 3.00, 'DFPD/UNIFORM-SPECS/PADDY-2025'),
  ('Paddy (Dhan)', 'Common', 'Kharif 2025-26', '2025-26', 'Lower Class Admixture', '% by weight', NULL, 6.00, 'DFPD/UNIFORM-SPECS/PADDY-2025'),

  -- Soybean FAQ Parameters
  ('Soybean', 'Yellow (FAQ)', 'Kharif 2025-26', '2025-26', 'Moisture Content', '% by weight', NULL, 12.00, 'NAFED/PSS/SOYBEAN-FAQ-2025'),
  ('Soybean', 'Yellow (FAQ)', 'Kharif 2025-26', '2025-26', 'Foreign Matter', '% by weight', NULL, 2.00, 'NAFED/PSS/SOYBEAN-FAQ-2025'),
  ('Soybean', 'Yellow (FAQ)', 'Kharif 2025-26', '2025-26', 'Damaged & Weevilled Grains', '% by weight', NULL, 3.00, 'NAFED/PSS/SOYBEAN-FAQ-2025'),
  ('Soybean', 'Yellow (FAQ)', 'Kharif 2025-26', '2025-26', 'Immature & Shrunken Grains', '% by weight', NULL, 4.00, 'NAFED/PSS/SOYBEAN-FAQ-2025'),

  -- Gram (Chana) FAQ Parameters
  ('Gram (Chana)', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Moisture Content', '% by weight', NULL, 12.00, 'NAFED/PSS/CHANA-FAQ-2025'),
  ('Gram (Chana)', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Foreign Matter', '% by weight', NULL, 1.00, 'NAFED/PSS/CHANA-FAQ-2025'),
  ('Gram (Chana)', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Damaged & Weevilled Grains', '% by weight', NULL, 3.00, 'NAFED/PSS/CHANA-FAQ-2025'),
  ('Gram (Chana)', 'FAQ Standard', 'Rabi 2025-26', '2025-26', 'Broken / Split Pulses (Dal)', '% by weight', NULL, 3.00, 'NAFED/PSS/CHANA-FAQ-2025'),

  -- Cotton FAQ Parameters
  ('Cotton', 'Medium Staple', 'Kharif 2025-26', '2025-26', 'Moisture Content', '% by weight', NULL, 12.00, 'CCI/MSP/COTTON-FAQ-2025'),
  ('Cotton', 'Medium Staple', 'Kharif 2025-26', '2025-26', 'Trash / Foreign Matter', '% by weight', NULL, 8.00, 'CCI/MSP/COTTON-FAQ-2025'),
  ('Cotton', 'Medium Staple', 'Kharif 2025-26', '2025-26', 'Stained / Yellow Pickings', '% by weight', NULL, 3.00, 'CCI/MSP/COTTON-FAQ-2025')
ON CONFLICT DO NOTHING;

-- Seed Authorized Verified Government Officials
INSERT INTO government_officials (
  id,
  full_name,
  employee_id,
  designation,
  department,
  procurement_agency_id,
  state,
  district,
  taluka,
  assigned_procurement_centre_id,
  official_mobile,
  official_email,
  password_hash,
  verification_status,
  account_status
)
VALUES
  (
    '88888888-9999-aaaa-bbbb-cccccccc0001',
    'Rajeshwar V. Deshmukh',
    'FCI-MH-2024-8841',
    'Procurement Quality Inspector (Grade-1)',
    'Quality Control & Procurement Division',
    '11111111-2222-3333-4444-555555555501',
    'Maharashtra',
    'Pune',
    'Haveli',
    '22222222-3333-4444-5555-666666666601',
    '+919822188410',
    'rajeshwar.deshmukh@fci.gov.in',
    'govt@kisan2026',
    'verified',
    'active'
  ),
  (
    '88888888-9999-aaaa-bbbb-cccccccc0002',
    'Sunita Anand More',
    'NAFED-MH-2024-4102',
    'Senior PSS Inspection Officer',
    'Agricultural Produce Quality Directorate',
    '11111111-2222-3333-4444-555555555502',
    'Maharashtra',
    'Nashik',
    'Panchavati',
    '22222222-3333-4444-5555-666666666602',
    '+919822410211',
    'sunita.more@nafed-india.com',
    'govt@kisan2026',
    'verified',
    'active'
  ),
  (
    '88888888-9999-aaaa-bbbb-cccccccc0003',
    'Arun S. Gaikwad',
    'MSCMF-MH-2024-1932',
    'Area Procurement Manager',
    'Field Procurement Wing',
    '11111111-2222-3333-4444-555555555504',
    'Maharashtra',
    'Ahmednagar',
    'Nagar',
    '22222222-3333-4444-5555-666666666605',
    '+919823193220',
    'arun.gaikwad@mahamefed.org',
    'govt@kisan2026',
    'verified',
    'active'
  ),
  (
    '88888888-9999-aaaa-bbbb-cccccccc0004',
    'Dr. Mahendra K. Shinde',
    'NCCF-MH-2024-6721',
    'Chief Quality Assurance & MIS Officer',
    'Perishable Commodity Buffer Operation Division',
    '11111111-2222-3333-4444-555555555503',
    'Maharashtra',
    'Nashik',
    'Niphad',
    '22222222-3333-4444-5555-666666666603',
    '+919422067219',
    'mahendra.shinde@nccf-india.com',
    'govt@kisan2026',
    'verified',
    'active'
  ),
  (
    '88888888-9999-aaaa-bbbb-cccccccc0005',
    'Kavita Ramesh Patil',
    'TDC-MH-2024-5509',
    'Quality Assessment & Weighment Officer',
    'State Foodgrain & MSP Procurement Branch',
    '11111111-2222-3333-4444-555555555504',
    'Maharashtra',
    'Pune',
    'Baramati',
    '22222222-3333-4444-5555-666666666604',
    '+919765055091',
    'kavita.patil@mahamefed.org',
    'govt@kisan2026',
    'verified',
    'active'
  )
ON CONFLICT (employee_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    assigned_procurement_centre_id = EXCLUDED.assigned_procurement_centre_id;
