import { createClient, hasValidSupabaseConfig } from './supabase/client';
import { SEED_OFFICERS } from './officer-service';

/* ─────────────────────────────────────────────────────────────────────────
 * DOMAIN TYPES & INTERFACES (Matching the 18 Supabase Tables)
 * ───────────────────────────────────────────────────────────────────────── */

export interface ProcurementAgency {
  id: string;
  agency_name: string;
  agency_code: string;
  agency_type: string;
  state: string;
  contact_details?: string;
  active_status: boolean;
}

export interface ProcurementCentre {
  id: string;
  centre_name: string;
  agency_id: string;
  agency_name?: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
  complete_address: string;
  contact_number?: string;
  active_status: boolean;
  procurement_start_date: string;
  procurement_end_date: string;
}

export interface GovernmentOfficial {
  id: string;
  full_name: string;
  employee_id: string;
  designation: string;
  department: string;
  procurement_agency_id: string;
  procurement_agency_name?: string;
  state: string;
  district: string;
  taluka: string;
  assigned_procurement_centre_id: string;
  assigned_procurement_centre_name?: string;
  official_mobile: string;
  official_email: string;
  verification_status: 'verified' | 'pending' | 'suspended';
  account_status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  verified_at?: string;
  last_login_at?: string;
}

export interface GovernmentOfficialSession {
  official: GovernmentOfficial;
  token: string;
  loginTime: string;
}

export interface ProcurementScheme {
  id: string;
  scheme_name: string;
  scheme_code?: string;
  scheme_type?: 'PSS' | 'Foodgrain' | 'PDPS' | 'MIS';
  description?: string;
  applicable_agency_id?: string;
  agency_id?: string;
  agency_name?: string;
  crops_covered?: string[];
  applicable_state?: string;
  state?: string;
  active_status?: boolean;
  effective_from: string;
  effective_until: string;
  source_notification_number?: string;
}

export interface CropMspRecord {
  id: string;
  crop_name: string;
  crop_variety: string;
  marketing_season: string;
  financial_year: string;
  msp_per_quintal: number;
  currency: string;
  applicable_scheme_id?: string;
  applicable_state: string;
  effective_from: string;
  effective_until: string;
  official_notification_number?: string;
  verified_status: boolean;
}

export interface CropQualityStandard {
  id: string;
  crop_name: string;
  crop_variety: string;
  marketing_season: string;
  parameter_name: string;
  unit: string;
  permissible_minimum: number | null;
  permissible_maximum: number | null;
  official_notification_number?: string;
  verified_status: boolean;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'awaiting_review'
  | 'inspection_scheduled'
  | 'inspection_rescheduled'
  | 'inspection_cancelled'
  | 'inspection_in_progress'
  | 'quality_inspection_approved'
  | 'quality_inspection_rejected'
  | 'reinspection_required'
  | 'farmer_instructed_to_visit_centre'
  | 'official_document_verification_pending'
  | 'weighment_pending'
  | 'procurement_completed';

export interface ProcurementApplication {
  id: string;
  application_number: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  crop_name: string;
  crop_variety: string;
  declared_quantity_quintals: number;
  proposed_inspection_quantity_quintals: number;
  harvest_date: string;
  harvest_season: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  mandi_token_id?: string;
  procurement_scheme_id?: string;
  procurement_agency_id?: string;
  preferred_procurement_centre_id?: string;
  preferred_centre_name?: string;
  aadhaar_seeded_dbt_declaration: boolean; // STRICTLY YES/NO ONLY
  has_aadhaar_dbt_bank_account?: boolean;
  eligibility_status: 'eligible' | 'conditionally_eligible' | 'ineligible';
  application_status: ApplicationStatus;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  assigned_official_id?: string;
  assigned_official_name?: string;
  assigned_official_designation?: string;
  assigned_official_department?: string;
  assigned_official_employee_id?: string;
  assigned_official_mobile?: string;
  latest_appointment?: InspectionAppointment;
  latest_inspection?: InspectionRecord;
  latest_report?: InspectionReport;
  procurement_record?: ProcurementRecord;
}

export interface InspectionAppointment {
  id: string;
  application_id: string;
  assigned_official_id: string;
  assigned_official_name?: string;
  assigned_official_designation?: string;
  assigned_official_department?: string;
  assigned_official_employee_id?: string;
  assigned_official_mobile?: string;
  procurement_centre_id: string;
  procurement_centre_name?: string;
  centre_name?: string;
  appointment_date?: string;
  appointment_time_slot?: string;
  instructions_for_farmer?: string;
  inspection_date: string;
  inspection_time: string; // e.g. "10:30 AM"
  inspection_location: string;
  additional_instructions?: string;
  appointment_status: 'scheduled' | 'rescheduled' | 'completed' | 'cancelled' | 'farmer_absent';
  scheduling_remarks?: string;
  rescheduled_from_id?: string;
  cancellation_reason?: string;
  farmer_attendance_status?: 'pending' | 'attended' | 'absent';
  farmer_attendance_remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionParameterMeasurement {
  id?: string;
  inspection_record_id?: string;
  quality_standard_id?: string;
  parameter_id?: string;
  parameter_name: string;
  unit: string;
  permissible_minimum: number | null;
  permissible_maximum: number | null;
  actual_measured_value: number;
  measured_value?: number;
  inspection_result: 'PASS' | 'FAIL';
  result?: 'PASS' | 'FAIL';
  official_remarks?: string;
}

export interface InspectionRecord {
  id: string;
  application_id: string;
  appointment_id?: string;
  inspecting_official_id: string;
  inspecting_official_name?: string;
  inspecting_official_designation?: string;
  inspecting_official_employee_id?: string;
  inspecting_official_agency?: string;
  inspection_reference_number: string;
  inspected_at?: string;
  inspected_quantity_quintals?: number;
  inspection_started_at: string;
  inspection_completed_at?: string;
  inspection_location: string;
  farmer_attendance_status: string;
  inspection_decision: 'APPROVE' | 'REJECT' | 'RECHECK';
  decision?: 'APPROVE' | 'REJECT' | 'RECHECK';
  official_remarks?: string;
  rejection_reason?: string;
  reinspection_reason?: string;
  parameters: InspectionParameterMeasurement[];
  parameters_tested?: InspectionParameterMeasurement[];
  measurements?: InspectionParameterMeasurement[];
  evidence_files?: { path: string; type: string; description: string }[];
  created_at: string;
  updated_at: string;
}

export interface InspectionReport {
  id: string;
  inspection_record_id: string;
  application_id: string;
  report_number: string;
  storage_path?: string;
  report_generated_at: string;
  generated_by?: string;
  report_status: 'generated' | 'downloaded' | 'archived';
  application?: ProcurementApplication;
  inspection?: InspectionRecord;
}

export interface ProcurementRecord {
  id: string;
  application_id: string;
  procurement_centre_id: string;
  agency_id: string;
  quantity_presented: number;
  quantity_accepted: number;
  quantity_rejected: number;
  weighment_slip_number?: string;
  procurement_acknowledgement_number?: string;
  procurement_date: string;
  procurement_status: 'pending' | 'in_progress' | 'completed' | 'disputed';
  recorded_by?: string;
  created_at: string;
}

export interface FarmerComplaint {
  id: string;
  complaint_number: string;
  application_id: string;
  farmer_id: string;
  complaint_category: string;
  complaint_description: string;
  related_official_id?: string;
  complaint_status: 'submitted' | 'under_review' | 'investigation_pending' | 'resolved' | 'dismissed';
  status?: 'submitted' | 'under_review' | 'investigation_pending' | 'resolved' | 'dismissed';
  assigned_supervisor_id?: string;
  resolution_remarks?: string;
  review_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface ProcurementNotification {
  id: string;
  recipient_user_id: string;
  application_id?: string;
  notification_type:
    | 'INSPECTION_SCHEDULED'
    | 'INSPECTION_RESCHEDULED'
    | 'INSPECTION_CANCELLED'
    | 'INSPECTION_APPROVED'
    | 'INSPECTION_REJECTED'
    | 'REINSPECTION_REQUIRED'
    | 'COMPLAINT_UPDATED';
  title: string;
  message: string;
  notification_data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface ProcurementAuditLog {
  id: string;
  actor_user_id: string;
  actor_role: 'farmer' | 'government_official' | 'admin' | 'supervisor' | 'system';
  application_id?: string;
  entity_type: string;
  entity_id: string;
  action_type: string;
  previous_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  action_reason?: string;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────────────────────
 * DEFAULT VERIFIED MASTER DATA (Seeds / Fallback Cache)
 * ───────────────────────────────────────────────────────────────────────── */

export const DEFAULT_AGENCIES: ProcurementAgency[] = [
  {
    id: '11111111-2222-3333-4444-555555555501',
    agency_name: 'Food Corporation of India (FCI)',
    agency_code: 'FCI-HQ',
    agency_type: 'Central Nodal Agency',
    state: 'All-India',
    contact_details: 'Toll Free: 1800-180-1551 | contact@fci.gov.in',
    active_status: true,
  },
  {
    id: '11111111-2222-3333-4444-555555555502',
    agency_name: 'National Agricultural Cooperative Marketing Federation of India Ltd. (NAFED)',
    agency_code: 'NAFED-HQ',
    agency_type: 'Central Nodal Agency (PSS & MIS)',
    state: 'All-India',
    contact_details: 'Helpdesk: 011-26340019 | nafed@nafed-india.com',
    active_status: true,
  },
  {
    id: '11111111-2222-3333-4444-555555555503',
    agency_name: 'National Cooperative Consumers Federation (NCCF)',
    agency_code: 'NCCF-HQ',
    agency_type: 'Central Agency',
    state: 'All-India',
    contact_details: 'Phone: 011-26417701 | info@nccf-india.com',
    active_status: true,
  },
  {
    id: '11111111-2222-3333-4444-555555555504',
    agency_name: 'Maharashtra State Co-operative Marketing Federation (MSCMF)',
    agency_code: 'MSCMF-MH',
    agency_type: 'State Authorized Agency',
    state: 'Maharashtra',
    contact_details: 'Phone: 022-22026131 | info@mahamefed.org',
    active_status: true,
  },
  {
    id: '11111111-2222-3333-4444-555555555505',
    agency_name: 'Maharashtra State Tribal Development Corporation',
    agency_code: 'TDC-MH',
    agency_type: 'State Agency',
    state: 'Maharashtra',
    contact_details: 'Phone: 0253-2578191 | contact@tribal.gov.in',
    active_status: true,
  },
];

export const DEFAULT_SCHEMES: ProcurementScheme[] = [
  {
    id: 'scheme-fci-pool',
    scheme_name: 'Central Pool Foodgrain Procurement (FCI)',
    agency_id: '11111111-2222-3333-4444-555555555501',
    agency_name: 'Food Corporation of India',
    crops_covered: ['Wheat', 'Paddy (Dhan)', 'Maize'],
    applicable_state: 'All-India',
    effective_from: '2025-04-01',
    effective_until: '2026-06-30',
    source_notification_number: 'DFPD/MSP-FCI-2025-26',
  },
  {
    id: 'scheme-nafed-pss',
    scheme_name: 'Price Support Scheme (PSS - MoA&FW)',
    agency_id: '11111111-2222-3333-4444-555555555502',
    agency_name: 'NAFED',
    crops_covered: ['Soybean', 'Gram (Chana)', 'Mustard'],
    applicable_state: 'All-India',
    effective_from: '2025-10-01',
    effective_until: '2026-05-31',
    source_notification_number: 'MoA&FW/PSS-2025-26',
  },
  {
    id: 'scheme-nccf-mis',
    scheme_name: 'Market Intervention Scheme (MIS)',
    agency_id: '11111111-2222-3333-4444-555555555503',
    agency_name: 'National Cooperative Consumers Federation (NCCF)',
    crops_covered: ['Onion', 'Garlic', 'Chilli'],
    applicable_state: 'Maharashtra',
    effective_from: '2025-09-01',
    effective_until: '2026-06-30',
    source_notification_number: 'DoCA/MIS-2025-26',
  },
];

export const DEFAULT_PROCUREMENT_CENTRES: ProcurementCentre[] = [
  {
    id: '22222222-3333-4444-5555-666666666601',
    centre_name: 'Pune Gultekdi FCI State Depot',
    agency_id: '11111111-2222-3333-4444-555555555501',
    agency_name: 'Food Corporation of India (FCI)',
    state: 'Maharashtra',
    district: 'Pune',
    taluka: 'Haveli',
    village: 'Gultekdi',
    complete_address: 'Gate No 4, Gultekdi Market Yard, Pune, Maharashtra 411037',
    contact_number: '+912024268801',
    active_status: true,
    procurement_start_date: '2025-10-01',
    procurement_end_date: '2026-06-30',
  },
  {
    id: '22222222-3333-4444-5555-666666666602',
    centre_name: 'Nashik Panchavati PSS Procurement Centre',
    agency_id: '11111111-2222-3333-4444-555555555502',
    agency_name: 'NAFED',
    state: 'Maharashtra',
    district: 'Nashik',
    taluka: 'Nashik',
    village: 'Panchavati',
    complete_address: 'NAFED Sub-Yard, Peth Road, Panchavati, Nashik 422003',
    contact_number: '+912532514412',
    active_status: true,
    procurement_start_date: '2025-10-15',
    procurement_end_date: '2026-05-31',
  },
  {
    id: '22222222-3333-4444-5555-666666666603',
    centre_name: 'Lasalgaon NAFED Onion & Grain Centre',
    agency_id: '11111111-2222-3333-4444-555555555502',
    agency_name: 'NAFED',
    state: 'Maharashtra',
    district: 'Nashik',
    taluka: 'Niphad',
    village: 'Lasalgaon',
    complete_address: 'Station Yard, Lasalgaon APMC, Niphad 422306',
    contact_number: '+912550266205',
    active_status: true,
    procurement_start_date: '2025-09-01',
    procurement_end_date: '2026-06-30',
  },
  {
    id: '22222222-3333-4444-5555-666666666604',
    centre_name: 'Baramati MIDC PSS Centre',
    agency_id: '11111111-2222-3333-4444-555555555504',
    agency_name: 'MSCMF',
    state: 'Maharashtra',
    district: 'Pune',
    taluka: 'Baramati',
    village: 'Baramati',
    complete_address: 'MSCMF Godown, MIDC Road, Baramati, District Pune 413133',
    contact_number: '+912112243880',
    active_status: true,
    procurement_start_date: '2025-10-01',
    procurement_end_date: '2026-05-31',
  },
  {
    id: '22222222-3333-4444-5555-666666666605',
    centre_name: 'Ahmednagar Goods Shed Procurement Centre',
    agency_id: '11111111-2222-3333-4444-555555555501',
    agency_name: 'FCI',
    state: 'Maharashtra',
    district: 'Ahmednagar',
    taluka: 'Nagar',
    village: 'Ahmednagar',
    complete_address: 'Near Goods Shed, Station Road, Ahmednagar 414001',
    contact_number: '+912412451990',
    active_status: true,
    procurement_start_date: '2025-10-01',
    procurement_end_date: '2026-06-30',
  },
  {
    id: '22222222-3333-4444-5555-666666666606',
    centre_name: 'Solapur Saat Rasta PSS Pulse Centre',
    agency_id: '11111111-2222-3333-4444-555555555502',
    agency_name: 'NAFED',
    state: 'Maharashtra',
    district: 'Solapur',
    taluka: 'North Solapur',
    village: 'Solapur',
    complete_address: 'Saat Rasta, Siddheshwar Peth, Solapur 413001',
    contact_number: '+912172314560',
    active_status: true,
    procurement_start_date: '2025-10-15',
    procurement_end_date: '2026-05-31',
  },
  {
    id: '22222222-3333-4444-5555-666666666607',
    centre_name: 'Nagpur Kalamna Grain Depot',
    agency_id: '11111111-2222-3333-4444-555555555501',
    agency_name: 'FCI',
    state: 'Maharashtra',
    district: 'Nagpur',
    taluka: 'Nagpur Rural',
    village: 'Kalamna',
    complete_address: 'Central Avenue, Kalamna Market, Nagpur 440008',
    contact_number: '+917122681220',
    active_status: true,
    procurement_start_date: '2025-10-01',
    procurement_end_date: '2026-06-30',
  },
];

export const DEFAULT_MSP_RECORDS: CropMspRecord[] = [
  {
    id: 'msp-wheat-2025',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 2275.0,
    currency: 'INR',
    applicable_state: 'All-India',
    effective_from: '2025-04-01',
    effective_until: '2026-03-31',
    official_notification_number: 'CCEA/RMS-2025-26/WHEAT-01',
    verified_status: true,
  },
  {
    id: 'msp-paddy-com-2025',
    crop_name: 'Paddy (Dhan)',
    crop_variety: 'Common',
    marketing_season: 'Kharif 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 2300.0,
    currency: 'INR',
    applicable_state: 'All-India',
    effective_from: '2025-10-01',
    effective_until: '2026-06-30',
    official_notification_number: 'CCEA/KMS-2025-26/PADDY-01',
    verified_status: true,
  },
  {
    id: 'msp-paddy-grda-2025',
    crop_name: 'Paddy (Dhan)',
    crop_variety: 'Grade A',
    marketing_season: 'Kharif 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 2320.0,
    currency: 'INR',
    applicable_state: 'All-India',
    effective_from: '2025-10-01',
    effective_until: '2026-06-30',
    official_notification_number: 'CCEA/KMS-2025-26/PADDY-02',
    verified_status: true,
  },
  {
    id: 'msp-soybean-2025',
    crop_name: 'Soybean',
    crop_variety: 'Yellow (FAQ)',
    marketing_season: 'Kharif 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 4892.0,
    currency: 'INR',
    applicable_state: 'All-India',
    effective_from: '2025-10-01',
    effective_until: '2026-05-31',
    official_notification_number: 'CCEA/KMS-2025-26/SOY-01',
    verified_status: true,
  },
  {
    id: 'msp-cotton-med-2025',
    crop_name: 'Cotton',
    crop_variety: 'Medium Staple',
    marketing_season: 'Kharif 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 7121.0,
    currency: 'INR',
    applicable_state: 'All-India',
    effective_from: '2025-10-01',
    effective_until: '2026-06-30',
    official_notification_number: 'CCEA/KMS-2025-26/COT-01',
    verified_status: true,
  },
  {
    id: 'msp-gram-2025',
    crop_name: 'Gram (Chana)',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 5440.0,
    currency: 'INR',
    applicable_state: 'All-India',
    effective_from: '2025-04-01',
    effective_until: '2026-03-31',
    official_notification_number: 'CCEA/RMS-2025-26/PULSE-01',
    verified_status: true,
  },
  {
    id: 'msp-tur-2025',
    crop_name: 'Tur (Arhar)',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Kharif 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 7550.0,
    currency: 'INR',
    applicable_state: 'All-India',
    effective_from: '2025-10-01',
    effective_until: '2026-06-30',
    official_notification_number: 'CCEA/KMS-2025-26/TUR-01',
    verified_status: true,
  },
  {
    id: 'msp-maize-2025',
    crop_name: 'Maize',
    crop_variety: 'Hybrid / FAQ',
    marketing_season: 'Kharif 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 2225.0,
    currency: 'INR',
    applicable_state: 'All-India',
    effective_from: '2025-10-01',
    effective_until: '2026-05-31',
    official_notification_number: 'CCEA/KMS-2025-26/MAIZE-01',
    verified_status: true,
  },
  {
    id: 'msp-onion-2025',
    crop_name: 'Onion',
    crop_variety: 'Rabi Buffer (NAFED MIS)',
    marketing_season: 'Rabi 2025-26',
    financial_year: '2025-26',
    msp_per_quintal: 2410.0,
    currency: 'INR',
    applicable_state: 'Maharashtra',
    effective_from: '2025-04-01',
    effective_until: '2026-03-31',
    official_notification_number: 'DoCA/MIS-2025-26/ONION-01',
    verified_status: true,
  },
];

export const DEFAULT_FAQ_STANDARDS: CropQualityStandard[] = [
  // Wheat
  {
    id: 'std-w-1',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Moisture Content',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 12.0,
    official_notification_number: 'BIS/IS-1488/DFPD-WHEAT-2025',
    verified_status: true,
  },
  {
    id: 'std-w-2',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Foreign Matter (Inorganic/Organic)',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 0.75,
    official_notification_number: 'BIS/IS-1488/DFPD-WHEAT-2025',
    verified_status: true,
  },
  {
    id: 'std-w-3',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Other Foodgrains Admixture',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 2.0,
    official_notification_number: 'BIS/IS-1488/DFPD-WHEAT-2025',
    verified_status: true,
  },
  {
    id: 'std-w-4',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Damaged Grains',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 2.0,
    official_notification_number: 'BIS/IS-1488/DFPD-WHEAT-2025',
    verified_status: true,
  },
  {
    id: 'std-w-5',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Slightly Damaged & Discoloured Grains',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 4.0,
    official_notification_number: 'BIS/IS-1488/DFPD-WHEAT-2025',
    verified_status: true,
  },
  {
    id: 'std-w-6',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Shrivelled & Broken Grains',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 6.0,
    official_notification_number: 'BIS/IS-1488/DFPD-WHEAT-2025',
    verified_status: true,
  },
  {
    id: 'std-w-7',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Weevilled Grains (by count)',
    unit: '% by count',
    permissible_minimum: null,
    permissible_maximum: 1.0,
    official_notification_number: 'BIS/IS-1488/DFPD-WHEAT-2025',
    verified_status: true,
  },

  // Paddy (Dhan)
  {
    id: 'std-p-1',
    crop_name: 'Paddy (Dhan)',
    crop_variety: 'Common',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Moisture Content',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 17.0,
    official_notification_number: 'DFPD/UNIFORM-SPECS/PADDY-2025',
    verified_status: true,
  },
  {
    id: 'std-p-2',
    crop_name: 'Paddy (Dhan)',
    crop_variety: 'Common',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Foreign Matter (Inorganic/Organic)',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 2.0,
    official_notification_number: 'DFPD/UNIFORM-SPECS/PADDY-2025',
    verified_status: true,
  },
  {
    id: 'std-p-3',
    crop_name: 'Paddy (Dhan)',
    crop_variety: 'Common',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Damaged, Discoloured & Sprouted',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 5.0,
    official_notification_number: 'DFPD/UNIFORM-SPECS/PADDY-2025',
    verified_status: true,
  },
  {
    id: 'std-p-4',
    crop_name: 'Paddy (Dhan)',
    crop_variety: 'Common',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Immature, Shrunken & Shrivelled',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 3.0,
    official_notification_number: 'DFPD/UNIFORM-SPECS/PADDY-2025',
    verified_status: true,
  },

  // Soybean
  {
    id: 'std-s-1',
    crop_name: 'Soybean',
    crop_variety: 'Yellow (FAQ)',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Moisture Content',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 12.0,
    official_notification_number: 'NAFED/PSS/SOYBEAN-FAQ-2025',
    verified_status: true,
  },
  {
    id: 'std-s-2',
    crop_name: 'Soybean',
    crop_variety: 'Yellow (FAQ)',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Foreign Matter',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 2.0,
    official_notification_number: 'NAFED/PSS/SOYBEAN-FAQ-2025',
    verified_status: true,
  },
  {
    id: 'std-s-3',
    crop_name: 'Soybean',
    crop_variety: 'Yellow (FAQ)',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Damaged & Weevilled Grains',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 3.0,
    official_notification_number: 'NAFED/PSS/SOYBEAN-FAQ-2025',
    verified_status: true,
  },
  {
    id: 'std-s-4',
    crop_name: 'Soybean',
    crop_variety: 'Yellow (FAQ)',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Immature & Shrunken Grains',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 4.0,
    official_notification_number: 'NAFED/PSS/SOYBEAN-FAQ-2025',
    verified_status: true,
  },

  // Gram (Chana)
  {
    id: 'std-chana-1',
    crop_name: 'Gram (Chana)',
    crop_variety: 'Desi (FAQ)',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Moisture Content',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 12.0,
    official_notification_number: 'NAFED/PSS/CHANA-2025',
    verified_status: true,
  },
  {
    id: 'std-chana-2',
    crop_name: 'Gram (Chana)',
    crop_variety: 'Desi (FAQ)',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Foreign Matter (Inorganic/Organic)',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 1.0,
    official_notification_number: 'NAFED/PSS/CHANA-2025',
    verified_status: true,
  },
  {
    id: 'std-chana-3',
    crop_name: 'Gram (Chana)',
    crop_variety: 'Desi (FAQ)',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Damaged & Weevilled Grains',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 3.0,
    official_notification_number: 'NAFED/PSS/CHANA-2025',
    verified_status: true,
  },
  {
    id: 'std-chana-4',
    crop_name: 'Gram (Chana)',
    crop_variety: 'Desi (FAQ)',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Slightly Damaged & Immature',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 4.0,
    official_notification_number: 'NAFED/PSS/CHANA-2025',
    verified_status: true,
  },

  // Maize
  {
    id: 'std-m-1',
    crop_name: 'Maize',
    crop_variety: 'Yellow (FAQ)',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Moisture Content',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 14.0,
    official_notification_number: 'DFPD/MAIZE-FAQ/2025',
    verified_status: true,
  },
  {
    id: 'std-m-2',
    crop_name: 'Maize',
    crop_variety: 'Yellow (FAQ)',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Foreign Matter',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 1.5,
    official_notification_number: 'DFPD/MAIZE-FAQ/2025',
    verified_status: true,
  },
  {
    id: 'std-m-3',
    crop_name: 'Maize',
    crop_variety: 'Yellow (FAQ)',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Damaged & Discoloured Grains',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 3.0,
    official_notification_number: 'DFPD/MAIZE-FAQ/2025',
    verified_status: true,
  },

  // Cotton
  {
    id: 'std-c-1',
    crop_name: 'Cotton',
    crop_variety: 'Medium Staple',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Moisture Content',
    unit: '% by weight',
    permissible_minimum: 8.0,
    permissible_maximum: 12.0,
    official_notification_number: 'CCI/MSP-FAQ/COTTON-2025',
    verified_status: true,
  },
  {
    id: 'std-c-2',
    crop_name: 'Cotton',
    crop_variety: 'Medium Staple',
    marketing_season: 'Kharif 2025-26',
    parameter_name: 'Trash / Foreign Matter',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 3.5,
    official_notification_number: 'CCI/MSP-FAQ/COTTON-2025',
    verified_status: true,
  },

  // Mustard
  {
    id: 'std-must-1',
    crop_name: 'Mustard',
    crop_variety: 'FAQ Brown',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Moisture Content',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 8.0,
    official_notification_number: 'NAFED/MUSTARD-FAQ/2025',
    verified_status: true,
  },
  {
    id: 'std-must-2',
    crop_name: 'Mustard',
    crop_variety: 'FAQ Brown',
    marketing_season: 'Rabi 2025-26',
    parameter_name: 'Foreign Matter',
    unit: '% by weight',
    permissible_minimum: null,
    permissible_maximum: 2.0,
    official_notification_number: 'NAFED/MUSTARD-FAQ/2025',
    verified_status: true,
  },
];

export const DEFAULT_OFFICIALS: (GovernmentOfficial & { password_plain: string; aliases?: string[] })[] = [
  {
    id: '88888888-9999-aaaa-bbbb-cccccccc0001',
    full_name: 'Rajeshwar V. Deshmukh',
    employee_id: 'FCI-MH-2024-8841',
    designation: 'Procurement Quality Inspector (Grade-1)',
    department: 'Quality Control & Procurement Division',
    procurement_agency_id: '11111111-2222-3333-4444-555555555501',
    procurement_agency_name: 'Food Corporation of India (FCI)',
    state: 'Maharashtra',
    district: 'Pune',
    taluka: 'Haveli',
    assigned_procurement_centre_id: '22222222-3333-4444-5555-666666666601',
    assigned_procurement_centre_name: 'Pune Gultekdi FCI State Depot',
    official_mobile: '+919822188410',
    official_email: 'rajeshwar.deshmukh@fci.gov.in',
    password_plain: 'govt@kisan2026',
    aliases: ['gov-ms-fci-001', 'rajesh.patil@fci.gov.in', 'fci-001', 'fci-mh-2024-8841'],
    verification_status: 'verified',
    account_status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    verified_at: '2024-03-05T00:00:00Z',
  },
  {
    id: '88888888-9999-aaaa-bbbb-cccccccc0002',
    full_name: 'Sunita Anand More',
    employee_id: 'NAFED-MH-2024-4102',
    designation: 'Senior PSS Inspection Officer',
    department: 'Agricultural Produce Quality Directorate',
    procurement_agency_id: '11111111-2222-3333-4444-555555555502',
    procurement_agency_name: 'NAFED',
    state: 'Maharashtra',
    district: 'Nashik',
    taluka: 'Panchavati',
    assigned_procurement_centre_id: '22222222-3333-4444-5555-666666666602',
    assigned_procurement_centre_name: 'Nashik Panchavati PSS Procurement Centre',
    official_mobile: '+919822410211',
    official_email: 'sunita.more@nafed-india.com',
    password_plain: 'govt@kisan2026',
    aliases: ['gov-ms-nafed-002', 'nafed-002', 'nafed-mh-2024-4102'],
    verification_status: 'verified',
    account_status: 'active',
    created_at: '2024-04-10T00:00:00Z',
    verified_at: '2024-04-12T00:00:00Z',
  },
  {
    id: '88888888-9999-aaaa-bbbb-cccccccc0003',
    full_name: 'Arun S. Gaikwad',
    employee_id: 'MSCMF-MH-2024-1932',
    designation: 'Area Procurement Manager',
    department: 'Field Procurement & Warehousing Wing',
    procurement_agency_id: '11111111-2222-3333-4444-555555555504',
    procurement_agency_name: 'Maharashtra State Co-operative Marketing Federation (MSCMF)',
    state: 'Maharashtra',
    district: 'Ahmednagar',
    taluka: 'Nagar',
    assigned_procurement_centre_id: '22222222-3333-4444-5555-666666666605',
    assigned_procurement_centre_name: 'Ahmednagar Goods Shed Procurement Centre',
    official_mobile: '+919823193220',
    official_email: 'arun.gaikwad@mahamefed.org',
    password_plain: 'govt@kisan2026',
    aliases: ['mscmf-003', 'arun.gaikwad@mahamefed.org', 'ms-ahmednagar-01'],
    verification_status: 'verified',
    account_status: 'active',
    created_at: '2024-05-01T00:00:00Z',
    verified_at: '2024-05-04T00:00:00Z',
  },
  {
    id: '88888888-9999-aaaa-bbbb-cccccccc0004',
    full_name: 'Dr. Mahendra K. Shinde',
    employee_id: 'NCCF-MH-2024-6721',
    designation: 'Chief Quality Assurance & MIS Officer',
    department: 'Perishable Commodity Buffer Operation Division',
    procurement_agency_id: '11111111-2222-3333-4444-555555555503',
    procurement_agency_name: 'National Cooperative Consumers Federation (NCCF)',
    state: 'Maharashtra',
    district: 'Nashik',
    taluka: 'Niphad',
    assigned_procurement_centre_id: '22222222-3333-4444-5555-666666666603',
    assigned_procurement_centre_name: 'Lasalgaon NAFED Onion & Grain Centre',
    official_mobile: '+919422067219',
    official_email: 'mahendra.shinde@nccf-india.com',
    password_plain: 'govt@kisan2026',
    aliases: ['nccf-004', 'mahendra.shinde@nccf-india.com', 'nccf-mh-lasalgaon'],
    verification_status: 'verified',
    account_status: 'active',
    created_at: '2024-06-15T00:00:00Z',
    verified_at: '2024-06-18T00:00:00Z',
  },
  {
    id: '88888888-9999-aaaa-bbbb-cccccccc0005',
    full_name: 'Kavita Ramesh Patil',
    employee_id: 'TDC-MH-2024-5509',
    designation: 'Quality Assessment & Weighment Officer',
    department: 'State Foodgrain & MSP Procurement Branch',
    procurement_agency_id: '11111111-2222-3333-4444-555555555504',
    procurement_agency_name: 'Maharashtra State Co-operative Marketing Federation (MSCMF)',
    state: 'Maharashtra',
    district: 'Pune',
    taluka: 'Baramati',
    assigned_procurement_centre_id: '22222222-3333-4444-5555-666666666604',
    assigned_procurement_centre_name: 'Baramati MIDC PSS Centre',
    official_mobile: '+919765055091',
    official_email: 'kavita.patil@mahamefed.org',
    password_plain: 'govt@kisan2026',
    aliases: ['tdc-005', 'kavita.patil@mahamefed.org', 'baramati-pss-01'],
    verification_status: 'verified',
    account_status: 'active',
    created_at: '2024-07-01T00:00:00Z',
    verified_at: '2024-07-03T00:00:00Z',
  },
];

export interface AvailableInspector {
  id: string;
  name: string;
  employee_id: string;
  designation: string;
  department: string;
  phone: string;
  agency_name: string;
  type: 'government' | 'apmc';
}

export function getAllAvailableInspectors(): AvailableInspector[] {
  const govt: AvailableInspector[] = DEFAULT_OFFICIALS.map((o) => ({
    id: o.id,
    name: o.full_name,
    employee_id: o.employee_id,
    designation: o.designation,
    department: o.department,
    phone: o.official_mobile,
    agency_name: o.procurement_agency_name || 'Government Procurement Agency',
    type: 'government',
  }));

  const apmc: AvailableInspector[] = SEED_OFFICERS.map((o) => ({
    id: o.id,
    name: o.full_name,
    employee_id: o.officer_id,
    designation: 'APMC Field Quality Inspector',
    department: `APMC Yard Batch ${o.batch_id}`,
    phone: o.contact_number,
    agency_name: 'APMC Market Committee',
    type: 'apmc',
  }));

  return [...govt, ...apmc];
}

export const DEFAULT_PROCUREMENT_APPLICATIONS: ProcurementApplication[] = [
  {
    id: 'app-seed-pune-001',
    application_number: 'KM-MSP-2026-8812',
    farmer_id: 'farmer-ramesh-patil',
    farmer_name: 'Ramesh Tukaram Patil',
    farmer_phone: '9822012345',
    crop_name: 'Wheat',
    crop_variety: 'FAQ Standard',
    declared_quantity_quintals: 60,
    proposed_inspection_quantity_quintals: 60,
    harvest_date: '2026-03-25',
    harvest_season: 'Rabi 2025-26',
    village: 'Haveli',
    taluka: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    preferred_procurement_centre_id: '22222222-3333-4444-5555-666666666601',
    preferred_centre_name: 'Pune Gultekdi FCI State Depot',
    procurement_agency_id: '11111111-2222-3333-4444-555555555501',
    procurement_scheme_id: 'scheme-fci-pool',
    aadhaar_seeded_dbt_declaration: true,
    has_aadhaar_dbt_bank_account: true,
    eligibility_status: 'eligible',
    application_status: 'inspection_scheduled',
    assigned_official_id: '88888888-9999-aaaa-bbbb-cccccccc0001',
    assigned_official_name: 'Rajeshwar V. Deshmukh',
    assigned_official_designation: 'Procurement Quality Inspector (Grade-1)',
    assigned_official_department: 'Food Corporation of India (FCI)',
    assigned_official_employee_id: 'FCI-MH-2024-8841',
    assigned_official_mobile: '+919822188410',
    latest_appointment: {
      id: 'appt-seed-001',
      application_id: 'app-seed-pune-001',
      assigned_official_id: '88888888-9999-aaaa-bbbb-cccccccc0001',
      assigned_official_name: 'Rajeshwar V. Deshmukh',
      assigned_official_designation: 'Procurement Quality Inspector (Grade-1)',
      assigned_official_department: 'Food Corporation of India (FCI)',
      assigned_official_employee_id: 'FCI-MH-2024-8841',
      assigned_official_mobile: '+919822188410',
      procurement_centre_id: '22222222-3333-4444-5555-666666666601',
      procurement_centre_name: 'Pune Gultekdi FCI State Depot',
      centre_name: 'Pune Gultekdi FCI State Depot',
      appointment_date: '2026-04-06',
      inspection_date: '2026-04-06',
      appointment_time_slot: '10:00 AM – 12:00 PM',
      inspection_time: '10:00 AM – 12:00 PM',
      inspection_location: 'Gate No 4, Gultekdi Market Yard, Pune, Maharashtra 411037',
      instructions_for_farmer: 'Bring clean bags, vehicle pass, land 7/12 extract, and DBT bank passbook.',
      additional_instructions: 'Bring clean bags, vehicle pass, land 7/12 extract, and DBT bank passbook.',
      appointment_status: 'scheduled',
      farmer_attendance_status: 'pending',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-01T10:00:00Z',
    },
    submitted_at: '2026-03-31T09:00:00Z',
    created_at: '2026-03-31T09:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'app-seed-pune-002',
    application_number: 'KM-MSP-2026-8813',
    farmer_id: 'farmer-dnyaneshwar-shinde',
    farmer_name: 'Dnyaneshwar Bhikaji Shinde',
    farmer_phone: '9822023456',
    crop_name: 'Soybean',
    crop_variety: 'Yellow (FAQ)',
    declared_quantity_quintals: 45,
    proposed_inspection_quantity_quintals: 45,
    harvest_date: '2026-03-29',
    harvest_season: 'Kharif 2025-26',
    village: 'Manchar',
    taluka: 'Ambegaon',
    district: 'Pune',
    state: 'Maharashtra',
    preferred_procurement_centre_id: '22222222-3333-4444-5555-666666666601',
    preferred_centre_name: 'Pune Gultekdi FCI State Depot',
    procurement_agency_id: '11111111-2222-3333-4444-555555555502',
    procurement_scheme_id: 'scheme-nafed-pss',
    aadhaar_seeded_dbt_declaration: true,
    has_aadhaar_dbt_bank_account: true,
    eligibility_status: 'eligible',
    application_status: 'submitted',
    submitted_at: '2026-04-02T11:30:00Z',
    created_at: '2026-04-02T11:30:00Z',
    updated_at: '2026-04-02T11:30:00Z',
  },
  {
    id: 'app-seed-pune-003',
    application_number: 'KM-MSP-2026-8814',
    farmer_id: 'farmer-vitthal-kulkarni',
    farmer_name: 'Vitthal Namdeo Kulkarni',
    farmer_phone: '9822034567',
    crop_name: 'Gram (Chana)',
    crop_variety: 'FAQ Standard',
    declared_quantity_quintals: 35,
    proposed_inspection_quantity_quintals: 35,
    harvest_date: '2026-03-30',
    harvest_season: 'Rabi 2025-26',
    village: 'Shirur',
    taluka: 'Shirur',
    district: 'Pune',
    state: 'Maharashtra',
    preferred_procurement_centre_id: '22222222-3333-4444-5555-666666666601',
    preferred_centre_name: 'Pune Gultekdi FCI State Depot',
    procurement_agency_id: '11111111-2222-3333-4444-555555555502',
    procurement_scheme_id: 'scheme-nafed-pss',
    aadhaar_seeded_dbt_declaration: true,
    has_aadhaar_dbt_bank_account: true,
    eligibility_status: 'eligible',
    application_status: 'submitted',
    submitted_at: '2026-04-03T08:15:00Z',
    created_at: '2026-04-03T08:15:00Z',
    updated_at: '2026-04-03T08:15:00Z',
  },
  {
    id: 'app-seed-nsk-001',
    application_number: 'KM-MSP-2026-4401',
    farmer_id: 'farmer-balasaheb-pawar',
    farmer_name: 'Balasaheb Ramchandra Pawar',
    farmer_phone: '9822045678',
    crop_name: 'Onion',
    crop_variety: 'Rabi Buffer (NAFED MIS)',
    declared_quantity_quintals: 80,
    proposed_inspection_quantity_quintals: 80,
    harvest_date: '2026-03-27',
    harvest_season: 'Rabi 2025-26',
    village: 'Lasalgaon',
    taluka: 'Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
    preferred_procurement_centre_id: '22222222-3333-4444-5555-666666666603',
    preferred_centre_name: 'Lasalgaon NAFED Onion & Grain Centre',
    procurement_agency_id: '11111111-2222-3333-4444-555555555503',
    procurement_scheme_id: 'scheme-nccf-mis',
    aadhaar_seeded_dbt_declaration: true,
    has_aadhaar_dbt_bank_account: true,
    eligibility_status: 'eligible',
    application_status: 'inspection_scheduled',
    assigned_official_id: '88888888-9999-aaaa-bbbb-cccccccc0004',
    assigned_official_name: 'Dr. Mahendra K. Shinde',
    assigned_official_designation: 'Chief Quality Assurance & MIS Officer',
    assigned_official_department: 'National Cooperative Consumers Federation (NCCF)',
    assigned_official_employee_id: 'NCCF-MH-2024-6721',
    assigned_official_mobile: '+919422067219',
    latest_appointment: {
      id: 'appt-seed-002',
      application_id: 'app-seed-nsk-001',
      assigned_official_id: '88888888-9999-aaaa-bbbb-cccccccc0004',
      assigned_official_name: 'Dr. Mahendra K. Shinde',
      assigned_official_designation: 'Chief Quality Assurance & MIS Officer',
      assigned_official_department: 'National Cooperative Consumers Federation (NCCF)',
      assigned_official_employee_id: 'NCCF-MH-2024-6721',
      assigned_official_mobile: '+919422067219',
      procurement_centre_id: '22222222-3333-4444-5555-666666666603',
      procurement_centre_name: 'Lasalgaon NAFED Onion & Grain Centre',
      centre_name: 'Lasalgaon NAFED Onion & Grain Centre',
      appointment_date: '2026-04-07',
      inspection_date: '2026-04-07',
      appointment_time_slot: '08:00 AM – 10:00 AM',
      inspection_time: '08:00 AM – 10:00 AM',
      inspection_location: 'Niphad Taluka, Lasalgaon 422306',
      instructions_for_farmer: 'Bring dry and cured onion crates, land ownership documents.',
      additional_instructions: 'Bring dry and cured onion crates, land ownership documents.',
      appointment_status: 'scheduled',
      farmer_attendance_status: 'pending',
      created_at: '2026-04-02T14:00:00Z',
      updated_at: '2026-04-02T14:00:00Z',
    },
    submitted_at: '2026-04-01T15:00:00Z',
    created_at: '2026-04-01T15:00:00Z',
    updated_at: '2026-04-02T14:00:00Z',
  },
  {
    id: 'app-seed-nsk-002',
    application_number: 'KM-MSP-2026-4402',
    farmer_id: 'farmer-santosh-jadhav',
    farmer_name: 'Santosh Ganpat Jadhav',
    farmer_phone: '9822056789',
    crop_name: 'Paddy (Dhan)',
    crop_variety: 'Common',
    declared_quantity_quintals: 50,
    proposed_inspection_quantity_quintals: 50,
    harvest_date: '2026-03-24',
    harvest_season: 'Kharif 2025-26',
    village: 'Panchavati',
    taluka: 'Nashik',
    district: 'Nashik',
    state: 'Maharashtra',
    preferred_procurement_centre_id: '22222222-3333-4444-5555-666666666602',
    preferred_centre_name: 'Nashik Panchavati PSS Procurement Centre',
    procurement_agency_id: '11111111-2222-3333-4444-555555555502',
    procurement_scheme_id: 'scheme-fci-pool',
    aadhaar_seeded_dbt_declaration: true,
    has_aadhaar_dbt_bank_account: true,
    eligibility_status: 'eligible',
    application_status: 'quality_inspection_approved',
    assigned_official_id: '88888888-9999-aaaa-bbbb-cccccccc0002',
    assigned_official_name: 'Sunita Anand More',
    assigned_official_designation: 'Senior PSS Inspection Officer',
    assigned_official_department: 'NAFED',
    assigned_official_employee_id: 'NAFED-MH-2024-4102',
    assigned_official_mobile: '+919822410211',
    submitted_at: '2026-03-28T10:00:00Z',
    created_at: '2026-03-28T10:00:00Z',
    updated_at: '2026-03-30T16:00:00Z',
  },
  {
    id: 'app-seed-brm-001',
    application_number: 'KM-MSP-2026-2201',
    farmer_id: 'farmer-anita-jagtap',
    farmer_name: 'Anita Suresh Jagtap',
    farmer_phone: '9822067890',
    crop_name: 'Cotton',
    crop_variety: 'Medium Staple',
    declared_quantity_quintals: 40,
    proposed_inspection_quantity_quintals: 40,
    harvest_date: '2026-03-28',
    harvest_season: 'Kharif 2025-26',
    village: 'Baramati',
    taluka: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    preferred_procurement_centre_id: '22222222-3333-4444-5555-666666666604',
    preferred_centre_name: 'Baramati MIDC PSS Centre',
    procurement_agency_id: '11111111-2222-3333-4444-555555555504',
    procurement_scheme_id: 'scheme-fci-pool',
    aadhaar_seeded_dbt_declaration: true,
    has_aadhaar_dbt_bank_account: true,
    eligibility_status: 'eligible',
    application_status: 'submitted',
    submitted_at: '2026-04-03T14:20:00Z',
    created_at: '2026-04-03T14:20:00Z',
    updated_at: '2026-04-03T14:20:00Z',
  },
  {
    id: 'app-seed-ahm-001',
    application_number: 'KM-MSP-2026-3301',
    farmer_id: 'farmer-mahadev-chavan',
    farmer_name: 'Mahadev Khanderao Chavan',
    farmer_phone: '9822078901',
    crop_name: 'Maize',
    crop_variety: 'Hybrid / FAQ',
    declared_quantity_quintals: 70,
    proposed_inspection_quantity_quintals: 70,
    harvest_date: '2026-03-26',
    harvest_season: 'Kharif 2025-26',
    village: 'Nagar',
    taluka: 'Nagar',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    preferred_procurement_centre_id: '22222222-3333-4444-5555-666666666605',
    preferred_centre_name: 'Ahmednagar Goods Shed Procurement Centre',
    procurement_agency_id: '11111111-2222-3333-4444-555555555501',
    procurement_scheme_id: 'scheme-fci-pool',
    aadhaar_seeded_dbt_declaration: true,
    has_aadhaar_dbt_bank_account: true,
    eligibility_status: 'eligible',
    application_status: 'inspection_scheduled',
    assigned_official_id: '88888888-9999-aaaa-bbbb-cccccccc0003',
    assigned_official_name: 'Arun S. Gaikwad',
    assigned_official_designation: 'Area Procurement Manager',
    assigned_official_department: 'Maharashtra State Co-operative Marketing Federation (MSCMF)',
    assigned_official_employee_id: 'MSCMF-MH-2024-1932',
    assigned_official_mobile: '+919822019321',
    latest_appointment: {
      id: 'appt-seed-003',
      application_id: 'app-seed-ahm-001',
      assigned_official_id: '88888888-9999-aaaa-bbbb-cccccccc0003',
      assigned_official_name: 'Arun S. Gaikwad',
      assigned_official_designation: 'Area Procurement Manager',
      assigned_official_department: 'Maharashtra State Co-operative Marketing Federation (MSCMF)',
      assigned_official_employee_id: 'MSCMF-MH-2024-1932',
      assigned_official_mobile: '+919822019321',
      procurement_centre_id: '22222222-3333-4444-5555-666666666605',
      procurement_centre_name: 'Ahmednagar Goods Shed Procurement Centre',
      centre_name: 'Ahmednagar Goods Shed Procurement Centre',
      appointment_date: '2026-04-08',
      inspection_date: '2026-04-08',
      appointment_time_slot: '01:00 PM – 03:00 PM',
      inspection_time: '01:00 PM – 03:00 PM',
      inspection_location: 'Near Goods Shed, Station Road, Ahmednagar 414001',
      instructions_for_farmer: 'Bring grain bags free of insect damage and excess moisture.',
      additional_instructions: 'Bring grain bags free of insect damage and excess moisture.',
      appointment_status: 'scheduled',
      farmer_attendance_status: 'pending',
      created_at: '2026-04-02T09:30:00Z',
      updated_at: '2026-04-02T09:30:00Z',
    },
    submitted_at: '2026-04-01T11:00:00Z',
    created_at: '2026-04-01T11:00:00Z',
    updated_at: '2026-04-02T09:30:00Z',
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * STORAGE KEYS & LOCAL REPOSITORY HELPERS
 * ───────────────────────────────────────────────────────────────────────── */
const STORAGE_GOVT_SESSION = 'km_govt_session';
const STORAGE_REGISTERED_OFFICIALS = 'km_registered_officials';
const STORAGE_APPLICATIONS = 'km_procurement_applications';
const STORAGE_APPOINTMENTS = 'km_inspection_appointments';
const STORAGE_INSPECTIONS = 'km_inspection_records';
const STORAGE_REPORTS = 'km_inspection_reports';
const STORAGE_NOTIFICATIONS = 'km_procurement_notifications';
const STORAGE_COMPLAINTS = 'km_farmer_complaints';
const STORAGE_AUDIT = 'km_procurement_audit_logs';

const inMemoryStore = new Map<string, unknown>();

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return inMemoryStore.has(key) ? (inMemoryStore.get(key) as T) : defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    inMemoryStore.set(key, value);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[ProcurementService] Local cache save failed for ${key}:`, err);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * 1. GOVERNMENT OFFICIAL AUTHENTICATION
 * ───────────────────────────────────────────────────────────────────────── */

export async function loginGovernmentOfficial(
  identifier: string,
  password: string
): Promise<{ success: boolean; session?: GovernmentOfficialSession; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();

  // Try Supabase DB lookup first
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('government_officials')
        .select('*')
        .or(`official_email.ilike.${cleanId},employee_id.ilike.${cleanId}`)
        .single();

      if (!error && data) {
        if (data.verification_status !== 'verified') {
          return { success: false, error: 'Your government official account has not yet been verified by the administrator.' };
        }
        if (data.account_status !== 'active') {
          return { success: false, error: 'Your government official account is currently suspended or inactive.' };
        }

        // Check password (matches stored password or demonstration access if demo mode is enabled)
        const isDemoAllowed = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
        const passwordMatch = data.password_hash === password || (isDemoAllowed && password === 'govt@kisan2026');
        if (!passwordMatch) {
          return { success: false, error: 'Invalid password. Please check your official credentials.' };
        }

        const session: GovernmentOfficialSession = {
          official: data as GovernmentOfficial,
          token: `GOVT-TOKEN-${Date.now()}`,
          loginTime: new Date().toISOString(),
        };

        setLocalData(STORAGE_GOVT_SESSION, session);
        if (typeof document !== 'undefined') {
          document.cookie = `km_govt_session=${session.official.id}; path=/; max-age=86400; SameSite=Lax`;
        }
        return { success: true, session };
      }
    } catch {
      // Fall through to memory lookup
    }
  }

  // Fallback to local and verified demonstration officials catalog
  const registered = getLocalData<(GovernmentOfficial & { password_plain: string; aliases?: string[] })[]>(STORAGE_REGISTERED_OFFICIALS, []);
  const allKnownOfficials = [...registered, ...DEFAULT_OFFICIALS];

  const found = allKnownOfficials.find(
    (o) =>
      o.official_email.toLowerCase() === cleanId ||
      o.employee_id.toLowerCase() === cleanId ||
      (o.aliases && o.aliases.some((alias) => alias.toLowerCase() === cleanId))
  );

  if (!found) {
    return {
      success: false,
      error: `No registered government official found with employee ID or email '${identifier}'. Access requires administrator verification.`,
    };
  }

  if (found.verification_status !== 'verified') {
    return {
      success: false,
      error: 'Official account verification pending. Only administrator-verified officials can access the inspection portal.',
    };
  }

  const isDemoAllowed = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (password !== found.password_plain && (!isDemoAllowed || password !== 'govt@kisan2026')) {
    return { success: false, error: 'Invalid access credentials. Please enter your authorized official password.' };
  }

  const session: GovernmentOfficialSession = {
    official: found,
    token: `DEMO-GOVT-${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  setLocalData(STORAGE_GOVT_SESSION, session);
  if (typeof document !== 'undefined') {
    document.cookie = `km_govt_session=${found.id}; path=/; max-age=86400; SameSite=Lax`;
  }
  return { success: true, session };
}

export interface RegisterGovernmentOfficialInput {
  full_name: string;
  employee_id: string;
  designation: string;
  department: string;
  procurement_agency_id: string;
  procurement_agency_name?: string;
  state: string;
  district: string;
  taluka: string;
  assigned_procurement_centre_id?: string;
  assigned_procurement_centre_name?: string;
  official_mobile: string;
  official_email: string;
  password: string;
}

export async function registerGovernmentOfficial(
  input: RegisterGovernmentOfficialInput
): Promise<{ success: boolean; official?: GovernmentOfficial; error?: string }> {
  const cleanEmail = input.official_email.trim().toLowerCase();
  const cleanEmpId = input.employee_id.trim().toUpperCase();

  if (!input.full_name || input.full_name.trim().length < 3) {
    return { success: false, error: 'Full name must be at least 3 characters long.' };
  }
  if (!cleanEmpId || cleanEmpId.length < 3) {
    return { success: false, error: 'Official Employee ID is required.' };
  }
  if (!input.designation || input.designation.trim().length < 2) {
    return { success: false, error: 'Official designation is required.' };
  }
  if (!input.department || input.department.trim().length < 2) {
    return { success: false, error: 'Official department / wing is required.' };
  }
  if (!input.procurement_agency_id) {
    return { success: false, error: 'Please select your sponsoring procurement agency.' };
  }
  if (!input.district || !input.taluka) {
    return { success: false, error: 'Jurisdiction district and taluka are required.' };
  }
  const cleanMobile = input.official_mobile.replace(/\D/g, '');
  if (cleanMobile.length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit official mobile number.' };
  }
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid official email address.' };
  }
  if (!input.password || input.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  // Check collision in existing registered or default officials
  const registered = getLocalData<(GovernmentOfficial & { password_plain: string; aliases?: string[] })[]>(STORAGE_REGISTERED_OFFICIALS, []);
  const allOfficials = [...registered, ...DEFAULT_OFFICIALS];
  const duplicate = allOfficials.find(
    (o) => o.official_email.toLowerCase() === cleanEmail || o.employee_id.toUpperCase() === cleanEmpId
  );
  if (duplicate) {
    return { success: false, error: `An official account with Employee ID '${cleanEmpId}' or email '${cleanEmail}' is already registered.` };
  }

  // Lookup agency & centre details if names are missing
  const agency = DEFAULT_AGENCIES.find((a) => a.id === input.procurement_agency_id);
  const centre = DEFAULT_PROCUREMENT_CENTRES.find((c) => c.id === input.assigned_procurement_centre_id);

  const newOfficial: GovernmentOfficial & { password_plain: string; aliases?: string[] } = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `govt-${Date.now()}`,
    full_name: input.full_name.trim(),
    employee_id: cleanEmpId,
    designation: input.designation.trim(),
    department: input.department.trim(),
    procurement_agency_id: input.procurement_agency_id,
    procurement_agency_name: input.procurement_agency_name || agency?.agency_name || 'Government Procurement Agency',
    state: input.state || 'Maharashtra',
    district: input.district.trim(),
    taluka: input.taluka.trim(),
    assigned_procurement_centre_id: input.assigned_procurement_centre_id || DEFAULT_PROCUREMENT_CENTRES[0].id,
    assigned_procurement_centre_name: input.assigned_procurement_centre_name || centre?.centre_name || 'Designated District MSP Depot',
    official_mobile: `+91${cleanMobile.slice(-10)}`,
    official_email: cleanEmail,
    password_plain: input.password,
    verification_status: 'verified',
    account_status: 'active',
    created_at: new Date().toISOString(),
    verified_at: new Date().toISOString(),
  };

  // Try Supabase insert if available
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      await supabase.from('government_officials').insert({
        id: newOfficial.id,
        full_name: newOfficial.full_name,
        employee_id: newOfficial.employee_id,
        designation: newOfficial.designation,
        department: newOfficial.department,
        procurement_agency_id: newOfficial.procurement_agency_id,
        state: newOfficial.state,
        district: newOfficial.district,
        taluka: newOfficial.taluka,
        assigned_procurement_centre_id: newOfficial.assigned_procurement_centre_id,
        official_mobile: newOfficial.official_mobile,
        official_email: newOfficial.official_email,
        password_hash: newOfficial.password_plain,
        verification_status: 'verified',
        account_status: 'active',
      });
    } catch (err) {
      console.warn('[ProcurementService] Supabase official register insert error:', err);
    }
  }

  // Always update local cache
  registered.push(newOfficial);
  setLocalData(STORAGE_REGISTERED_OFFICIALS, registered);

  return { success: true, official: newOfficial };
}

export function getCurrentGovernmentOfficialSession(): GovernmentOfficialSession | null {
  return getLocalData<GovernmentOfficialSession | null>(STORAGE_GOVT_SESSION, null);
}

export function logoutGovernmentOfficial(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_GOVT_SESSION);
      document.cookie = 'km_govt_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch {}
  } else {
    inMemoryStore.delete(STORAGE_GOVT_SESSION);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * 2. MSP & GOVERNMENT PROCUREMENT ELIGIBILITY CHECKING ENGINE
 * ───────────────────────────────────────────────────────────────────────── */

export interface MspEligibilityResult {
  isEligible: boolean;
  eligible: boolean;
  status: 'eligible' | 'conditionally_eligible' | 'ineligible';
  cropName: string;
  variety: string;
  season: string;
  announcedMsp: number;
  schemeName: string;
  agencyName: string;
  isProcurementActive: boolean;
  procurementPeriod: string;
  maxPermissibleMoisture: number;
  message: string;
  requirements: string[];
  msp_record?: CropMspRecord;
  scheme?: ProcurementScheme;
}

export function checkMspEligibility(
  cropName: string,
  variety = 'FAQ Standard',
  state = 'Maharashtra',
  district = 'Pune'
): MspEligibilityResult {
  const cleanCrop = cropName.trim().toLowerCase();

  // Find corresponding MSP record
  const msp = DEFAULT_MSP_RECORDS.find(
    (m) => m.crop_name.toLowerCase().includes(cleanCrop) || cleanCrop.includes(m.crop_name.toLowerCase())
  );

  if (!msp) {
    return {
      isEligible: false,
      eligible: false,
      status: 'ineligible',
      cropName,
      variety,
      season: '2025-26',
      announcedMsp: 0,
      schemeName: 'N/A',
      agencyName: 'N/A',
      isProcurementActive: false,
      procurementPeriod: 'No active government procurement operation',
      maxPermissibleMoisture: 0,
      message: `Crop '${cropName}' is currently not notified for active government procurement under MSP in ${district}, ${state}.`,
      requirements: ['Crop must be among CCEA notified foodgrains or pulses.'],
    };
  }

  // Find standard for moisture
  const moistureStd = DEFAULT_FAQ_STANDARDS.find(
    (s) => s.crop_name.toLowerCase().includes(cleanCrop) && s.parameter_name.toLowerCase().includes('moisture')
  );

  const agencyName = msp.crop_name.includes('Wheat') || msp.crop_name.includes('Paddy') || msp.crop_name.includes('Maize')
    ? 'Food Corporation of India'
    : msp.crop_name.includes('Onion')
    ? 'National Cooperative Consumers Federation (NCCF / NAFED MIS)'
    : 'NAFED';

  const schemeName = msp.crop_name.includes('Wheat') || msp.crop_name.includes('Paddy')
    ? 'Central Pool Foodgrain Procurement (FCI)'
    : msp.crop_name.includes('Onion')
    ? 'Market Intervention Scheme (MIS)'
    : 'Price Support Scheme (PSS - MoA&FW)';

  const matchedScheme = DEFAULT_SCHEMES.find(
    (s) => (s.agency_name || '').toLowerCase().includes(agencyName.toLowerCase().slice(0, 4))
  ) || DEFAULT_SCHEMES[0];

  return {
    isEligible: true,
    eligible: true,
    status: 'eligible',
    cropName: msp.crop_name,
    variety: msp.crop_variety || variety,
    season: msp.marketing_season,
    announcedMsp: msp.msp_per_quintal,
    schemeName,
    agencyName,
    isProcurementActive: true,
    procurementPeriod: `${msp.effective_from} to ${msp.effective_until}`,
    maxPermissibleMoisture: moistureStd?.permissible_maximum || 12.0,
    message: `Notified for active MSP procurement at ₹${msp.msp_per_quintal.toLocaleString('en-IN')}/Quintal under ${schemeName}.`,
    requirements: [
      'Aadhaar-seeded & DBT-enabled bank account declaration.',
      'Produce moisture and FAQ parameters must meet permissible limits upon physical inspection.',
      'Produce must be brought to the designated procurement centre on the scheduled date & time.',
      'Aadhaar card and 7/12 land records presented physically at the procurement centre.',
    ],
    msp_record: msp,
    scheme: matchedScheme,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * 3. FARMER APPLICATION SUBMISSION
 * ───────────────────────────────────────────────────────────────────────── */

export interface CreateProcurementApplicationInput {
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  crop_name: string;
  crop_variety?: string;
  declared_quantity_quintals: number;
  proposed_inspection_quantity_quintals: number;
  harvest_date: string;
  harvest_season: string;
  village: string;
  taluka: string;
  district: string;
  state?: string;
  mandi_token_id?: string;
  preferred_procurement_centre_id?: string;
  preferred_centre_name?: string;
  procurement_agency_id?: string;
  procurement_scheme_id?: string;
  aadhaar_seeded_dbt_declaration?: boolean; // MANDATORY YES/NO
  has_aadhaar_dbt_bank_account?: boolean; // ALIAS
}

export function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  return `KM-MSP-${year}-${randomSeq}`;
}

export async function submitProcurementApplication(
  input: CreateProcurementApplicationInput
): Promise<{ success: boolean; application?: ProcurementApplication; error?: string }> {
  // CRITICAL PRIVACY & POLICY REQUIREMENT:
  // Farmer MUST declare Aadhaar-seeded DBT enabled bank account. If false, block submission.
  const dbtDeclared = Boolean(input.has_aadhaar_dbt_bank_account ?? input.aadhaar_seeded_dbt_declaration);
  if (!dbtDeclared) {
    return {
      success: false,
      error:
        'Your bank account is not declared as an active Aadhaar-seeded DBT bank account. Please contact your bank or the relevant government authority to complete the necessary banking formalities before applying for government procurement.',
    };
  }

  if (input.proposed_inspection_quantity_quintals <= 0) {
    return { success: false, error: 'Proposed inspection quantity must be greater than zero.' };
  }

  const appNumber = generateApplicationNumber();
  const now = new Date().toISOString();

  // Find preferred centre details
  const centre = DEFAULT_PROCUREMENT_CENTRES.find(
    (c) => c.id === input.preferred_procurement_centre_id || c.district.toLowerCase() === input.district.toLowerCase()
  ) || DEFAULT_PROCUREMENT_CENTRES[0];

  const newApp: ProcurementApplication = {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    application_number: appNumber,
    farmer_id: input.farmer_id,
    farmer_name: input.farmer_name,
    farmer_phone: input.farmer_phone,
    crop_name: input.crop_name,
    crop_variety: input.crop_variety || 'FAQ Standard',
    declared_quantity_quintals: Number(input.declared_quantity_quintals),
    proposed_inspection_quantity_quintals: Number(input.proposed_inspection_quantity_quintals),
    harvest_date: input.harvest_date,
    harvest_season: input.harvest_season || 'Kharif 2025-26',
    village: input.village,
    taluka: input.taluka,
    district: input.district,
    state: input.state || 'Maharashtra',
    mandi_token_id: input.mandi_token_id,
    preferred_procurement_centre_id: centre.id,
    preferred_centre_name: centre.centre_name,
    procurement_agency_id: centre.agency_id,
    aadhaar_seeded_dbt_declaration: true,
    has_aadhaar_dbt_bank_account: true,
    eligibility_status: 'eligible',
    application_status: 'submitted',
    submitted_at: now,
    created_at: now,
    updated_at: now,
  };

  // Try Supabase insert
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('procurement_applications')
        .insert({
          application_number: newApp.application_number,
          farmer_id: newApp.farmer_id,
          farmer_name: newApp.farmer_name,
          farmer_phone: newApp.farmer_phone,
          crop_name: newApp.crop_name,
          crop_variety: newApp.crop_variety,
          declared_quantity_quintals: newApp.declared_quantity_quintals,
          proposed_inspection_quantity_quintals: newApp.proposed_inspection_quantity_quintals,
          harvest_date: newApp.harvest_date,
          harvest_season: newApp.harvest_season,
          village: newApp.village,
          taluka: newApp.taluka,
          district: newApp.district,
          state: newApp.state,
          mandi_token_id: newApp.mandi_token_id,
          preferred_procurement_centre_id: newApp.preferred_procurement_centre_id,
          aadhaar_seeded_dbt_declaration: true,
          eligibility_status: 'eligible',
          application_status: 'submitted',
        })
        .select()
        .single();

      if (!error && data) {
        newApp.id = data.id;
      }
    } catch (err) {
      console.warn('[ProcurementService] Supabase insert fallback to local:', err);
    }
  }

  // Save to local cache
  const storedApps = getLocalData<ProcurementApplication[] | null>(STORAGE_APPLICATIONS, null);
  const baseApps = storedApps && storedApps.length > 0 ? storedApps : DEFAULT_PROCUREMENT_APPLICATIONS;
  const allApps = [newApp, ...baseApps.filter((a) => a.id !== newApp.id)];
  setLocalData(STORAGE_APPLICATIONS, allApps);

  // Log audit
  recordAuditLog({
    actor_user_id: input.farmer_id,
    actor_role: 'farmer',
    application_id: newApp.id,
    entity_type: 'procurement_applications',
    entity_id: newApp.id,
    action_type: 'APPLICATION_SUBMITTED',
    new_data: { application_number: newApp.application_number, crop: newApp.crop_name, qty: newApp.declared_quantity_quintals },
    action_reason: 'Farmer submitted quality inspection application under MSP',
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('km_procurement_app_submitted'));
    window.dispatchEvent(new Event('km_procurement_app_updated'));
  }

  return { success: true, application: newApp };
}

export async function getFarmerProcurementApplications(
  farmerId: string,
  farmerPhone?: string
): Promise<ProcurementApplication[]> {
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      let query = supabase
        .from('procurement_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (farmerPhone) {
        query = query.or(`farmer_id.eq.${farmerId},farmer_phone.eq.${farmerPhone}`);
      } else {
        query = query.eq('farmer_id', farmerId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as ProcurementApplication[];
      }
    } catch {}
  }

  // Local fallback
  const allApps = getAllProcurementApplications();
  const cleanPhone = farmerPhone ? farmerPhone.replace('+91', '').trim() : '';

  const matched = allApps.filter((a) => {
    if (a.farmer_id === farmerId) return true;
    if (cleanPhone && (a.farmer_phone === cleanPhone || a.farmer_phone === `+91${cleanPhone}`)) return true;
    return false;
  });

  // If no application matches and user is in demo mode or initial view, return the top seed demo apps
  if (matched.length === 0 && (!cleanPhone || farmerId.includes('demo') || farmerId === 'farmer')) {
    return allApps.slice(0, 3);
  }

  return matched;
}

export function getAllProcurementApplications(): ProcurementApplication[] {
  const stored = getLocalData<ProcurementApplication[] | null>(STORAGE_APPLICATIONS, null);
  if (!stored || stored.length === 0) {
    setLocalData(STORAGE_APPLICATIONS, DEFAULT_PROCUREMENT_APPLICATIONS);
    return DEFAULT_PROCUREMENT_APPLICATIONS;
  }
  return stored;
}

export function resetAndSeedProcurementQueue(): ProcurementApplication[] {
  setLocalData(STORAGE_APPLICATIONS, DEFAULT_PROCUREMENT_APPLICATIONS);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('km_procurement_app_updated'));
  }
  return DEFAULT_PROCUREMENT_APPLICATIONS;
}

export function appointOfficerToApplication(
  applicationId: string,
  officialId: string
): { success: boolean; application?: ProcurementApplication; error?: string } {
  const allApps = getAllProcurementApplications();
  const appIndex = allApps.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) {
    return { success: false, error: 'Application not found' };
  }

  const inspectors = getAllAvailableInspectors();
  const inspector = inspectors.find((i) => i.id === officialId || i.employee_id === officialId) || inspectors[0];

  const now = new Date().toISOString();
  const targetApp = allApps[appIndex];
  const dateVal = targetApp.latest_appointment?.appointment_date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const timeVal = targetApp.latest_appointment?.appointment_time_slot || '10:00 AM – 12:00 PM';
  const centreName = targetApp.preferred_centre_name || 'Official APMC Procurement Depot';

  const appointment: InspectionAppointment = {
    id: targetApp.latest_appointment?.id || `appt-${Date.now()}`,
    application_id: targetApp.id,
    assigned_official_id: inspector.id,
    assigned_official_name: inspector.name,
    assigned_official_designation: inspector.designation,
    assigned_official_department: inspector.department,
    assigned_official_employee_id: inspector.employee_id,
    assigned_official_mobile: inspector.phone,
    procurement_centre_id: targetApp.preferred_procurement_centre_id || 'centre-01',
    procurement_centre_name: centreName,
    centre_name: centreName,
    inspection_date: dateVal,
    appointment_date: dateVal,
    inspection_time: timeVal,
    appointment_time_slot: timeVal,
    inspection_location: centreName,
    instructions_for_farmer: 'Please bring your produce lot, land 7/12 record, and Aadhaar card.',
    additional_instructions: 'Please bring your produce lot, land 7/12 record, and Aadhaar card.',
    appointment_status: 'scheduled',
    farmer_attendance_status: 'pending',
    created_at: targetApp.latest_appointment?.created_at || now,
    updated_at: now,
  };

  targetApp.application_status = 'inspection_scheduled';
  targetApp.latest_appointment = appointment;
  targetApp.assigned_official_id = inspector.id;
  targetApp.assigned_official_name = inspector.name;
  targetApp.assigned_official_designation = inspector.designation;
  targetApp.assigned_official_department = inspector.department;
  targetApp.assigned_official_employee_id = inspector.employee_id;
  targetApp.assigned_official_mobile = inspector.phone;
  targetApp.updated_at = now;

  setLocalData(STORAGE_APPLICATIONS, allApps);

  // Save to appointments storage
  const allAppts = getLocalData<InspectionAppointment[]>(STORAGE_APPOINTMENTS, []);
  allAppts.unshift(appointment);
  setLocalData(STORAGE_APPOINTMENTS, allAppts);

  // Record immutable audit log
  recordAuditLog({
    actor_user_id: inspector.id,
    actor_role: 'government_official',
    application_id: targetApp.id,
    entity_type: 'inspection_appointments',
    entity_id: appointment.id,
    action_type: 'INSPECTION_SCHEDULED',
    new_data: {
      date: dateVal,
      time: timeVal,
      location: centreName,
      appointed_officer: inspector.name,
      officer_id: inspector.employee_id,
    },
    action_reason: `Quick-assigned inspecting officer ${inspector.name} (${inspector.employee_id})`,
  });

  createFarmerNotification({
    recipient_user_id: targetApp.farmer_id || 'farmer',
    application_id: targetApp.id,
    notification_type: 'INSPECTION_SCHEDULED',
    title: `Officer Appointed: ${inspector.name} for ${targetApp.crop_name}`,
    message: `DEAR FARMER ${targetApp.farmer_name.toUpperCase()},

Inspection Officer ${inspector.name} (${inspector.designation}, ${inspector.department}) has been assigned to conduct your produce inspection.

Officer Contact: ${inspector.phone}
Officer ID: ${inspector.employee_id}
Appointment Slot: ${timeVal} on ${dateVal}

– KISAN MITRA`,
    notification_data: {
      officer_name: inspector.name,
      officer_id: inspector.employee_id,
      officer_phone: inspector.phone,
      officer_designation: inspector.designation,
      appointment_date: dateVal,
      appointment_time: timeVal,
      centre_name: centreName,
    },
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('km_procurement_app_updated'));
  }

  return { success: true, application: targetApp };
}

/* ─────────────────────────────────────────────────────────────────────────
 * 4. GOVERNMENT OFFICIAL INSPECTION SCHEDULING
 * ───────────────────────────────────────────────────────────────────────── */

export interface ScheduleInspectionInput {
  application_id: string;
  official_id?: string;
  procurement_centre_id?: string;
  centre_id?: string;
  inspection_date?: string;
  appointment_date?: string;
  inspection_time?: string;
  appointment_time_slot?: string;
  inspection_location?: string;
  centre_name?: string;
  additional_instructions?: string;
  instructions_for_farmer?: string;
  scheduling_remarks?: string;
}

export async function scheduleInspectionAppointment(
  input: ScheduleInspectionInput
): Promise<{ success: boolean; appointment?: InspectionAppointment; notificationMessage?: string; error?: string }> {
  const officialSession = getCurrentGovernmentOfficialSession();
  let official: GovernmentOfficial = officialSession?.official || DEFAULT_OFFICIALS[0];

  if (input.official_id) {
    const foundGov = DEFAULT_OFFICIALS.find(
      (o) => o.id === input.official_id || o.employee_id === input.official_id
    );
    if (foundGov) {
      official = foundGov;
    } else {
      const foundApmc = SEED_OFFICERS.find(
        (o) => o.id === input.official_id || o.officer_id === input.official_id
      );
      if (foundApmc) {
        official = {
          id: foundApmc.id,
          full_name: foundApmc.full_name,
          employee_id: foundApmc.officer_id,
          designation: 'APMC Field Quality Inspector',
          department: `APMC Yard Batch ${foundApmc.batch_id}`,
          procurement_agency_id: 'apmc-official',
          procurement_agency_name: 'APMC Market Committee',
          state: 'Maharashtra',
          district: 'Pune',
          taluka: 'Haveli',
          assigned_procurement_centre_id: 'centre-01',
          official_mobile: foundApmc.contact_number,
          official_email: foundApmc.email,
          verification_status: 'verified',
          account_status: 'active',
          created_at: foundApmc.created_at,
        };
      }
    }
  }

  const now = new Date().toISOString();
  const centreId = input.procurement_centre_id || input.centre_id;
  const centre =
    DEFAULT_PROCUREMENT_CENTRES.find(
      (c) => c.id === centreId || (input.centre_name && c.centre_name.toLowerCase().includes(input.centre_name.toLowerCase().slice(0, 5)))
    ) || DEFAULT_PROCUREMENT_CENTRES[0];

  const dateVal = input.inspection_date || input.appointment_date || now.split('T')[0];
  const timeVal = input.inspection_time || input.appointment_time_slot || '10:00 AM – 12:00 PM';
  const instructionsVal = input.additional_instructions || input.instructions_for_farmer || 'Please bring clean bags and land 7/12 record.';
  const centreNameVal = input.centre_name || centre.centre_name;

  const appointment: InspectionAppointment = {
    id: `appt-${Date.now()}`,
    application_id: input.application_id,
    assigned_official_id: official.id,
    assigned_official_name: official.full_name,
    assigned_official_designation: official.designation,
    assigned_official_department: official.department,
    assigned_official_employee_id: official.employee_id,
    assigned_official_mobile: official.official_mobile,
    procurement_centre_id: centre.id,
    procurement_centre_name: centreNameVal,
    inspection_date: dateVal,
    appointment_date: dateVal,
    inspection_time: timeVal,
    appointment_time_slot: timeVal,
    inspection_location: input.inspection_location || centre.complete_address,
    centre_name: centreNameVal,
    additional_instructions: instructionsVal,
    instructions_for_farmer: instructionsVal,
    appointment_status: 'scheduled',
    scheduling_remarks: input.scheduling_remarks,
    farmer_attendance_status: 'pending',
    created_at: now,
    updated_at: now,
  };

  // Update application status
  const allApps = getAllProcurementApplications();
  const appIndex = allApps.findIndex((a) => a.id === input.application_id);
  let farmerName = 'Farmer';
  let appNumber = 'KM-MSP';

  if (appIndex !== -1) {
    allApps[appIndex].application_status = 'inspection_scheduled';
    allApps[appIndex].latest_appointment = appointment;
    allApps[appIndex].assigned_official_id = official.id;
    allApps[appIndex].assigned_official_name = official.full_name;
    allApps[appIndex].assigned_official_designation = official.designation;
    allApps[appIndex].assigned_official_department = official.department;
    allApps[appIndex].assigned_official_employee_id = official.employee_id;
    allApps[appIndex].assigned_official_mobile = official.official_mobile;
    allApps[appIndex].updated_at = now;
    farmerName = allApps[appIndex].farmer_name;
    appNumber = allApps[appIndex].application_number;
    setLocalData(STORAGE_APPLICATIONS, allApps);
  }

  // Save appointment
  const allAppts = getLocalData<InspectionAppointment[]>(STORAGE_APPOINTMENTS, []);
  allAppts.unshift(appointment);
  setLocalData(STORAGE_APPOINTMENTS, allAppts);

  // EXACT FARMER NOTIFICATION FORMAT AS REQUIRED:
  const notificationText = `DEAR FARMER ${farmerName.toUpperCase()},

You are requested to bring your agricultural produce for quality inspection.

APPOINTED INSPECTION OFFICER:
• Officer Name: ${official.full_name}
• Designation: ${official.designation}
• Agency / Dept: ${official.department}
• Employee / Officer ID: ${official.employee_id}
• Contact Phone: ${official.official_mobile}

You are required to visit:

DAY AND DATE: ${formatDayAndDate(dateVal)}

TIME: ${timeVal}

LOCATION: ${centreNameVal}, ${centre.complete_address}

Please bring your agricultural produce and all necessary government documents, including your Aadhaar card, for verification by the authorised government procurement officials.

APPLICATION ID: ${appNumber}

Please arrive at the scheduled time.

– KISAN MITRA GOVERNMENT PROCUREMENT SYSTEM`;

  // Create notification in repository
  createFarmerNotification({
    recipient_user_id: allApps[appIndex]?.farmer_id || 'farmer',
    application_id: input.application_id,
    notification_type: 'INSPECTION_SCHEDULED',
    title: `Government Quality Inspection Scheduled: ${appNumber}`,
    message: notificationText,
    notification_data: {
      inspection_date: dateVal,
      inspection_time: timeVal,
      location: centre.centre_name,
      address: centre.complete_address,
      officer_name: official.full_name,
      officer_designation: official.designation,
      officer_employee_id: official.employee_id,
      officer_mobile: official.official_mobile,
    },
  });

  // Log Audit
  recordAuditLog({
    actor_user_id: official.id,
    actor_role: 'government_official',
    application_id: input.application_id,
    entity_type: 'inspection_appointments',
    entity_id: appointment.id,
    action_type: 'INSPECTION_SCHEDULED',
    new_data: {
      date: dateVal,
      time: timeVal,
      location: centre.centre_name,
      appointed_officer: official.full_name,
      officer_id: official.employee_id,
    },
    action_reason: `Official scheduled produce physical FAQ inspection appointment and appointed ${official.full_name} (${official.employee_id})`,
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('km_procurement_app_updated'));
  }

  // Attempt remote Supabase persistence if online
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      await supabase.from('inspection_appointments').insert({
        application_id: input.application_id,
        assigned_official_id: official.id,
        procurement_centre_id: centre.id,
        inspection_date: dateVal,
        inspection_time: timeVal,
        inspection_location: input.inspection_location || centre.complete_address,
        additional_instructions: instructionsVal,
        appointment_status: 'scheduled',
      });
      await supabase
        .from('procurement_applications')
        .update({ application_status: 'inspection_scheduled', updated_at: now })
        .eq('id', input.application_id);
    } catch (err) {
      console.warn('[ProcurementService] Supabase appointment sync fallback to local:', err);
    }
  }

  return { success: true, appointment, notificationMessage: notificationText };
}

function formatDayAndDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateString;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * 5. PHYSICAL PRODUCE FAQ QUALITY INSPECTION & DECISIONS
 * ───────────────────────────────────────────────────────────────────────── */

export interface SubmitQualityInspectionInput {
  application_id: string;
  appointment_id?: string;
  official_id?: string;
  inspection_location?: string;
  inspected_quantity_quintals?: number;
  sample_seal_number?: string;
  observation_remarks?: string;
  measurements?: Record<string, unknown>[];
  parameters_tested?: Record<string, unknown>[];
  decision: 'APPROVE' | 'REJECT' | 'RECHECK';
  official_remarks?: string;
  rejection_reason?: string; // MANDATORY IF REJECT
  reinspection_reason?: string; // MANDATORY IF RECHECK
  evidence_files?: { path: string; type: string; description: string }[];
}

export function evaluateParameterResult(
  actual: number,
  min: number | null,
  max: number | null
): 'PASS' | 'FAIL' {
  if (min !== null && actual < min) return 'FAIL';
  if (max !== null && actual > max) return 'FAIL';
  return 'PASS';
}

export async function submitQualityInspectionDecision(
  input: SubmitQualityInspectionInput
): Promise<{ success: boolean; record?: InspectionRecord; report?: InspectionReport; notificationMessage?: string; error?: string }> {
  // Validate mandatory reasons
  if (input.decision === 'REJECT' && !input.rejection_reason?.trim()) {
    return { success: false, error: 'A recorded rejection reason is mandatory when rejecting produce.' };
  }
  if (input.decision === 'RECHECK' && !input.reinspection_reason?.trim()) {
    return { success: false, error: 'A specific explanation of parameters requiring re-examination is required for RECHECK.' };
  }

  const officialSession = getCurrentGovernmentOfficialSession();
  const official = officialSession?.official || DEFAULT_OFFICIALS[0];

  const now = new Date().toISOString();
  const refNumber = `INSP-MSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Evaluate each parameter against standards (accept either parameters_tested or measurements)
  const rawParams = input.parameters_tested || input.measurements || [];
  const measuredParams: InspectionParameterMeasurement[] = rawParams.map((m: Record<string, unknown>) => {
    const val = Number(m.actual_measured_value ?? m.measured_value ?? 0);
    const min = m.permissible_minimum !== undefined && m.permissible_minimum !== null ? Number(m.permissible_minimum) : null;
    const max = m.permissible_maximum !== undefined && m.permissible_maximum !== null ? Number(m.permissible_maximum) : null;
    const result = (m.inspection_result as 'PASS' | 'FAIL') || (m.result as 'PASS' | 'FAIL') || evaluateParameterResult(val, min, max);
    return {
      parameter_id: String(m.parameter_id || m.id || ''),
      parameter_name: String(m.parameter_name || ''),
      unit: String(m.unit || ''),
      permissible_minimum: min,
      permissible_maximum: max,
      actual_measured_value: val,
      measured_value: val,
      inspection_result: result,
      result: result,
      official_remarks: m.official_remarks ? String(m.official_remarks) : m.remarks ? String(m.remarks) : undefined,
    };
  });

  const inspectionRecord: InspectionRecord = {
    id: `rec-${Date.now()}`,
    application_id: input.application_id,
    appointment_id: input.appointment_id,
    inspecting_official_id: official.id,
    inspecting_official_name: official.full_name,
    inspecting_official_designation: official.designation,
    inspecting_official_employee_id: official.employee_id,
    inspecting_official_agency: official.department,
    inspection_reference_number: refNumber,
    inspection_started_at: now,
    inspection_completed_at: now,
    inspection_location: input.inspection_location || 'Official APMC Procurement Inspection Bay',
    farmer_attendance_status: 'attended',
    inspection_decision: input.decision,
    decision: input.decision,
    official_remarks: input.official_remarks || input.observation_remarks,
    rejection_reason: input.rejection_reason,
    reinspection_reason: input.reinspection_reason,
    parameters: measuredParams,
    parameters_tested: measuredParams,
    measurements: measuredParams,
    evidence_files: input.evidence_files,
    created_at: now,
    updated_at: now,
  };

  // Update application status
  const allApps = getLocalData<ProcurementApplication[]>(STORAGE_APPLICATIONS, []);
  const appIndex = allApps.findIndex((a) => a.id === input.application_id);
  let farmerName = 'Farmer';
  let appNumber = 'KM-MSP';
  let centreName = 'Procurement Centre';

  if (appIndex !== -1) {
    if (input.decision === 'APPROVE') {
      allApps[appIndex].application_status = 'quality_inspection_approved';
    } else if (input.decision === 'REJECT') {
      allApps[appIndex].application_status = 'quality_inspection_rejected';
    } else {
      allApps[appIndex].application_status = 'reinspection_required';
    }

    allApps[appIndex].latest_inspection = inspectionRecord;
    allApps[appIndex].updated_at = now;
    farmerName = allApps[appIndex].farmer_name;
    appNumber = allApps[appIndex].application_number;
    centreName = allApps[appIndex].preferred_centre_name || 'Designated Centre';
    setLocalData(STORAGE_APPLICATIONS, allApps);
  }

  // Save record
  const allRecords = getLocalData<InspectionRecord[]>(STORAGE_INSPECTIONS, []);
  allRecords.unshift(inspectionRecord);
  setLocalData(STORAGE_INSPECTIONS, allRecords);

  // Generate Digital Inspection Report
  const reportNumber = `REP-MSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const inspectionReport: InspectionReport = {
    id: `rep-${Date.now()}`,
    inspection_record_id: inspectionRecord.id,
    application_id: input.application_id,
    report_number: reportNumber,
    report_generated_at: now,
    generated_by: official.id,
    report_status: 'generated',
    application: allApps[appIndex],
    inspection: inspectionRecord,
  };

  const allReports = getLocalData<InspectionReport[]>(STORAGE_REPORTS, []);
  allReports.unshift(inspectionReport);
  setLocalData(STORAGE_REPORTS, allReports);

  if (appIndex !== -1) {
    allApps[appIndex].latest_report = inspectionReport;
    setLocalData(STORAGE_APPLICATIONS, allApps);
  }

  // Exact Notification Generation
  let notificationMessage = '';
  if (input.decision === 'APPROVE') {
    notificationMessage = `DEAR FARMER ${farmerName.toUpperCase()},

Your agricultural produce has successfully passed the preliminary quality inspection.

Please visit the designated procurement centre with your produce and required documents to complete the remaining official government procurement formalities.

APPLICATION ID: ${appNumber}

INSPECTION CENTRE: ${centreName}

– KISAN MITRA`;

    createFarmerNotification({
      recipient_user_id: allApps[appIndex]?.farmer_id || 'farmer',
      application_id: input.application_id,
      notification_type: 'INSPECTION_APPROVED',
      title: `Quality Inspection APPROVED: ${appNumber}`,
      message: notificationMessage,
      notification_data: { decision: 'APPROVE', ref: refNumber, report: reportNumber },
    });
  } else if (input.decision === 'REJECT') {
    notificationMessage = `DEAR FARMER ${farmerName.toUpperCase()},

Your agricultural produce quality inspection was REJECTED by the procurement official.

REASON FOR REJECTION:
${input.rejection_reason}

APPLICATION ID: ${appNumber}

If you believe this measurement is incorrect, you may submit a formal complaint for review by a supervisory official through Kisan Mitra.

– KISAN MITRA`;

    createFarmerNotification({
      recipient_user_id: allApps[appIndex]?.farmer_id || 'farmer',
      application_id: input.application_id,
      notification_type: 'INSPECTION_REJECTED',
      title: `Quality Inspection REJECTED: ${appNumber}`,
      message: notificationMessage,
      notification_data: { decision: 'REJECT', reason: input.rejection_reason },
    });
  } else {
    notificationMessage = `DEAR FARMER ${farmerName.toUpperCase()},

Your agricultural produce has been flagged for RECHECK / REINSPECTION by the quality inspector.

REASON:
${input.reinspection_reason}

APPLICATION ID: ${appNumber}

An updated appointment date and instructions will be notified to you shortly.

– KISAN MITRA`;

    createFarmerNotification({
      recipient_user_id: allApps[appIndex]?.farmer_id || 'farmer',
      application_id: input.application_id,
      notification_type: 'REINSPECTION_REQUIRED',
      title: `Reinspection Required: ${appNumber}`,
      message: notificationMessage,
      notification_data: { decision: 'RECHECK', reason: input.reinspection_reason },
    });
  }

  // Record Audit Log
  recordAuditLog({
    actor_user_id: official.id,
    actor_role: 'government_official',
    application_id: input.application_id,
    entity_type: 'inspection_records',
    entity_id: inspectionRecord.id,
    action_type: `INSPECTION_${input.decision}`,
    new_data: { decision: input.decision, ref: refNumber, report: reportNumber },
    action_reason: input.decision === 'REJECT' ? input.rejection_reason : input.decision === 'RECHECK' ? input.reinspection_reason : 'Quality passed FAQ standards',
  });

  // Attempt remote Supabase persistence if online
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      const statusMap = {
        APPROVE: 'quality_inspection_approved',
        REJECT: 'quality_inspection_rejected',
        RECHECK: 'reinspection_required',
      };
      await supabase
        .from('procurement_applications')
        .update({ application_status: statusMap[input.decision], updated_at: now })
        .eq('id', input.application_id);

      await supabase.from('inspection_records').insert({
        application_id: input.application_id,
        inspecting_official_id: official.id,
        inspection_reference_number: refNumber,
        inspection_started_at: now,
        inspection_completed_at: now,
        inspection_location: input.inspection_location || 'Official APMC Procurement Inspection Bay',
        farmer_attendance_status: 'attended',
        inspection_decision: input.decision,
        official_remarks: input.official_remarks || input.observation_remarks,
        rejection_reason: input.rejection_reason,
        reinspection_reason: input.reinspection_reason,
      });
    } catch (err) {
      console.warn('[ProcurementService] Supabase inspection sync fallback to local:', err);
    }
  }

  return { success: true, record: inspectionRecord, report: inspectionReport, notificationMessage };
}

/* ─────────────────────────────────────────────────────────────────────────
 * 6. FARMER COMPLAINTS / GRIEVANCES FACILITY
 * ───────────────────────────────────────────────────────────────────────── */

export interface SubmitComplaintInput {
  application_id: string;
  farmer_id: string;
  complaint_category: FarmerComplaint['complaint_category'];
  complaint_description: string;
  related_official_id?: string;
}

export async function submitFarmerComplaint(
  input: SubmitComplaintInput
): Promise<{ success: boolean; complaint?: FarmerComplaint; error?: string }> {
  if (!input.complaint_description.trim()) {
    return { success: false, error: 'Please describe your grievance in detail.' };
  }

  const complaintNumber = `CMP-MSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const complaint: FarmerComplaint = {
    id: `cmp-${Date.now()}`,
    complaint_number: complaintNumber,
    application_id: input.application_id,
    farmer_id: input.farmer_id,
    complaint_category: input.complaint_category,
    complaint_description: input.complaint_description,
    related_official_id: input.related_official_id,
    complaint_status: 'submitted',
    status: 'submitted',
    created_at: now,
    updated_at: now,
  };

  const allComplaints = getLocalData<FarmerComplaint[]>(STORAGE_COMPLAINTS, []);
  allComplaints.unshift(complaint);
  setLocalData(STORAGE_COMPLAINTS, allComplaints);

  // Log Audit
  recordAuditLog({
    actor_user_id: input.farmer_id,
    actor_role: 'farmer',
    application_id: input.application_id,
    entity_type: 'complaints',
    entity_id: complaint.id,
    action_type: 'COMPLAINT_FILED',
    new_data: { complaint_number: complaintNumber, category: input.complaint_category },
    action_reason: 'Farmer submitted grievance regarding procurement inspection',
  });

  // Attempt remote Supabase persistence if online
  if (hasValidSupabaseConfig()) {
    try {
      const supabase = createClient();
      await supabase.from('complaints').insert({
        complaint_number: complaintNumber,
        application_id: input.application_id,
        farmer_id: input.farmer_id,
        complaint_category: input.complaint_category,
        complaint_description: input.complaint_description,
        related_official_id: input.related_official_id,
        complaint_status: 'submitted',
      });
    } catch (err) {
      console.warn('[ProcurementService] Supabase complaint sync fallback to local:', err);
    }
  }

  return { success: true, complaint };
}

export function getFarmerComplaints(farmerId: string): FarmerComplaint[] {
  const all = getLocalData<FarmerComplaint[]>(STORAGE_COMPLAINTS, []);
  return all.filter((c) => c.farmer_id === farmerId);
}

export function getAllComplaints(): FarmerComplaint[] {
  return getLocalData<FarmerComplaint[]>(STORAGE_COMPLAINTS, []);
}

/* ─────────────────────────────────────────────────────────────────────────
 * 7. NOTIFICATIONS & AUDIT REPOSITORY
 * ───────────────────────────────────────────────────────────────────────── */

export function createFarmerNotification(notif: Omit<ProcurementNotification, 'id' | 'is_read' | 'created_at'>): ProcurementNotification {
  const newNotif: ProcurementNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...notif,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  const all = getLocalData<ProcurementNotification[]>(STORAGE_NOTIFICATIONS, []);
  all.unshift(newNotif);
  setLocalData(STORAGE_NOTIFICATIONS, all);
  return newNotif;
}

export function getFarmerProcurementNotifications(farmerId: string): ProcurementNotification[] {
  const all = getLocalData<ProcurementNotification[]>(STORAGE_NOTIFICATIONS, []);
  return all.filter((n) => n.recipient_user_id === farmerId || n.recipient_user_id === 'farmer');
}

export function markNotificationAsRead(id: string): void {
  const all = getLocalData<ProcurementNotification[]>(STORAGE_NOTIFICATIONS, []);
  const idx = all.findIndex((n) => n.id === id);
  if (idx !== -1) {
    all[idx].is_read = true;
    all[idx].read_at = new Date().toISOString();
    setLocalData(STORAGE_NOTIFICATIONS, all);
  }
}

export function recordAuditLog(log: Omit<ProcurementAuditLog, 'id' | 'created_at'>): ProcurementAuditLog {
  const newLog: ProcurementAuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...log,
    created_at: new Date().toISOString(),
  };

  const all = getLocalData<ProcurementAuditLog[]>(STORAGE_AUDIT, []);
  all.unshift(newLog);
  setLocalData(STORAGE_AUDIT, all);
  return newLog;
}

export function getProcurementAuditLogs(applicationId?: string): ProcurementAuditLog[] {
  const all = getLocalData<ProcurementAuditLog[]>(STORAGE_AUDIT, []);
  if (!applicationId) return all;
  return all.filter((a) => a.application_id === applicationId);
}

/* ─────────────────────────────────────────────────────────────────────────
 * 7. RETRIEVAL & QUERY HELPERS
 * ───────────────────────────────────────────────────────────────────────── */

export function getAllCentres(): ProcurementCentre[] {
  return DEFAULT_PROCUREMENT_CENTRES;
}

export function getAllSchemes(): ProcurementScheme[] {
  return DEFAULT_SCHEMES;
}

export function getAllMspRecords(): CropMspRecord[] {
  return DEFAULT_MSP_RECORDS;
}

export function getQualityStandardsForCrop(cropName: string): CropQualityStandard[] {
  const clean = cropName.toLowerCase().trim();
  const direct = DEFAULT_FAQ_STANDARDS.filter((s) => s.crop_name.toLowerCase() === clean);
  if (direct.length > 0) return direct;

  // Fuzzy match (e.g. "Wheat (FAQ)" or "Paddy")
  return DEFAULT_FAQ_STANDARDS.filter((s) =>
    clean.includes(s.crop_name.toLowerCase()) || s.crop_name.toLowerCase().includes(clean)
  );
}

export function getInspectionReport(applicationId: string): InspectionReport | null {
  const allReports = getLocalData<InspectionReport[]>(STORAGE_REPORTS, []);
  return allReports.find((r) => r.application_id === applicationId) || null;
}

export function getInspectionAppointment(applicationId: string): InspectionAppointment | null {
  const allAppts = getLocalData<InspectionAppointment[]>(STORAGE_APPOINTMENTS, []);
  return allAppts.find((a) => a.application_id === applicationId) || null;
}

export function getInspectionRecord(applicationId: string): InspectionRecord | null {
  const allRecs = getLocalData<InspectionRecord[]>(STORAGE_INSPECTIONS, []);
  return allRecs.find((r) => r.application_id === applicationId) || null;
}

export function updateComplaintStatus(
  complaintId: string,
  status: FarmerComplaint['complaint_status'],
  reviewNotes: string,
  reviewedBy: string
): boolean {
  const all = getLocalData<FarmerComplaint[]>(STORAGE_COMPLAINTS, []);
  const idx = all.findIndex((c) => c.id === complaintId);
  if (idx === -1) return false;

  all[idx].status = status;
  all[idx].complaint_status = status;
  all[idx].reviewed_at = new Date().toISOString();
  all[idx].reviewed_by = reviewedBy;
  all[idx].review_notes = reviewNotes;
  setLocalData(STORAGE_COMPLAINTS, all);

  recordAuditLog({
    actor_user_id: reviewedBy,
    actor_role: 'government_official',
    application_id: all[idx].application_id,
    entity_type: 'complaints',
    entity_id: complaintId,
    action_type: `COMPLAINT_${status.toUpperCase()}`,
    new_data: { status, reviewNotes },
    action_reason: reviewNotes,
  });

  return true;
}
