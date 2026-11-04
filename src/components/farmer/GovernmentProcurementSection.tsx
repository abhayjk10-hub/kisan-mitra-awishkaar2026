'use client';

import { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Calendar,
  Building2,
  Info,
  Scale,
  Printer,
  X,
  MessageSquare,
  Sparkles,
  UserCheck,
  BadgeCheck,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import {
  checkMspEligibility,
  submitProcurementApplication,
  getFarmerProcurementApplications,
  getFarmerProcurementNotifications,
  getAllCentres,
  getAllMspRecords,
  DEFAULT_FAQ_STANDARDS,
  submitFarmerComplaint,
  ProcurementApplication,
  ProcurementNotification,
  CropMspRecord,
  ProcurementCentre,
} from '@/lib/government-procurement-service';

export default function GovernmentProcurementSection() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'apply' | 'my-applications' | 'standards'>('apply');
  const [applications, setApplications] = useState<ProcurementApplication[]>([]);
  const [centres] = useState<ProcurementCentre[]>(() => getAllCentres());
  const [mspRecords] = useState<CropMspRecord[]>(() => getAllMspRecords());

  // Form State
  const [farmerName, setFarmerName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  );
  const [farmerPhone, setFarmerPhone] = useState(
    user?.phone ? user.phone.replace('+91', '') : ''
  );
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [cropVariety, setCropVariety] = useState('FAQ Standard');
  const [declaredQuantity, setDeclaredQuantity] = useState<number>(50);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvestSeason, setHarvestSeason] = useState('Rabi 2025-26');
  const [village, setVillage] = useState('Lasalgaon');
  const [taluka, setTaluka] = useState('Niphad');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [preferredCentreId, setPreferredCentreId] = useState(() => getAllCentres()[0]?.id || '');
  const [hasAadhaarDbt, setHasAadhaarDbt] = useState<boolean | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<ProcurementApplication | null>(null);

  // Modals
  const [selectedAppForReport, setSelectedAppForReport] = useState<ProcurementApplication | null>(null);
  const [selectedAppForNotice, setSelectedAppForNotice] = useState<ProcurementApplication | null>(null);
  const [selectedAppForComplaint, setSelectedAppForComplaint] = useState<ProcurementApplication | null>(null);

  // Complaint Form State
  const [complaintCategory, setComplaintCategory] = useState<
    'QUALITY_DISPUTE' | 'OFFICER_MISCONDUCT' | 'DELAY' | 'WEIGHMENT_DISPUTE' | 'REJECTION_APPEAL'
  >('QUALITY_DISPUTE');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintSuccessId, setComplaintSuccessId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ProcurementNotification[]>([]);

  // Load existing farmer applications and notifications with real-time sync
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const farmerId = user?.id || farmerPhone || 'farmer-demo';
      const [apps, notifs] = await Promise.all([
        getFarmerProcurementApplications(farmerId, farmerPhone),
        Promise.resolve(getFarmerProcurementNotifications(farmerId)),
      ]);
      if (isMounted) {
        setApplications(apps);
        setNotifications(notifs);
      }
    };
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('km_procurement_app_updated', handleSync);
    window.addEventListener('km_procurement_app_submitted', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('km_procurement_app_updated', handleSync);
      window.removeEventListener('km_procurement_app_submitted', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user, farmerPhone]);

  // Live MSP & Scheme Eligibility Check
  const eligibility = checkMspEligibility(selectedCrop, cropVariety, state, harvestSeason);
  const estimatedTotalMsp =
    eligibility.msp_record && declaredQuantity > 0
      ? declaredQuantity * eligibility.msp_record.msp_per_quintal
      : null;

  // Selected Centre
  const selectedCentre = centres.find((c) => c.id === preferredCentreId);

  // Handle Application Submit
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (hasAadhaarDbt !== true) {
      setSubmitError(
        'Government procurement requires an affirmative declaration that your bank account is linked with Aadhaar and enabled for Direct Benefit Transfer (DBT).'
      );
      return;
    }

    if (!farmerName.trim() || !farmerPhone.trim()) {
      setSubmitError('Please enter your full name and 10-digit mobile number.');
      return;
    }

    if (!declaredQuantity || declaredQuantity <= 0) {
      setSubmitError('Please enter a valid produce quantity in quintals.');
      return;
    }

    setSubmitting(true);
    try {
      const farmerId = user?.id || `farmer-${farmerPhone.trim()}`;
      const res = await submitProcurementApplication({
        farmer_id: farmerId,
        farmer_name: farmerName.trim(),
        farmer_phone: farmerPhone.trim(),
        crop_name: selectedCrop,
        crop_variety: cropVariety,
        declared_quantity_quintals: declaredQuantity,
        proposed_inspection_quantity_quintals: declaredQuantity,
        harvest_date: harvestDate,
        harvest_season: harvestSeason,
        village: village.trim(),
        taluka: taluka.trim(),
        district: district.trim(),
        state: state.trim(),
        preferred_procurement_centre_id: preferredCentreId || undefined,
        preferred_centre_name: selectedCentre?.centre_name,
        procurement_agency_id: selectedCentre?.agency_id,
        procurement_scheme_id: eligibility.scheme?.id,
        has_aadhaar_dbt_bank_account: true,
      });

      if (!res.success || !res.application) {
        setSubmitError(res.error || 'Failed to submit government procurement application.');
        setSubmitting(false);
        return;
      }

      setSubmitSuccess(res.application);
      setApplications((prev) => [res.application!, ...prev]);
      setActiveTab('my-applications');
      setSubmitting(false);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred during application submission.');
      setSubmitting(false);
    }
  };

  // Handle Farmer Complaint Submit
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForComplaint || !complaintDesc.trim()) return;

    setComplaintSubmitting(true);
    try {
      const res = await submitFarmerComplaint({
        application_id: selectedAppForComplaint.id,
        farmer_id: selectedAppForComplaint.farmer_id,
        complaint_category: complaintCategory,
        complaint_description: complaintDesc.trim(),
        related_official_id: selectedAppForComplaint.latest_inspection?.inspecting_official_id,
      });

      if (res.success && res.complaint) {
        setComplaintSuccessId(res.complaint.complaint_number);
        setComplaintDesc('');
      }
    } catch (err) {
      console.error('Complaint submission failed:', err);
    } finally {
      setComplaintSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TOP BANNER: GOVERNMENT PROCUREMENT (MSP) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-sky-950 text-white p-6 sm:p-8 shadow-xl border border-sky-400/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-sky-500/20 text-sky-200 border border-sky-400/30">
              <Landmark className="w-3.5 h-3.5" />
              <span>{t('procurement.eyebrow', language)}</span>
            </div>
            <h2 className="display-font text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {t('procurement.title', language)}
            </h2>
            <p className="text-sm text-sky-100/90 leading-relaxed">
              {t('procurement.subtitle', language)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('apply');
                setSubmitSuccess(null);
              }}
              className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-sky-950 font-bold text-sm shadow-lg hover:shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('procurement.tabApply', language)}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my-applications')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-sky-300" />
              <span>{t('procurement.tabTrack', language)} ({applications.length})</span>
            </button>
          </div>
        </div>

        {/* Status Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'apply'
                ? 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-300/50'
                : 'bg-white/5 text-primary-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>1. {t('procurement.tabApply', language)}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my-applications'
                ? 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-300/50'
                : 'bg-white/5 text-primary-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>2. {t('procurement.tabTrack', language)} ({applications.length})</span>
            {notifications.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('standards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'standards'
                ? 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-300/50'
                : 'bg-white/5 text-primary-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3. {t('procurement.tabStandards', language)}</span>
          </button>
        </div>
      </div>

      {/* ── APPOINTED OFFICER LIVE NOTIFICATION ALERT BANNER ── */}
      {(() => {
        const appointedApp =
          applications.find(
            (a) =>
              (a.application_status === 'inspection_scheduled' || a.application_status === 'inspection_rescheduled') &&
              (a.assigned_official_name || a.latest_appointment?.assigned_official_name)
          ) ||
          applications.find((a) => a.assigned_official_name || a.latest_appointment?.assigned_official_name);
        if (!appointedApp) return null;

        const officerName = appointedApp.assigned_official_name || appointedApp.latest_appointment?.assigned_official_name;
        const officerEmpId = appointedApp.assigned_official_employee_id || appointedApp.latest_appointment?.assigned_official_employee_id;
        const officerDesig = appointedApp.assigned_official_designation || appointedApp.latest_appointment?.assigned_official_designation;
        const officerDept = appointedApp.assigned_official_department || appointedApp.latest_appointment?.assigned_official_department;
        const officerPhone = appointedApp.assigned_official_mobile || appointedApp.latest_appointment?.assigned_official_mobile;
        const dateSlot = appointedApp.latest_appointment?.appointment_time_slot || '10:00 AM – 12:00 PM';
        const depotName = appointedApp.preferred_centre_name || appointedApp.latest_appointment?.centre_name || 'Designated Centre';

        return (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-sky-950 to-slate-900 text-white shadow-xl border border-emerald-400/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold shrink-0 mt-0.5">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <UserCheck className="w-3 h-3" />
                  <span>Official Officer Appointed</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {officerName} has been appointed as your Inspection Officer
                </h4>
                <p className="text-xs text-sky-200">
                  {officerDesig} • {officerDept} | Officer ID:{' '}
                  <code className="font-mono text-emerald-300 font-bold">{officerEmpId}</code>
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-sky-100">
                  {officerPhone && (
                    <a href={`tel:${officerPhone}`} className="inline-flex items-center gap-1 font-bold text-emerald-300 hover:underline">
                      <Phone className="w-3 h-3" />
                      <span>{officerPhone}</span>
                    </a>
                  )}
                  <span>•</span>
                  <span>Produce: <strong>{appointedApp.crop_name}</strong></span>
                  <span>•</span>
                  <span>Slot: <strong>{dateSlot}</strong> at <strong>{depotName}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedAppForNotice(appointedApp);
                  setActiveTab('my-applications');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>View Appointment Letter</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
       * TAB 1: NEW APPLICATION FORM
       * ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'apply' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="display-font text-xl sm:text-2xl font-bold text-gray-900">
              Submit Farmer Produce Quality Inspection Application
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Complete your harvest details and choose an authorized government procurement depot. A quality
              inspector will review and issue your scheduled inspection token.
            </p>
          </div>

          {submitError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Submission Error</strong>
                <span>{submitError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleApplicationSubmit} className="space-y-6">
            {/* Section 1: Crop & Operational MSP Price Calculator */}
            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-4">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                <Scale className="w-4 h-4 text-sky-700" />
                <span>Crop Selection & Live Minimum Support Price (MSP) Rates</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="crop-select" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.cropName', language)} *
                  </label>
                  <select
                    id="crop-select"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  >
                    <option value="Wheat">Wheat (गेहूं / गहू)</option>
                    <option value="Paddy (Dhan)">Paddy - Dhan (धान / भात)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Gram (Chana)">Gram - Chana (चना / हरभरा)</option>
                    <option value="Maize">Maize (मक्का / मका)</option>
                    <option value="Cotton">Cotton (कपास / कापूस)</option>
                    <option value="Mustard">Mustard (सरसों / मोहरी)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="crop-variety" className="block text-xs font-bold text-gray-700 mb-1">
                    Quality Variety
                  </label>
                  <input
                    id="crop-variety"
                    type="text"
                    value={cropVariety}
                    onChange={(e) => setCropVariety(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="e.g. FAQ Standard / Grade A"
                  />
                </div>

                <div>
                  <label htmlFor="declared-qty" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.quantityQuintals', language)} *
                  </label>
                  <input
                    id="declared-qty"
                    type="number"
                    min="1"
                    max="5000"
                    value={declaredQuantity}
                    onChange={(e) => setDeclaredQuantity(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-gray-900"
                    placeholder="e.g. 50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="harvest-season" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.harvestSeason', language)}
                  </label>
                  <select
                    id="harvest-season"
                    value={harvestSeason}
                    onChange={(e) => setHarvestSeason(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  >
                    <option value="Rabi 2025-26">Rabi 2025-26</option>
                    <option value="Kharif 2025-26">Kharif 2025-26</option>
                  </select>
                </div>
              </div>

              {/* Dynamic MSP Rate Card */}
              {eligibility.msp_record && (
                <div className="mt-3 p-4 rounded-xl bg-white border border-sky-200 grid sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <span className="text-[11px] text-gray-500 block uppercase font-bold tracking-wider">
                      Official Announced MSP
                    </span>
                    <span className="text-xl font-bold text-sky-900">
                      ₹{eligibility.msp_record.msp_per_quintal.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-gray-600">/ Quintal</span>
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Ref: {eligibility.msp_record.official_notification_number}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-500 block uppercase font-bold tracking-wider">
                      Procurement Agency & Scheme
                    </span>
                    <span className="text-xs font-bold text-gray-900 block">
                      {eligibility.scheme?.agency_name || 'Central Procurement Agency'}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active Operations
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[11px] text-gray-500 block uppercase font-bold tracking-wider">
                      Est. Total MSP Value
                    </span>
                    <span className="text-xl font-extrabold text-emerald-700">
                      {estimatedTotalMsp ? `₹${estimatedTotalMsp.toLocaleString('en-IN')}` : '–'}
                    </span>
                    <span className="text-[10px] text-gray-400 block">for {declaredQuantity} Quintals</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Farmer & Farm Location Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Farmer Identification & Farm Location</span>
              </h4>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="farmer-name" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.farmerName', language)} *
                  </label>
                  <input
                    id="farmer-name"
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="e.g. Rajeshwar Patil"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="farmer-phone" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.mobileNumber', language)} *
                  </label>
                  <input
                    id="farmer-phone"
                    type="tel"
                    pattern="[0-9]{10}"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="harvest-date" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.harvestDate', language)} *
                  </label>
                  <input
                    id="harvest-date"
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="village" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.village', language)} *
                  </label>
                  <input
                    id="village"
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="Village"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="taluka" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.taluka', language)} *
                  </label>
                  <input
                    id="taluka"
                    type="text"
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="Taluka"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="district" className="block text-xs font-bold text-gray-700 mb-1">
                    {t('procurement.district', language)} & State *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="district"
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      placeholder="District"
                      required
                    />
                    <input
                      id="state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Preferred Government Procurement Centre Selection */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-700" />
                <span>Preferred Authorized Government Procurement Centre *</span>
              </h4>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {centres.map((centre) => {
                  const isSelected = centre.id === preferredCentreId;
                  return (
                    <button
                      key={centre.id}
                      type="button"
                      onClick={() => setPreferredCentreId(centre.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/80 shadow-md ring-2 ring-sky-300/60'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-100 text-sky-900">
                            {centre.agency_name}
                          </span>
                          <span className="text-[10px] text-gray-500">{centre.district}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 leading-snug">{centre.centre_name}</p>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{centre.complete_address}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Depot
                        </span>
                        <span className="text-gray-400">Tel: {centre.contact_number}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
             * MANDATORY AADHAAR-SEEDED DBT BANK DECLARATION (STRICT YES/NO)
             * Under no circumstances collect Aadhaar number or bank credentials
             * ══════════════════════════════════════════════════════════════════ */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-950">
                    Mandatory Aadhaar-Seeded DBT Bank Account Declaration *
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Under Government of India procurement regulations, all Minimum Support Price (MSP) disbursements
                    are credited directly to the farmer&apos;s bank account linked with Aadhaar through the Public
                    Financial Management System (PFMS Direct Benefit Transfer). Intermediate or cash payments are
                    strictly prohibited.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-semibold text-gray-900">
                  <input
                    type="radio"
                    name="aadhaar-dbt-declaration"
                    checked={hasAadhaarDbt === true}
                    onChange={() => setHasAadhaarDbt(true)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <span>YES — My bank account is linked with Aadhaar and enabled for PFMS DBT.</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-semibold text-gray-900">
                  <input
                    type="radio"
                    name="aadhaar-dbt-declaration"
                    checked={hasAadhaarDbt === false}
                    onChange={() => setHasAadhaarDbt(false)}
                    className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                  />
                  <span>NO — I do not currently have an active Aadhaar-seeded DBT bank account.</span>
                </label>
              </div>

              {/* Blocking notice if NO is selected */}
              {hasAadhaarDbt === false && (
                <div className="mt-3 p-3.5 rounded-xl bg-red-100/90 border border-red-300 text-red-950 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Submission Blocked:</strong>
                    <span>
                      Without an active Aadhaar-seeded DBT bank account, government procurement funds cannot be
                      electronically transferred. Please visit your nearest bank branch to link your Aadhaar card and
                      enable DBT under PFMS before submitting this application.
                    </span>
                  </div>
                </div>
              )}

              {/* Privacy Shield Disclaimer */}
              <div className="pt-1 text-[11px] text-amber-800/90 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>Farmer Privacy Protected:</strong> Kisan Mitra never asks for or stores your 12-digit
                  Aadhaar number, card photo, OTP, bank account number, or IFSC. Only this affirmative declaration is
                  recorded.
                </span>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting || hasAadhaarDbt !== true}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 ${
                  hasAadhaarDbt === true && !submitting
                    ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer hover:shadow-sky-500/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'hi' ? 'आवेदन केंद्रीय पोर्टल पर जमा हो रहा है...' : language === 'mr' ? 'अर्ज मध्यवर्ती प्रणालीत सादर होत आहे...' : language === 'gu' ? 'અરજી કેન્દ્રીય પોર્ટલ પર સબમિટ થઈ રહી છે...' : language === 'pa' ? 'ਅਰਜ਼ੀ ਕੇਂਦਰੀ ਪੋਰਟਲ \'ਤੇ ਜਮ੍ਹਾਂ ਹੋ ਰਹੀ ਹੈ...' : 'Submitting Application to Central Registry...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{t('procurement.submitBtn', language)}</span>
                  </>
                )}
              </button>

              {hasAadhaarDbt !== true && (
                <p className="text-center text-[11px] text-gray-500 mt-2">
                  Please confirm the Aadhaar-seeded DBT declaration above to unlock application submission.
                </p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
       * TAB 2: MY GOVERNMENT PROCUREMENT APPLICATIONS
       * ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'my-applications' && (
        <div className="space-y-4">
          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">
                  Application Submitted Successfully: {submitSuccess.application_number}
                </h4>
                <p className="text-xs text-emerald-900 mt-0.5">
                  Your application for {submitSuccess.declared_quantity_quintals} Qtl {submitSuccess.crop_name} has been
                  forwarded to {submitSuccess.preferred_centre_name}. An authorized Government Quality Inspector will
                  verify and assign an inspection appointment slot.
                </p>
              </div>
            </div>
          )}

          {applications.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-3">
              <div className="w-14 h-14 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">No Government Procurement Applications Yet</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                You have not submitted any produce for Fair Average Quality (FAQ) government inspection yet. Apply now
                to receive an official inspection token.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('apply')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Apply for MSP Procurement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const status = app.application_status;
                const isApproved = status === 'quality_inspection_approved' || status === 'procurement_completed';
                const isRejected = status === 'quality_inspection_rejected';
                const isRecheck = status === 'reinspection_required';
                const isScheduled = status === 'inspection_scheduled' || status === 'inspection_rescheduled';

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-gray-100 hover:border-sky-200 transition-all space-y-4"
                  >
                    {/* Top Row: Application Number & Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-sky-100 text-sky-950 border border-sky-200">
                          {app.application_number}
                        </span>
                        <span className="text-xs text-gray-500">
                          Submitted on {new Date(app.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            QUALITY APPROVED
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                            <AlertCircle className="w-3.5 h-3.5 text-red-700" />
                            INSPECTION REJECTED
                          </span>
                        ) : isRecheck ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            <Clock className="w-3.5 h-3.5 text-purple-700" />
                            RECHECK REQUIRED
                          </span>
                        ) : isScheduled ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
                            <Calendar className="w-3.5 h-3.5 text-sky-700" />
                            INSPECTION APPOINTMENT ISSUED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            AWAITING OFFICIAL REVIEW
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Crop & Depot Details */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block">Commodity & Variety</span>
                        <strong className="text-gray-900 text-sm font-bold block">{app.crop_name}</strong>
                        <span className="text-gray-600">{app.crop_variety}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block">Declared Quantity</span>
                        <strong className="text-gray-900 text-sm font-bold block">
                          {app.declared_quantity_quintals} Quintals
                        </strong>
                        <span className="text-gray-600">Season: {app.harvest_season}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block">Procurement Depot</span>
                        <strong className="text-gray-900 text-xs font-bold block line-clamp-1">
                          {app.preferred_centre_name || 'Central Depot'}
                        </strong>
                        <span className="text-gray-600">{app.district}, {app.state}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block">DBT Bank Status</span>
                        <span className="text-emerald-700 font-bold inline-flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aadhaar DBT Declared
                        </span>
                      </div>
                    </div>

                    {/* Appointed Inspection Officer Card */}
                    {(app.assigned_official_name || app.latest_appointment?.assigned_official_name) && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-md border border-sky-400/30 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-sky-400 text-sky-950 flex items-center justify-center font-bold">
                              <BadgeCheck className="w-5 h-5 text-sky-950" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                                Government Appointed Inspection Officer
                              </span>
                              <h5 className="font-extrabold text-sm text-white">
                                {app.assigned_official_name || app.latest_appointment?.assigned_official_name}
                              </h5>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-400/20 text-sky-200 border border-sky-400/40 font-mono">
                              ID: {app.assigned_official_employee_id || app.latest_appointment?.assigned_official_employee_id || 'OFF-VERIFIED'}
                            </span>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-sky-300/80 block text-[10px] uppercase font-bold">Official Designation & Department</span>
                            <strong className="text-white block font-semibold">
                              {app.assigned_official_designation || app.latest_appointment?.assigned_official_designation || 'Quality Inspection Officer'}
                            </strong>
                            <span className="text-sky-200/70 text-[11px] block">
                              {app.assigned_official_department || app.latest_appointment?.assigned_official_department || 'Food & Civil Supplies / APMC'}
                            </span>
                          </div>

                          <div>
                            <span className="text-sky-300/80 block text-[10px] uppercase font-bold">Official Direct Contact</span>
                            {(() => {
                              const phone = app.assigned_official_mobile || app.latest_appointment?.assigned_official_mobile || '+919822188410';
                              return (
                                <a
                                  href={`tel:${phone}`}
                                  className="inline-flex items-center gap-1.5 text-sky-300 hover:text-white font-bold text-xs mt-0.5 underline transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                                  <span>{phone}</span>
                                </a>
                              );
                            })()}
                            <span className="text-[10px] text-sky-200/60 block mt-0.5">Authorised Government Inspector</span>
                          </div>

                          <div>
                            <span className="text-sky-300/80 block text-[10px] uppercase font-bold">Assigned Inspection Slot</span>
                            <strong className="text-white block font-semibold">
                              {app.latest_appointment?.appointment_time_slot || '10:00 AM – 12:00 PM'}
                            </strong>
                            <span className="text-sky-200/70 text-[11px] block">
                              {new Date(app.latest_appointment?.appointment_date || app.latest_appointment?.inspection_date || app.created_at).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inspection Appointment Notice (if scheduled) */}
                    {app.latest_appointment && (
                      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-sky-900 text-sm">
                            <Calendar className="w-4 h-4 text-sky-700" />
                            <span>Confirmed Physical Inspection Slot</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedAppForNotice(app)}
                            className="font-bold text-sky-700 hover:text-sky-900 underline text-xs cursor-pointer"
                          >
                            View Official Letter
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-2 pt-1 font-medium">
                          <div>
                            <span className="text-sky-700 block text-[11px]">Reporting Date:</span>
                            <strong className="text-gray-900">
                              {new Date(app.latest_appointment.appointment_date || app.latest_appointment.inspection_date).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </strong>
                          </div>
                          <div>
                            <span className="text-sky-700 block text-[11px]">Reporting Time Slot:</span>
                            <strong className="text-gray-900">
                              {app.latest_appointment.appointment_time_slot}
                            </strong>
                          </div>
                          <div>
                            <span className="text-sky-700 block text-[11px]">Depot / Location:</span>
                            <strong className="text-gray-900 line-clamp-1">
                              {app.latest_appointment.centre_name}
                            </strong>
                          </div>
                        </div>

                        {app.latest_appointment.instructions_for_farmer && (
                          <p className="text-[11px] text-sky-900/90 pt-1 border-t border-sky-200/60">
                            <strong>Official Instructions:</strong> {app.latest_appointment.instructions_for_farmer}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Rejection / Recheck Alert if present */}
                    {isRejected && app.latest_inspection?.rejection_reason && (
                      <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs space-y-1">
                        <strong className="font-bold flex items-center gap-1.5 text-red-900">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          Official Rejection Grounds:
                        </strong>
                        <p className="text-red-900/90 pl-5">{app.latest_inspection.rejection_reason}</p>
                      </div>
                    )}

                    {isRecheck && app.latest_inspection?.reinspection_reason && (
                      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs space-y-1">
                        <strong className="font-bold flex items-center gap-1.5 text-purple-900">
                          <Clock className="w-4 h-4 text-purple-600" />
                          Official Recheck Instructions:
                        </strong>
                        <p className="text-purple-900/90 pl-5">{app.latest_inspection.reinspection_reason}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => setSelectedAppForReport(app)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Download Digital FAQ Inspection Certificate</span>
                          </button>
                        )}

                        {isScheduled && !isApproved && (
                          <button
                            type="button"
                            onClick={() => setSelectedAppForNotice(app)}
                            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>View Appointment Pass</span>
                          </button>
                        )}
                      </div>

                      {/* Grievance / Complaint Trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAppForComplaint(app);
                          setComplaintSuccessId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                        <span>File Grievance / Dispute</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
       * TAB 3: FAQ QUALITY STANDARDS & ANNOUNCED RATES REFERENCE
       * ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'standards' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div>
            <h3 className="display-font text-xl sm:text-2xl font-bold text-gray-900">
              Official Fair Average Quality (FAQ) Standards & Minimum Support Prices
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Procurement agencies accept produce conforming to uniform specifications notified by the Department of
              Food & Public Distribution (DFPD) and NAFED. Check permissible limits before bringing your harvest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {['Wheat', 'Paddy (Dhan)', 'Soybean', 'Gram (Chana)'].map((cropName) => {
              const standards = DEFAULT_FAQ_STANDARDS.filter(
                (s) => s.crop_name.toLowerCase() === cropName.toLowerCase()
              );
              const msp = mspRecords.find((m) => m.crop_name.toLowerCase() === cropName.toLowerCase());

              return (
                <div key={cropName} className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                    <div>
                      <h4 className="font-bold text-base text-gray-900">{cropName}</h4>
                      <span className="text-[11px] text-gray-500">FAQ Uniform Specifications</span>
                    </div>
                    {msp && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          MSP: ₹{msp.msp_per_quintal.toLocaleString('en-IN')}/Qtl
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{msp.marketing_season}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {standards.map((std) => (
                      <div
                        key={std.id}
                        className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-gray-700 font-medium">{std.parameter_name}</span>
                        <span className="font-bold text-gray-900">
                          {std.permissible_maximum !== null ? `Max ${std.permissible_maximum} ${std.unit}` : ''}
                          {std.permissible_minimum !== null ? `Min ${std.permissible_minimum} ${std.unit}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
       * MODAL 1: OFFICIAL NOTIFICATION LETTER (EXACT REQUIRED FORMAT)
       * ══════════════════════════════════════════════════════════════════════ */}
      {selectedAppForNotice && (() => {
        const apptDateStr = selectedAppForNotice.latest_appointment?.appointment_date || selectedAppForNotice.latest_appointment?.inspection_date || selectedAppForNotice.created_at;
        const apptTimeSlot = selectedAppForNotice.latest_appointment?.appointment_time_slot || selectedAppForNotice.latest_appointment?.inspection_time || '10:00 AM – 12:00 PM';
        const apptCentreName = selectedAppForNotice.latest_appointment?.centre_name || selectedAppForNotice.preferred_centre_name || 'Designated Government Procurement Depot';
        const apptInstructions = selectedAppForNotice.latest_appointment?.instructions_for_farmer || selectedAppForNotice.latest_appointment?.additional_instructions || 'Please ensure your produce is free from excessive foreign matter and moisture. Arrive 15 minutes before your time slot with your land 7/12 extract and Aadhaar-linked DBT passbook copy.';

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-sky-700" />
                  <h4 className="font-bold text-base text-gray-900">Official Government Inspection Notice</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAppForNotice(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Exact Required Letter Format */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                {`DEAR FARMER ${selectedAppForNotice.farmer_name.toUpperCase()},

You are requested to bring your agricultural produce for quality inspection on ${new Date(apptDateStr).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} at ${apptTimeSlot} to ${apptCentreName}.

PRODUCE DETAILS:
– Crop: ${selectedAppForNotice.crop_name} (${selectedAppForNotice.crop_variety})
– Declared Quantity: ${selectedAppForNotice.declared_quantity_quintals} Quintals
– Application ID: ${selectedAppForNotice.application_number}
– Centre Bay / Address: ${selectedAppForNotice.preferred_centre_name || 'Designated Yard'}

APPOINTED QUALITY INSPECTOR:
– Officer Name: ${selectedAppForNotice.assigned_official_name || selectedAppForNotice.latest_appointment?.assigned_official_name || 'Designated Quality Officer'}
– Designation: ${selectedAppForNotice.assigned_official_designation || selectedAppForNotice.latest_appointment?.assigned_official_designation || 'Government Quality Inspector'}
– Official Employee ID: ${selectedAppForNotice.assigned_official_employee_id || selectedAppForNotice.latest_appointment?.assigned_official_employee_id || 'FCI-MH-2024'}
– Department / Agency: ${selectedAppForNotice.assigned_official_department || selectedAppForNotice.latest_appointment?.assigned_official_department || 'Food Corporation of India'}
– Direct Contact: ${selectedAppForNotice.assigned_official_mobile || selectedAppForNotice.latest_appointment?.assigned_official_mobile || '+919822188410'}

IMPORTANT INSTRUCTIONS:
${apptInstructions}

– KISAN MITRA GOVERNMENT PROCUREMENT SYSTEM`}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForNotice(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold"
                >
                  Close Pass
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Notice</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
       * MODAL 2: DIGITAL FAQ INSPECTION REPORT & CERTIFICATE
       * ══════════════════════════════════════════════════════════════════════ */}
      {selectedAppForReport && selectedAppForReport.latest_inspection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 my-8">
            {/* Certificate Header */}
            <div className="text-center border-b-2 border-gray-900 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-widest">
                <Landmark className="w-4 h-4 text-gray-900" />
                <span>Government Agricultural Produce Procurement Operations</span>
              </div>
              <h3 className="display-font text-xl sm:text-2xl font-extrabold text-gray-900">
                FAIR AVERAGE QUALITY (FAQ) PHYSICAL INSPECTION CERTIFICATE
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                Certificate Ref: {selectedAppForReport.latest_inspection.inspection_reference_number} | Application:{' '}
                {selectedAppForReport.application_number}
              </p>
            </div>

            {/* Farmer & Lot Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Farmer Name</span>
                <strong className="text-gray-900">{selectedAppForReport.farmer_name}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Mobile</span>
                <strong className="text-gray-900">{selectedAppForReport.farmer_phone}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Commodity</span>
                <strong className="text-gray-900">
                  {selectedAppForReport.crop_name} ({selectedAppForReport.crop_variety})
                </strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Inspected Qty</span>
                <strong className="text-emerald-700">
                  {selectedAppForReport.latest_inspection.inspected_quantity_quintals} Quintals
                </strong>
              </div>
            </div>

            {/* Parameter Measurements Table */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Conducted Quality Parameter Readings
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Quality Parameter</th>
                      <th className="py-2.5 px-3">Standard FAQ Limit</th>
                      <th className="py-2.5 px-3">Measured Value</th>
                      <th className="py-2.5 px-3">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(selectedAppForReport.latest_inspection.parameters_tested || selectedAppForReport.latest_inspection.parameters || []).map((param, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">{param.parameter_name}</td>
                        <td className="py-2 px-3 text-gray-600">
                          {param.permissible_maximum !== null ? `Max ${param.permissible_maximum} ${param.unit}` : ''}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-gray-900">
                          {param.measured_value} {param.unit}
                        </td>
                        <td className="py-2 px-3">
                          {param.result === 'PASS' ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              ✓ PASS
                            </span>
                          ) : (
                            <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                              ✗ FAIL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inspection Decision & Seal */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">
                  Final Inspection Verdict
                </span>
                <h4 className="text-xl font-extrabold text-emerald-900">
                  {selectedAppForReport.latest_inspection.decision}ED FOR GOVERNMENT PROCUREMENT
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Inspected By: {selectedAppForReport.latest_inspection.inspecting_official_name} (
                  {selectedAppForReport.latest_inspection.inspecting_official_designation})
                </p>
              </div>

              <div className="text-right text-[11px] text-gray-500 font-mono">
                <span>Digital Verification Seal:</span>
                <div className="font-bold text-gray-900">KM-GOVT-VERIFIED-2026</div>
                <span>Date: {new Date(selectedAppForReport.latest_inspection.inspected_at || selectedAppForReport.latest_inspection.created_at).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Statutory Disclaimer */}
            <p className="text-[10px] text-gray-400 italic text-center">
              Statutory Disclaimer: This physical inspection certificate confirms compliance with Fair Average Quality
              (FAQ) standards only. Minimum Support Price funds are credited independently via PFMS Aadhaar DBT into the
              farmer&apos;s verified bank account. Kisan Mitra does not collect, hold, or process financial transactions.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedAppForReport(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold"
              >
                Close Certificate
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
       * MODAL 3: FARMER GRIEVANCE / COMPLAINT SUBMISSION
       * ══════════════════════════════════════════════════════════════════════ */}
      {selectedAppForComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-base text-gray-900">Submit Procurement Grievance / Appeal</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppForComplaint(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {complaintSuccessId ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Grievance Registered: {complaintSuccessId}</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your formal grievance has been recorded in the central anti-corruption and quality review registry. An
                  appointed supervisory officer will examine your inspection readings and notify you within 48 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedAppForComplaint(null)}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <span className="text-gray-500 block">Regarding Application:</span>
                  <strong className="text-gray-900">
                    {selectedAppForComplaint.application_number} — {selectedAppForComplaint.crop_name} (
                    {selectedAppForComplaint.declared_quantity_quintals} Qtl)
                  </strong>
                </div>

                <div>
                  <label htmlFor="complaint-cat" className="block text-xs font-bold text-gray-700 mb-1">
                    Grievance Category *
                  </label>
                  <select
                    id="complaint-cat"
                    value={complaintCategory}
                    onChange={(e) =>
                      setComplaintCategory(
                        e.target.value as
                          | 'QUALITY_DISPUTE'
                          | 'OFFICER_MISCONDUCT'
                          | 'DELAY'
                          | 'WEIGHMENT_DISPUTE'
                          | 'REJECTION_APPEAL'
                      )
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                  >
                    <option value="QUALITY_DISPUTE">Quality Assessment Dispute (FAQ Measurements)</option>
                    <option value="REJECTION_APPEAL">Appeal Against Produce Rejection</option>
                    <option value="OFFICER_MISCONDUCT">Official Misconduct / Harassment / Demand</option>
                    <option value="DELAY">Undue Delay in Inspection / Gate Entry</option>
                    <option value="WEIGHMENT_DISPUTE">Weighbridge Measurement Discrepancy</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="complaint-desc" className="block text-xs font-bold text-gray-700 mb-1">
                    Detailed Explanation of Grievance *
                  </label>
                  <textarea
                    id="complaint-desc"
                    rows={4}
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    placeholder="Describe the discrepancy, official readings, or incident in detail..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAppForComplaint(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={complaintSubmitting || !complaintDesc.trim()}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
                  >
                    {complaintSubmitting ? 'Registering...' : 'Register Formal Grievance'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
