'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Landmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  LogOut,
  Search,
  Scale,
  Printer,
  X,
  History,
  MessageSquare,
  BadgeCheck,
  RefreshCw,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import {
  getCurrentGovernmentOfficialSession,
  logoutGovernmentOfficial,
  getAllProcurementApplications,
  scheduleInspectionAppointment,
  submitQualityInspectionDecision,
  getQualityStandardsForCrop,
  evaluateParameterResult,
  getProcurementAuditLogs,
  getAllComplaints,
  updateComplaintStatus,
  getAllAvailableInspectors,
  appointOfficerToApplication,
  resetAndSeedProcurementQueue,
  AvailableInspector,
  GovernmentOfficialSession,
  ProcurementApplication,
  CropQualityStandard,
  ProcurementAuditLog,
  FarmerComplaint,
  InspectionRecord,
  InspectionReport,
} from '@/lib/government-procurement-service';

export default function GovernmentDashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<GovernmentOfficialSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab State: 'queue' | 'audit' | 'complaints'
  const [activeTab, setActiveTab] = useState<'queue' | 'audit' | 'complaints'>('queue');

  // Application Data & Filters
  const [applications, setApplications] = useState<ProcurementApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [auditLogs, setAuditLogs] = useState<ProcurementAuditLog[]>([]);
  const [complaints, setComplaints] = useState<FarmerComplaint[]>([]);

  // Modal States
  const [schedulingApp, setSchedulingApp] = useState<ProcurementApplication | null>(null);
  const [inspectingApp, setInspectingApp] = useState<ProcurementApplication | null>(null);
  const [viewingReportApp, setViewingReportApp] = useState<ProcurementApplication | null>(null);
  const [reviewingComplaint, setReviewingComplaint] = useState<FarmerComplaint | null>(null);

  // Scheduling Form State
  const [apptDate, setApptDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [apptSlot, setApptSlot] = useState('09:30 AM – 11:30 AM');
  const [apptInstructions, setApptInstructions] = useState(
    'Please bring clean produce, vehicle gate pass, land 7/12 extract, and DBT-enabled bank passbook copy. Report 15 minutes before your slot.'
  );
  const [schedulingSubmitting, setSchedulingSubmitting] = useState(false);
  const [scheduledNotice, setScheduledNotice] = useState<string | null>(null);
  const [inspectors, setInspectors] = useState<AvailableInspector[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');

  // Inspection Form State
  const [standards, setStandards] = useState<CropQualityStandard[]>([]);
  const [parameterReadings, setParameterReadings] = useState<Record<string, number>>({});
  const [inspectedQty, setInspectedQty] = useState<number>(50);
  const [sealNumber, setSealNumber] = useState('');
  const [observationNotes, setObservationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [recheckReason, setRecheckReason] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionSuccess, setDecisionSuccess] = useState<{
    record: InspectionRecord;
    report?: InspectionReport;
  } | null>(null);

  // Complaint Review State
  const [complaintReviewNotes, setComplaintReviewNotes] = useState('');
  const [complaintStatusUpdate, setComplaintStatusUpdate] = useState<'investigation_pending' | 'resolved' | 'dismissed'>('resolved');

  // Verify Official Authentication on Mount
  useEffect(() => {
    const current = getCurrentGovernmentOfficialSession();
    if (!current) {
      router.push('/login?role=government');
      return;
    }
    const timer = setTimeout(() => {
      setSession(current);
      const allInspectors = getAllAvailableInspectors();
      setInspectors(allInspectors);
      setSelectedOfficerId(current.official.id);
      let apps = getAllProcurementApplications();
      if (!apps || apps.length === 0) {
        apps = resetAndSeedProcurementQueue();
      }
      setApplications(apps);
      setAuditLogs(getProcurementAuditLogs());
      setComplaints(getAllComplaints());
      setLoading(false);
    }, 0);

    const handleSync = () => {
      setApplications(getAllProcurementApplications());
      setAuditLogs(getProcurementAuditLogs());
      setComplaints(getAllComplaints());
    };

    window.addEventListener('km_procurement_app_submitted', handleSync);
    window.addEventListener('km_procurement_app_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('km_procurement_app_submitted', handleSync);
      window.removeEventListener('km_procurement_app_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [router]);

  const refreshData = () => {
    const apps = getAllProcurementApplications();
    setApplications(apps);
    setAuditLogs(getProcurementAuditLogs());
    setComplaints(getAllComplaints());
  };

  const handleQuickAssignToMe = (app: ProcurementApplication) => {
    if (!session) return;
    appointOfficerToApplication(app.id, session.official.id);
    refreshData();
  };

  const handleResetQueue = () => {
    const fresh = resetAndSeedProcurementQueue();
    setApplications(fresh);
  };

  const handleLogout = () => {
    logoutGovernmentOfficial();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('km_govt_sync'));
    }
    router.push('/login?role=government');
  };

  // Open Inspection Modal & Load Standard Parameters for the Crop
  const openInspectionModal = (app: ProcurementApplication) => {
    setInspectingApp(app);
    setInspectedQty(app.declared_quantity_quintals);
    setSealNumber(`SEAL-${app.id.slice(-6).toUpperCase()}`);
    setObservationNotes('Lot uniformly sampled. Moisture and physical admixtures tested per FAQ guidelines.');
    setRejectionReason('');
    setRecheckReason('');
    setDecisionError(null);
    setDecisionSuccess(null);

    const cropStds = getQualityStandardsForCrop(app.crop_name);
    setStandards(cropStds);

    // Initial default readings within normal limits for convenience
    const initialReadings: Record<string, number> = {};
    cropStds.forEach((s) => {
      if (s.parameter_name.toLowerCase().includes('moisture')) {
        initialReadings[s.id] = (s.permissible_maximum ?? 12) - 0.8;
      } else if (s.permissible_maximum !== null) {
        initialReadings[s.id] = Math.max(0.1, Number((s.permissible_maximum * 0.4).toFixed(2)));
      } else {
        initialReadings[s.id] = 0;
      }
    });
    setParameterReadings(initialReadings);
  };

  // Handle Scheduling Form Submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp || !session) return;

    setSchedulingSubmitting(true);
    try {
      const res = await scheduleInspectionAppointment({
        application_id: schedulingApp.id,
        official_id: selectedOfficerId || session.official.id,
        appointment_date: apptDate,
        appointment_time_slot: apptSlot,
        centre_name: schedulingApp.preferred_centre_name || session.official.assigned_procurement_centre_name || 'Designated Centre',
        centre_id: schedulingApp.preferred_procurement_centre_id || session.official.assigned_procurement_centre_id,
        instructions_for_farmer: apptInstructions,
      });

      if (res.success) {
        setScheduledNotice(res.notificationMessage || null);
        refreshData();
      }
    } catch (err) {
      console.error('Scheduling failed:', err);
    } finally {
      setSchedulingSubmitting(false);
    }
  };

  // Handle Official Decision Submit (APPROVE, REJECT, RECHECK)
  const handleDecisionSubmit = async (decision: 'APPROVE' | 'REJECT' | 'RECHECK') => {
    if (!inspectingApp || !session) return;
    setDecisionError(null);

    if (decision === 'REJECT' && !rejectionReason.trim()) {
      setDecisionError('A clear and specific rejection reason is mandatory for audit accountability.');
      return;
    }

    if (decision === 'RECHECK' && !recheckReason.trim()) {
      setDecisionError('Detailed instructions for recheck / drying are mandatory when requesting re-inspection.');
      return;
    }

    setDecisionSubmitting(true);
    try {
      // Assemble parameter results
      const paramsTested = standards.map((std) => {
        const measured = parameterReadings[std.id] ?? 0;
        const result = evaluateParameterResult(measured, std.permissible_minimum, std.permissible_maximum);
        return {
          parameter_id: std.id,
          parameter_name: std.parameter_name,
          unit: std.unit,
          permissible_minimum: std.permissible_minimum,
          permissible_maximum: std.permissible_maximum,
          measured_value: measured,
          result,
        };
      });

      const res = await submitQualityInspectionDecision({
        application_id: inspectingApp.id,
        decision,
        inspected_quantity_quintals: inspectedQty,
        parameters_tested: paramsTested,
        sample_seal_number: sealNumber,
        observation_remarks: observationNotes,
        rejection_reason: decision === 'REJECT' ? rejectionReason : undefined,
        reinspection_reason: decision === 'RECHECK' ? recheckReason : undefined,
      });

      if (res.success && res.record) {
        setDecisionSuccess({ record: res.record, report: res.report });
        refreshData();
      } else {
        setDecisionError(res.error || 'Failed to submit inspection decision.');
      }
    } catch (err: unknown) {
      setDecisionError(err instanceof Error ? err.message : 'Error submitting inspection decision.');
    } finally {
      setDecisionSubmitting(false);
    }
  };

  // Handle Complaint Review Submit
  const handleComplaintReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingComplaint || !session || !complaintReviewNotes.trim()) return;

    updateComplaintStatus(
      reviewingComplaint.id,
      complaintStatusUpdate,
      complaintReviewNotes.trim(),
      session.official.id
    );
    setReviewingComplaint(null);
    setComplaintReviewNotes('');
    refreshData();
  };

  if (loading || !session) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-sky-400 border-t-sky-700 rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  // Filtered Applications
  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'mine') {
      const isMine =
        app.assigned_official_id === session?.official.id ||
        app.assigned_official_employee_id === session?.official.employee_id ||
        app.latest_appointment?.assigned_official_id === session?.official.id ||
        app.latest_appointment?.assigned_official_employee_id === session?.official.employee_id;
      if (!isMine) return false;
    } else if (statusFilter === 'unassigned') {
      const isAssigned = Boolean(
        app.assigned_official_name || app.latest_appointment?.assigned_official_name
      );
      if (isAssigned) return false;
    } else if (statusFilter !== 'all' && app.application_status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.application_number.toLowerCase().includes(q) ||
        app.farmer_name.toLowerCase().includes(q) ||
        app.farmer_phone.includes(q) ||
        app.crop_name.toLowerCase().includes(q) ||
        Boolean(app.assigned_official_name && app.assigned_official_name.toLowerCase().includes(q)) ||
        Boolean(app.latest_appointment?.assigned_official_name && app.latest_appointment.assigned_official_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // KPIs
  const totalApps = applications.length;
  const awaitingReviewCount = applications.filter(
    (a) => a.application_status === 'submitted' || a.application_status === 'awaiting_review'
  ).length;
  const scheduledCount = applications.filter(
    (a) => a.application_status === 'inspection_scheduled' || a.application_status === 'inspection_rescheduled'
  ).length;
  const approvedCount = applications.filter(
    (a) => a.application_status === 'quality_inspection_approved' || a.application_status === 'procurement_completed'
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.application_status === 'quality_inspection_rejected'
  ).length;
  const recheckCount = applications.filter(
    (a) => a.application_status === 'reinspection_required'
  ).length;

  return (
    <PageContainer>
      <div className="py-6 sm:py-8 max-w-7xl mx-auto space-y-6">
        
        {/* ── TOP BANNER: OFFICIAL VERIFICATION & DEPOT HEADER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-primary-950 text-white p-6 sm:p-8 shadow-2xl border border-sky-400/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 text-sky-950 flex items-center justify-center font-bold shadow-lg shrink-0 mt-1">
                <Landmark className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-400/20 text-sky-200 border border-sky-400/30">
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Verified Government Procurement Inspector</span>
                </div>
                <h1 className="display-font text-2xl sm:text-3xl font-extrabold text-white">
                  {session.official.full_name}
                </h1>
                <p className="text-xs sm:text-sm text-sky-200">
                  {session.official.designation} • {session.official.procurement_agency_name}
                </p>
                <p className="text-xs text-sky-300/80">
                  Employee ID: <code className="font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">{session.official.employee_id}</code> | Assigned Depot: <strong>{session.official.assigned_procurement_centre_name}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetQueue}
                title="Reload and reseed procurement queue from system registry"
                className="px-3.5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-100 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
                <span>Refresh / Reseed Queue</span>
              </button>
              <Link
                href="/procurement"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4 text-sky-300" />
                <span>Farmer MSP Portal</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-200 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Official Portal</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'queue'
                  ? 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-300/50'
                  : 'bg-white/5 text-primary-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspection Queue ({applications.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-300/50'
                  : 'bg-white/5 text-primary-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Immutable Audit Logs ({auditLogs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'complaints'
                  ? 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-300/50'
                  : 'bg-white/5 text-primary-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Farmer Grievances ({complaints.length})</span>
            </button>
          </div>
        </div>

        {/* ── KPI STATISTIC CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <span className="text-[11px] text-gray-500 uppercase font-bold tracking-wider block">Total Applications</span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{totalApps}</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
            <span className="text-[11px] text-amber-700 uppercase font-bold tracking-wider block">Awaiting Review</span>
            <span className="text-2xl font-extrabold text-amber-900 mt-1 block">{awaitingReviewCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 shadow-sm">
            <span className="text-[11px] text-sky-700 uppercase font-bold tracking-wider block">Scheduled</span>
            <span className="text-2xl font-extrabold text-sky-900 mt-1 block">{scheduledCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
            <span className="text-[11px] text-emerald-700 uppercase font-bold tracking-wider block">Approved FAQ</span>
            <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{approvedCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 shadow-sm">
            <span className="text-[11px] text-red-700 uppercase font-bold tracking-wider block">Rejected FAQ</span>
            <span className="text-2xl font-extrabold text-red-900 mt-1 block">{rejectedCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-sm">
            <span className="text-[11px] text-purple-700 uppercase font-bold tracking-wider block">Recheck Required</span>
            <span className="text-2xl font-extrabold text-purple-900 mt-1 block">{recheckCount}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
         * TAB 1: INSPECTION QUEUE & APPLICATION WORKFLOW
         * ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="display-font text-xl font-bold text-gray-900">
                  Produce Procurement Applications & Inspection Operations
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review farmer applications, issue formal appointment slots, and conduct Fair Average Quality (FAQ) testing.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search application #, farmer, crop..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: 'All Applications', val: 'all' },
                { label: 'Assigned to Me', val: 'mine' },
                { label: 'Pending Officer', val: 'unassigned' },
                { label: 'Awaiting Review', val: 'submitted' },
                { label: 'Inspection Scheduled', val: 'inspection_scheduled' },
                { label: 'Approved', val: 'quality_inspection_approved' },
                { label: 'Rejected', val: 'quality_inspection_rejected' },
                { label: 'Recheck Required', val: 'reinspection_required' },
              ].map((filter) => (
                <button
                  key={filter.val}
                  type="button"
                  onClick={() => setStatusFilter(filter.val)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    statusFilter === filter.val
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Farmer Details</th>
                    <th className="py-3 px-4">Commodity & Quantity</th>
                    <th className="py-3 px-4">Depot & Location</th>
                    <th className="py-3 px-4">Appointed Officer</th>
                    <th className="py-3 px-4">DBT Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Official Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        No procurement applications found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const status = app.application_status;
                      const isApproved = status === 'quality_inspection_approved' || status === 'procurement_completed';
                      const isScheduled = status === 'inspection_scheduled' || status === 'inspection_rescheduled';
                      const isRejected = status === 'quality_inspection_rejected';
                      const isRecheck = status === 'reinspection_required';
                      const isAwaiting = status === 'submitted' || status === 'awaiting_review';

                      const assignedName = app.assigned_official_name || app.latest_appointment?.assigned_official_name;
                      const assignedEmpId = app.assigned_official_employee_id || app.latest_appointment?.assigned_official_employee_id;
                      const assignedDesig = app.assigned_official_designation || app.latest_appointment?.assigned_official_designation;
                      const assignedMobile = app.assigned_official_mobile || app.latest_appointment?.assigned_official_mobile;
                      const isMine =
                        app.assigned_official_id === session.official.id ||
                        assignedEmpId === session.official.employee_id ||
                        app.latest_appointment?.assigned_official_id === session.official.id;

                      return (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-sky-950">
                            {app.application_number}
                            <span className="block text-[10px] text-gray-400 font-normal">
                              {new Date(app.created_at).toLocaleDateString('en-IN')}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <strong className="text-gray-900 block">{app.farmer_name}</strong>
                            <span className="text-gray-500">{app.farmer_phone}</span>
                            <span className="block text-[10px] text-gray-400">
                              {app.village}, {app.taluka}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <strong className="text-gray-900 block">{app.crop_name}</strong>
                            <span className="text-gray-600 font-semibold">
                              {app.declared_quantity_quintals} Quintals
                            </span>
                            <span className="block text-[10px] text-gray-400">{app.crop_variety}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-gray-900 font-medium block line-clamp-1">
                              {app.preferred_centre_name || 'Designated Depot'}
                            </span>
                            <span className="text-[10px] text-gray-500">{app.district}</span>
                          </td>

                          <td className="py-3 px-4">
                            {assignedName ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  {isMine ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                                      <UserCheck className="w-3 h-3 text-sky-700" />
                                      Assigned to You
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                      <ShieldCheck className="w-3 h-3 text-gray-500" />
                                      Appointed
                                    </span>
                                  )}
                                </div>
                                <strong className="block text-gray-900 font-bold leading-tight">{assignedName}</strong>
                                <span className="block text-[10px] text-gray-500 font-mono">
                                  ID: {assignedEmpId || 'OFF-ID'} {assignedMobile ? `• ${assignedMobile}` : ''}
                                </span>
                                {assignedDesig && (
                                  <span className="block text-[10px] text-gray-400 line-clamp-1">{assignedDesig}</span>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  Pending Officer
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAssignToMe(app)}
                                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] shadow-xs transition-all flex items-center gap-1"
                                  title="Assign this inspection directly to your queue"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Assign to Me</span>
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              DBT Affirmative
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {isApproved ? (
                              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px] uppercase">
                                Quality Approved
                              </span>
                            ) : isRejected ? (
                              <span className="font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded text-[10px] uppercase">
                                Rejected
                              </span>
                            ) : isRecheck ? (
                              <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[10px] uppercase">
                                Recheck Needed
                              </span>
                            ) : isScheduled ? (
                              <span className="font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded text-[10px] uppercase">
                                Appointment Issued
                              </span>
                            ) : (
                              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase">
                                Awaiting Review
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isAwaiting && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSchedulingApp(app);
                                    setScheduledNotice(null);
                                    setSelectedOfficerId(app.assigned_official_id || session.official.id);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Schedule Slot</span>
                                </button>
                              )}

                              {(isScheduled || isRecheck) && (
                                <button
                                  type="button"
                                  onClick={() => openInspectionModal(app)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                                >
                                  <Scale className="w-3.5 h-3.5" />
                                  <span>Inspect Quality</span>
                                </button>
                              )}

                              {isApproved && (
                                <button
                                  type="button"
                                  onClick={() => setViewingReportApp(app)}
                                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-all flex items-center gap-1"
                                >
                                  <Printer className="w-3.5 h-3.5 text-gray-600" />
                                  <span>Certificate</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
         * TAB 2: IMMUTABLE AUDIT TRAIL LOGS
         * ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="display-font text-xl font-bold text-gray-900">
                Official Accountability & Anti-Corruption Audit Trail
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Every inspection, appointment assignment, quality approval, and rejection reason is logged with an
                immutable timestamp and actor ID for state agricultural oversight.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 py-6 text-center">No audit logs recorded yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-900 uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-sky-100">
                          {log.action_type}
                        </span>
                        <span className="font-mono text-gray-500 text-[11px]">
                          App ID: {log.application_id || 'N/A'}
                        </span>
                      </div>
                      <p className="text-gray-800 mt-1 font-medium">{log.action_reason || 'Official action logged'}</p>
                    </div>

                    <div className="text-right text-[11px] text-gray-400 font-mono shrink-0">
                      <span>{new Date(log.created_at).toLocaleString('en-IN')}</span>
                      <span className="block text-gray-600">Actor: {log.actor_user_id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
         * TAB 3: FARMER GRIEVANCES & COMPLAINTS REVIEW
         * ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="display-font text-xl font-bold text-gray-900">
                Farmer Quality Discrepancy & Grievance Reviews
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Complaints submitted by farmers regarding FAQ measurements, depot delays, or officer conduct.
              </p>
            </div>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <p className="text-gray-500 py-6 text-center">No farmer grievances registered at this depot.</p>
              ) : (
                complaints.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded">
                          {c.complaint_number}
                        </span>
                        <span className="font-bold text-gray-900">{c.complaint_category}</span>
                      </div>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                          c.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-gray-800 leading-relaxed font-medium">{c.complaint_description}</p>

                    {c.review_notes && (
                      <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-900">
                        <strong>Official Review Notes:</strong> {c.review_notes}
                      </div>
                    )}

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Logged on {new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                      {c.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingComplaint(c);
                            setComplaintReviewNotes('');
                          }}
                          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                        >
                          Review & Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
         * MODAL: SCHEDULE INSPECTION APPOINTMENT
         * ══════════════════════════════════════════════════════════════════════ */}
        {schedulingApp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-700" />
                  <h4 className="font-bold text-base text-gray-900">Assign Physical Inspection Slot</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {scheduledNotice ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Appointment Issued & Farmer Notified</span>
                    </div>
                    <p className="text-xs text-emerald-900 font-mono whitespace-pre-wrap leading-relaxed">
                      {scheduledNotice}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSchedulingApp(null)}
                      className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="text-sky-800 block">Farmer & Application:</span>
                    <strong className="text-sky-950 text-sm font-bold">
                      {schedulingApp.farmer_name} ({schedulingApp.farmer_phone})
                    </strong>
                    <p className="text-sky-900 mt-0.5">
                      Produce: {schedulingApp.crop_name} — {schedulingApp.declared_quantity_quintals} Quintals
                    </p>
                  </div>

                  <div>
                    <label htmlFor="modal-appoint-officer" className="block font-bold text-gray-700 mb-1">
                      Appoint Inspecting Officer *
                    </label>
                    <select
                      id="modal-appoint-officer"
                      value={selectedOfficerId}
                      onChange={(e) => setSelectedOfficerId(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {inspectors.map((insp) => (
                        <option key={insp.id} value={insp.id}>
                          {insp.name} ({insp.employee_id}) — {insp.designation} [{insp.agency_name}]
                        </option>
                      ))}
                    </select>

                    {(() => {
                      const currentInsp = inspectors.find((i) => i.id === selectedOfficerId);
                      if (!currentInsp) return null;
                      return (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-gray-900 block">{currentInsp.name}</span>
                            <span className="text-gray-500">{currentInsp.designation} • {currentInsp.department}</span>
                          </div>
                          <div className="text-right font-mono text-[10px] text-gray-600">
                            <span className="block font-bold text-sky-900">{currentInsp.employee_id}</span>
                            <span>📞 {currentInsp.phone}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label htmlFor="modal-appt-date" className="block font-bold text-gray-700 mb-1">
                      Inspection Date *
                    </label>
                    <input
                      id="modal-appt-date"
                      type="date"
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-appt-slot" className="block font-bold text-gray-700 mb-1">
                      Time Slot Window *
                    </label>
                    <select
                      id="modal-appt-slot"
                      value={apptSlot}
                      onChange={(e) => setApptSlot(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                    >
                      <option value="08:00 AM – 10:00 AM">08:00 AM – 10:00 AM (Early Morning Slot)</option>
                      <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM (Midday Slot)</option>
                      <option value="01:00 PM – 03:00 PM">01:00 PM – 03:00 PM (Afternoon Slot)</option>
                      <option value="03:00 PM – 05:00 PM">03:00 PM – 05:00 PM (Evening Slot)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modal-appt-instructions" className="block font-bold text-gray-700 mb-1">
                      Reporting Instructions for Farmer *
                    </label>
                    <textarea
                      id="modal-appt-instructions"
                      rows={3}
                      value={apptInstructions}
                      onChange={(e) => setApptInstructions(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSchedulingApp(null)}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={schedulingSubmitting}
                      className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                    >
                      {schedulingSubmitting ? 'Issuing...' : 'Issue Appointment Slot'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
         * MODAL: CONDUCT FAIR AVERAGE QUALITY (FAQ) PHYSICAL INSPECTION
         * ══════════════════════════════════════════════════════════════════════ */}
        {inspectingApp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-base text-gray-900">
                    Conduct FAQ Produce Quality Inspection: {inspectingApp.crop_name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingApp(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {decisionSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>
                        Inspection Recorded: {decisionSuccess.record.decision}ED (Ref:{' '}
                        {decisionSuccess.record.inspection_reference_number})
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Official inspection certificate generated. Audit log saved and notification dispatched to farmer.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingApp(null)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {decisionError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{decisionError}</span>
                    </div>
                  )}

                  {/* Lot & Cargo Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Farmer</span>
                      <strong className="text-gray-900">{inspectingApp.farmer_name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Commodity</span>
                      <strong className="text-gray-900">{inspectingApp.crop_name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Inspected Qty (Qtl)</span>
                      <input
                        type="number"
                        value={inspectedQty}
                        onChange={(e) => setInspectedQty(Number(e.target.value))}
                        className="w-full text-xs font-bold px-2 py-1 rounded border border-gray-300 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Sample Seal #</span>
                      <input
                        type="text"
                        value={sealNumber}
                        onChange={(e) => setSealNumber(e.target.value)}
                        className="w-full text-xs font-bold px-2 py-1 rounded border border-gray-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Standard Parameter Readings Input Table */}
                  <div>
                    <h5 className="font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                      Fair Average Quality (FAQ) Standard Thresholds & Measured Readings
                    </h5>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-700 font-bold">
                          <tr>
                            <th className="py-2 px-3">Parameter</th>
                            <th className="py-2 px-3">Permissible FAQ Limit</th>
                            <th className="py-2 px-3">Measured Reading</th>
                            <th className="py-2 px-3">Conformity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {standards.map((std) => {
                            const val = parameterReadings[std.id] ?? 0;
                            const res = evaluateParameterResult(val, std.permissible_minimum, std.permissible_maximum);
                            return (
                              <tr key={std.id} className="hover:bg-gray-50">
                                <td className="py-2 px-3 font-medium text-gray-900">{std.parameter_name}</td>
                                <td className="py-2 px-3 text-gray-600">
                                  {std.permissible_maximum !== null ? `Max ${std.permissible_maximum} ${std.unit}` : ''}
                                  {std.permissible_minimum !== null ? `Min ${std.permissible_minimum} ${std.unit}` : ''}
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={val}
                                    onChange={(e) =>
                                      setParameterReadings((prev) => ({
                                        ...prev,
                                        [std.id]: Number(e.target.value),
                                      }))
                                    }
                                    className="w-24 text-xs font-bold px-2 py-1 rounded border border-gray-300 bg-white font-mono"
                                  />
                                </td>
                                <td className="py-2 px-3 font-bold">
                                  {res === 'PASS' ? (
                                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                      ✓ PASS
                                    </span>
                                  ) : (
                                    <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded">
                                      ✗ EXCEEDED
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* General Observation Notes */}
                  <div>
                    <label htmlFor="modal-obs-notes" className="block font-bold text-gray-700 mb-1">
                      Physical Inspection Remarks & Moisture Meter Notes *
                    </label>
                    <textarea
                      id="modal-obs-notes"
                      rows={2}
                      value={observationNotes}
                      onChange={(e) => setObservationNotes(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white"
                    />
                  </div>

                  {/* Mandatory Rejection Reason Input */}
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-1.5">
                    <label htmlFor="modal-rejection-reason" className="block font-bold text-red-950">
                      Reason for Rejection (Mandatory only if decision is REJECT)
                    </label>
                    <input
                      id="modal-rejection-reason"
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Moisture content is 15.2% (exceeds 12.0% max limit), damaged grains 4.5%"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-red-300 bg-white"
                    />
                  </div>

                  {/* Mandatory Recheck Reason Input */}
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5">
                    <label htmlFor="modal-recheck-reason" className="block font-bold text-purple-950">
                      Instructions for Recheck (Mandatory only if decision is RECHECK)
                    </label>
                    <input
                      id="modal-recheck-reason"
                      type="text"
                      value={recheckReason}
                      onChange={(e) => setRecheckReason(e.target.value)}
                      placeholder="e.g. Produce slightly damp from night mist. Advised 24 hours sun-drying before re-test."
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-purple-300 bg-white"
                    />
                  </div>

                  {/* ── THREE CLEAR DECISION BUTTONS ── */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setInspectingApp(null)}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold"
                    >
                      Cancel
                    </button>

                    <div className="flex items-center gap-2">
                      {/* RECHECK */}
                      <button
                        type="button"
                        disabled={decisionSubmitting}
                        onClick={() => handleDecisionSubmit('RECHECK')}
                        className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>RECHECK</span>
                      </button>

                      {/* REJECT */}
                      <button
                        type="button"
                        disabled={decisionSubmitting}
                        onClick={() => handleDecisionSubmit('REJECT')}
                        className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>REJECT</span>
                      </button>

                      {/* APPROVE */}
                      <button
                        type="button"
                        disabled={decisionSubmitting}
                        onClick={() => handleDecisionSubmit('APPROVE')}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>APPROVE FAQ</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
         * MODAL: VIEW DIGITAL CERTIFICATE
         * ══════════════════════════════════════════════════════════════════════ */}
        {viewingReportApp && viewingReportApp.latest_inspection && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 my-8">
              <div className="text-center border-b-2 border-gray-900 pb-4 space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-widest">
                  <Landmark className="w-4 h-4 text-gray-900" />
                  <span>Government Agricultural Produce Procurement Operations</span>
                </div>
                <h3 className="display-font text-xl sm:text-2xl font-extrabold text-gray-900">
                  FAIR AVERAGE QUALITY (FAQ) PHYSICAL INSPECTION CERTIFICATE
                </h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  Ref: {viewingReportApp.latest_inspection.inspection_reference_number} | Application:{' '}
                  {viewingReportApp.application_number}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Farmer Name</span>
                  <strong className="text-gray-900">{viewingReportApp.farmer_name}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Mobile</span>
                  <strong className="text-gray-900">{viewingReportApp.farmer_phone}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Commodity</span>
                  <strong className="text-gray-900">{viewingReportApp.crop_name}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Inspected Qty</span>
                  <strong className="text-emerald-700">
                    {viewingReportApp.latest_inspection.inspected_quantity_quintals} Quintals
                  </strong>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="py-2 px-3">Quality Parameter</th>
                      <th className="py-2 px-3">Permissible Limit</th>
                      <th className="py-2 px-3">Measured Reading</th>
                      <th className="py-2 px-3">Conformity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(viewingReportApp.latest_inspection.parameters_tested || viewingReportApp.latest_inspection.parameters || []).map((p, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-gray-900">{p.parameter_name}</td>
                        <td className="py-2 px-3 text-gray-600">
                          {p.permissible_maximum !== null ? `Max ${p.permissible_maximum} ${p.unit}` : ''}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-gray-900">
                          {p.measured_value} {p.unit}
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-700">✓ PASS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold">Official Decision</span>
                  <h4 className="text-lg font-bold text-emerald-950">APPROVED FOR PROCUREMENT</h4>
                  <span className="text-emerald-800 text-[11px]">
                    Officer: {viewingReportApp.latest_inspection.inspecting_official_name} (
                    {viewingReportApp.latest_inspection.inspecting_official_designation})
                  </span>
                </div>
                <div className="text-right text-[11px] text-gray-500 font-mono">
                  <span>Seal: KM-GOVT-VERIFIED-2026</span>
                  <div className="text-gray-900 font-bold">Status: FAQ Certified</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setViewingReportApp(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
         * MODAL: COMPLAINT REVIEW & RESOLUTION
         * ══════════════════════════════════════════════════════════════════════ */}
        {reviewingComplaint && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="font-bold text-sm text-gray-900">
                  Review Grievance {reviewingComplaint.complaint_number}
                </h4>
                <button
                  type="button"
                  onClick={() => setReviewingComplaint(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200">
                {reviewingComplaint.complaint_description}
              </p>

              <form onSubmit={handleComplaintReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="complaint-status-select" className="block font-bold text-gray-700 mb-1">
                    Resolution Status
                  </label>
                  <select
                    id="complaint-status-select"
                    value={complaintStatusUpdate}
                    onChange={(e) =>
                      setComplaintStatusUpdate(e.target.value as 'investigation_pending' | 'resolved' | 'dismissed')
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="resolved">Resolved (Action taken / Re-inspection allowed)</option>
                    <option value="investigation_pending">Under Supervisory Investigation</option>
                    <option value="dismissed">Dismissed (Readings confirmed by supervisor)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="complaint-official-notes" className="block font-bold text-gray-700 mb-1">
                    Official Review & Resolution Notes *
                  </label>
                  <textarea
                    id="complaint-official-notes"
                    rows={3}
                    value={complaintReviewNotes}
                    onChange={(e) => setComplaintReviewNotes(e.target.value)}
                    placeholder="Provide official review remarks..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingComplaint(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
