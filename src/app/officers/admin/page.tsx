'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Layers,
  Calendar,
  Lock,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import OfficerManualAddForm from '@/components/officers/OfficerManualAddForm';
import {
  listAllOfficers,
  SHARED_DEMO_PASSWORD,
  loginOfficer,
  getCurrentOfficerSession,
  logoutOfficer,
} from '@/lib/officer-service';
import { OfficerProfile, OfficerAuthSession } from '@/types/officer';

export default function OfficerAdminPage() {
  const [officers, setOfficers] = useState<OfficerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<OfficerAuthSession | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load officers & session on mount
  const refreshOfficersList = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listAllOfficers();
      setOfficers(list);
      setCurrentSession(getCurrentOfficerSession());
    } catch (err) {
      console.error('Failed to load officers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    listAllOfficers()
      .then((list) => {
        if (isMounted) {
          setOfficers(list);
          setCurrentSession(getCurrentOfficerSession());
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load officers:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Distinct batches for filter
  const batches = useMemo(() => {
    const set = new Set<string>();
    officers.forEach((o) => {
      if (o.batch_id) set.add(o.batch_id);
    });
    return Array.from(set).sort();
  }, [officers]);

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return officers.filter((o) => {
      const matchesBatch = selectedBatch === 'all' || o.batch_id === selectedBatch;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        o.full_name.toLowerCase().includes(query) ||
        o.officer_id.toLowerCase().includes(query) ||
        o.contact_number.toLowerCase().includes(query) ||
        o.batch_id.toLowerCase().includes(query) ||
        (o.email && o.email.toLowerCase().includes(query));

      return matchesBatch && matchesSearch;
    });
  }, [officers, selectedBatch, searchQuery]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleQuickLoginAsOfficer = async (officer: OfficerProfile) => {
    const email = officer.email || `${officer.officer_id.toLowerCase()}@apmc-demo.local`;
    setActionLoadingId(officer.officer_id);
    try {
      const res = await loginOfficer(email, SHARED_DEMO_PASSWORD);
      if (res.success && res.session) {
        setCurrentSession(res.session);
      }
    } catch (err) {
      console.error('Quick login error:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = async () => {
    await logoutOfficer();
    setCurrentSession(null);
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kisan Mitra
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-1 rounded-md">
              APMC Crop Inspection Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentSession ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-900 font-medium">
                  Logged in as <strong>{currentSession.officer.full_name}</strong> ({currentSession.officer.officer_id})
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-emerald-700 hover:text-red-600 font-bold underline transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/officers/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <KeyRound className="w-4 h-4 text-sky-600" />
                Officer Login Portal
              </Link>
            )}

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 px-4 py-2 rounded-xl shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              {showAddForm ? 'Close Add Form' : 'Register New Officer'}
            </button>
          </div>
        </div>

        {/* Page Hero */}
        <div className="bg-gradient-to-br from-sky-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs font-semibold px-3 py-1 rounded-full border border-sky-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official APMC Crop Inspection Division
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              APMC Crop Inspection Officers Directory
            </h1>
            <p className="text-sm text-sky-200/90 leading-relaxed">
              Authorized directory and registry of APMC field crop-inspection officers across all market yard batches.
              Backed by Supabase PostgreSQL, Row Level Security (RLS), and shared demo authentication.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-sky-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-3 border border-white/10">
              <div className="text-sky-300 font-medium">Registered Officers</div>
              <div className="text-2xl font-black text-white mt-0.5">{officers.length}</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-3 border border-white/10">
              <div className="text-sky-300 font-medium">Active Batches</div>
              <div className="text-2xl font-black text-white mt-0.5">{batches.length}</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-3 border border-white/10">
              <div className="text-sky-300 font-medium">Shared Password</div>
              <div className="flex items-center justify-between mt-1">
                <code className="text-sm font-bold text-amber-300">{SHARED_DEMO_PASSWORD}</code>
                <button
                  onClick={() => copyToClipboard(SHARED_DEMO_PASSWORD, 'pwd')}
                  className="p-1 hover:text-white text-sky-300 transition-colors"
                  title="Copy Password"
                >
                  {copiedText === 'pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-3 border border-white/10">
              <div className="text-sky-300 font-medium">Supabase RLS</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active &amp; Enforced
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Manual Registration Form */}
        {showAddForm && (
          <div className="transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                Register New APMC Crop Inspection Officer
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
              >
                ✕ Cancel
              </button>
            </div>
            <OfficerManualAddForm
              onSuccess={(newOfficer) => {
                setOfficers((prev) => [newOfficer, ...prev]);
                setShowAddForm(false);
              }}
            />
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Batch:</span>
            </div>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-sky-600"
            >
              <option value="all">All Batches ({officers.length})</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b} ({officers.filter((o) => o.batch_id === b).length})
                </option>
              ))}
            </select>

            <button
              onClick={refreshOfficersList}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-sky-300 text-xs font-semibold text-gray-700 hover:text-sky-700 bg-gray-50 hover:bg-sky-50 transition-all shrink-0"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Officers Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              Officers Roster
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                Showing {filteredOfficers.length} of {officers.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
              <ShieldAlert className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">No inspection officers match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBatch('all');
                }}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOfficers.map((officer) => {
                const email = officer.email || `${officer.officer_id.toLowerCase()}@apmc-demo.local`;
                const isCurrent = currentSession?.officer.officer_id === officer.officer_id;

                return (
                  <div
                    key={officer.id || officer.officer_id}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-lg p-5 flex flex-col justify-between ${
                      isCurrent
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                        : 'border-gray-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header: Officer ID & Batch */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black tracking-wider uppercase bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg">
                          {officer.officer_id}
                        </span>
                        <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Layers className="w-3 h-3 text-amber-600" />
                          {officer.batch_id}
                        </span>
                      </div>

                      {/* Officer Name */}
                      <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                          {officer.full_name}
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">APMC Crop Inspection Officer</p>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-gray-500">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            Contact
                          </span>
                          <span className="font-semibold text-gray-800 font-mono">{officer.contact_number}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-gray-500">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            Login Email
                          </span>
                          <button
                            onClick={() => copyToClipboard(email, officer.officer_id)}
                            className="font-mono text-sky-700 hover:underline flex items-center gap-1 text-[11px]"
                            title="Click to copy email"
                          >
                            {email}
                            {copiedText === officer.officer_id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Enrolled
                          </span>
                          <span className="text-gray-500 text-[11px]">
                            {officer.created_at ? new Date(officer.created_at).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-gray-400" />
                        Pwd: <code className="text-gray-700 font-bold">{SHARED_DEMO_PASSWORD}</code>
                      </div>

                      <button
                        onClick={() => handleQuickLoginAsOfficer(officer)}
                        disabled={actionLoadingId === officer.officer_id || isCurrent}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-900 border border-sky-200'
                        }`}
                      >
                        {actionLoadingId === officer.officer_id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : isCurrent ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Logged In
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" />
                            Sign In As
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
