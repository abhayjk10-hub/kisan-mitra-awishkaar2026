'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Warehouse,
  Snowflake,
  Search,
  Phone,
  RefreshCw,
  LogOut,
  ChevronDown,
  Building2,
  CalendarCheck,
  CheckCircle2,
  MapPin,
  Inbox,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import { Mandi, MandiSession } from '@/types';
import { WarehouseBooking } from '@/types/warehouse';
import { StorageFacility } from '@/lib/cold-storage-service';
import {
  getCurrentMandiSession,
  getMandis,
  loginMandi,
  logoutMandi,
} from '@/lib/mandi-service';
import {
  filterWarehouseBookingsForMandi,
  getFacilitiesForMandi,
  getAllWarehouseBookings,
} from '@/lib/warehouse-booking-service';

export default function MandiWarehouseDashboardPage() {
  const router = useRouter();

  // Session & Mandi State
  const [session, setSession] = useState<MandiSession | null>(null);
  const [allMandis, setAllMandis] = useState<Mandi[]>([]);
  const [loading, setLoading] = useState(true);

  // Bookings & Facilities State (populated from server API)
  const [bookings, setBookings] = useState<WarehouseBooking[]>([]);
  const [facilities, setFacilities] = useState<StorageFacility[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'bookings' | 'facilities'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cold_storage' | 'dry_warehouse'>('all');

  // Load Session on Mount
  useEffect(() => {
    const s = getCurrentMandiSession();
    if (!s) {
      router.push('/login?role=mandi&unauthorized=farmer');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(s);
    getMandis().then(setAllMandis);
    setLoading(false);
  }, [router]);

  /**
   * Loads warehouse bookings strictly from the server-authenticated API.
   * Server derives the mandi from session cookies/tokens and filters automatically.
   */
  const loadWarehouseData = useCallback(async () => {
    if (!session?.mandi) return;
    setRefreshing(true);
    setFetchError(null);

    try {
      // 1. Fetch from server-enforced API route (which reads session cookie strictly)
      const res = await fetch('/api/mandi/warehouse-bookings', {
        headers: {
          'x-mandi-session-id': session.mandi.id,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings || []);
          setFacilities(data.facilities || []);
          return;
        }
      }

      // 2. Client-side fallback if offline / in test environment
      const all = await getAllWarehouseBookings();
      const filtered = filterWarehouseBookingsForMandi(all, session.mandi);
      const facs = getFacilitiesForMandi(session.mandi);
      setBookings(filtered);
      setFacilities(facs);
    } catch {
      // Fallback to client-side jurisdiction filtering
      const all = await getAllWarehouseBookings();
      const filtered = filterWarehouseBookingsForMandi(all, session.mandi);
      const facs = getFacilitiesForMandi(session.mandi);
      setBookings(filtered);
      setFacilities(facs);
    } finally {
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.mandi?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadWarehouseData();
    }
  }, [session, loadWarehouseData]);

  // Listen to cross-tab storage booking broadcasts
  useEffect(() => {
    const handleSync = () => {
      loadWarehouseData();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('km_storage_sync', handleSync);
      window.addEventListener('storage', handleSync);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('km_storage_sync', handleSync);
        window.removeEventListener('storage', handleSync);
      }
    };
  }, [loadWarehouseData]);

  // Switch Mandi Operator Jurisdiction
  const handleSwitchMandi = async (mandiId: string) => {
    const target = allMandis.find((m) => m.id === mandiId);
    if (!target) return;
    const res = await loginMandi(target.code);
    if (res.session) {
      setSession(res.session);
    }
  };

  const handleLogout = () => {
    logoutMandi();
    router.push('/mandi/login');
  };

  // Filter Bookings by Search & Type
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (typeFilter !== 'all') {
        if (typeFilter === 'cold_storage' && b.warehouse_type !== 'cold_storage' && b.warehouse_type !== 'controlled_atmosphere') {
          return false;
        }
        if (typeFilter === 'dry_warehouse' && b.warehouse_type !== 'dry_warehouse') {
          return false;
        }
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.ticket_number.toLowerCase().includes(q) ||
        b.farmer_name.toLowerCase().includes(q) ||
        b.farmer_phone.includes(q) ||
        b.crop_name.toLowerCase().includes(q) ||
        b.warehouse_name.toLowerCase().includes(q) ||
        b.manager_name.toLowerCase().includes(q)
      );
    });
  }, [bookings, typeFilter, searchQuery]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = bookings.length;
    const coldChain = bookings.filter(
      (b) => b.warehouse_type === 'cold_storage' || b.warehouse_type === 'controlled_atmosphere'
    ).length;
    const dryGodown = bookings.filter((b) => b.warehouse_type === 'dry_warehouse').length;
    const totalQuintals = bookings.reduce((sum, b) => sum + (b.quantity_quintals || 0), 0);
    const totalMonthlyValue = bookings.reduce((sum, b) => sum + (b.estimated_monthly_charge || 0), 0);
    return { total, coldChain, dryGodown, totalQuintals, totalMonthlyValue };
  }, [bookings]);

  if (loading || !session) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto pb-16 space-y-6">
        {/* TOP BAR: Mandi Selector & Live Sync Badge (Structural Template Match) */}
        <div className="bg-white/95 rounded-3xl border border-primary-200 shadow-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-primary-950 leading-tight">
                  {session.mandi.name}
                </h1>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {session.mandi.code}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                  Warehouse Jurisdiction
                </span>
              </div>
              <p className="text-xs text-primary-600 mt-0.5">
                {session.mandi.address} • Nearest Mandi Market Authority • Filter: {session.mandi.name}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {/* Quick Toggle to Gate Pass Queue */}
            <Link
              href="/mandi/dashboard"
              className="text-xs font-bold text-primary-800 hover:text-primary-950 bg-primary-100 hover:bg-primary-200 border border-primary-300 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Gate Slot Queue</span>
            </Link>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadWarehouseData}
              disabled={refreshing}
              className="text-xs font-bold text-primary-800 hover:bg-primary-100 border border-primary-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            {/* Switch Mandi Dropdown */}
            <div className="relative">
              <select
                value={session.mandi.id}
                onChange={(e) => handleSwitchMandi(e.target.value)}
                className="text-xs font-bold bg-primary-50 border border-primary-200 text-primary-900 rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {allMandis.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-primary-600 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {fetchError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center justify-between">
            <span>{fetchError}</span>
            <button type="button" onClick={() => setFetchError(null)} className="text-red-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-primary-200 shadow-sm">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Total Bookings</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary-950 mt-1">{metrics.total}</div>
            <span className="text-[11px] text-primary-500 font-semibold">In this mandi zone</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-cyan-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Cold Storage</span>
              <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-950 mt-1">{metrics.coldChain}</div>
            <span className="text-[11px] text-cyan-700 font-semibold">Perishable crops</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Dry Godowns</span>
              <Warehouse className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1">{metrics.dryGodown}</div>
            <span className="text-[11px] text-amber-700 font-semibold">Grains & pulses</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Stored Volume</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1">
              {metrics.totalQuintals.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold">Qtl</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              ~{(metrics.totalQuintals / 10).toFixed(1)} Metric Tonnes
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-primary-200 shadow-sm">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Est. Monthly Freight</span>
            <div className="text-xl sm:text-2xl font-extrabold text-primary-950 mt-1">
              ₹{metrics.totalMonthlyValue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-primary-500 font-semibold">Farmer storage billing</span>
          </div>
        </div>

        {/* TABS: Live Storage Bookings Queue vs Mandi Facilities Directory */}
        <div className="flex items-center justify-between border-b border-primary-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'text-primary-700 hover:bg-primary-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Incoming Storage Bookings ({bookings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('facilities')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'facilities'
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'text-primary-700 hover:bg-primary-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Affiliated Warehouses ({facilities.length})</span>
            </button>
          </div>

          <div className="text-xs text-primary-600 font-medium hidden sm:block">
            Jurisdiction: <strong className="text-primary-950">{session.mandi.name}</strong>
          </div>
        </div>

        {/* TAB 1: INCOMING STORAGE BOOKINGS QUEUE */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="bg-white rounded-2xl border border-primary-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-primary-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by ticket #, farmer name, mobile, or crop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-primary-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-primary-100/60 rounded-xl border border-primary-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    typeFilter === 'all' ? 'bg-primary-900 text-white shadow-sm' : 'text-primary-700 hover:text-primary-950'
                  }`}
                >
                  All ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('cold_storage')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                    typeFilter === 'cold_storage'
                      ? 'bg-cyan-700 text-white shadow-sm'
                      : 'text-primary-700 hover:text-primary-950'
                  }`}
                >
                  <Snowflake className="w-3 h-3" />
                  <span>Cold Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('dry_warehouse')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                    typeFilter === 'dry_warehouse'
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'text-primary-700 hover:text-primary-950'
                  }`}
                >
                  <Warehouse className="w-3 h-3" />
                  <span>Dry Godown</span>
                </button>
              </div>
            </div>

            {/* Empty State Handling */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-primary-200 p-12 text-center shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto">
                  <Inbox className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-950">
                    No Warehouse Bookings for {session.mandi.name}
                  </h3>
                  <p className="text-xs text-primary-700 max-w-md mx-auto mt-1">
                    When farmers allocate produce to cold storages or warehouses in this mandi yard&apos;s vicinity, their confirmed booking tokens and manager notifications will stream into this dashboard automatically.
                  </p>
                </div>
              </div>
            ) : (
              /* Bookings Table */
              <div className="bg-white rounded-3xl border border-primary-200 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary-50/80 border-b border-primary-100 text-[11px] font-black uppercase tracking-wider text-primary-800">
                        <th className="py-3.5 px-4">Ticket Number</th>
                        <th className="py-3.5 px-4">Farmer Details</th>
                        <th className="py-3.5 px-4">Storage Warehouse</th>
                        <th className="py-3.5 px-4">Crop & Volume</th>
                        <th className="py-3.5 px-4">Est. Charge</th>
                        <th className="py-3.5 px-4">Manager Contact</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-100 text-xs">
                      {filteredBookings.map((b) => {
                        const isCold = b.warehouse_type === 'cold_storage' || b.warehouse_type === 'controlled_atmosphere';
                        return (
                          <tr key={b.id} className="hover:bg-primary-50/40 transition-colors">
                            {/* Ticket Number */}
                            <td className="py-4 px-4 font-mono font-bold text-primary-950">
                              <span className="bg-primary-100/70 px-2.5 py-1 rounded-lg border border-primary-200 block text-center">
                                {b.ticket_number}
                              </span>
                              <span className="text-[10px] text-slate-500 font-sans block text-center mt-1">
                                {new Date(b.booked_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>

                            {/* Farmer Details */}
                            <td className="py-4 px-4">
                              <div className="font-extrabold text-primary-950 text-sm">{b.farmer_name}</div>
                              <a
                                href={`tel:${b.farmer_phone}`}
                                className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{b.farmer_phone}</span>
                              </a>
                            </td>

                            {/* Storage Warehouse */}
                            <td className="py-4 px-4 max-w-xs">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                                    isCold ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  {isCold ? <Snowflake className="w-2.5 h-2.5" /> : <Warehouse className="w-2.5 h-2.5" />}
                                  {isCold ? 'Cold' : 'Godown'}
                                </span>
                                <strong className="text-xs font-bold text-primary-950 truncate block">
                                  {b.warehouse_name}
                                </strong>
                              </div>
                              <span className="text-[11px] text-primary-600 block mt-1 truncate">
                                {b.warehouse_address}
                              </span>
                            </td>

                            {/* Crop & Volume */}
                            <td className="py-4 px-4">
                              <strong className="text-xs font-extrabold text-primary-950 block">
                                {b.crop_name}
                              </strong>
                              <span className="text-xs font-bold text-emerald-800">
                                {b.quantity_quintals} Quintals
                              </span>
                            </td>

                            {/* Est. Charge */}
                            <td className="py-4 px-4">
                              <strong className="text-sm font-black text-primary-950 block">
                                ₹{b.estimated_monthly_charge.toLocaleString('en-IN')}
                              </strong>
                              <span className="text-[10px] text-slate-500 font-medium">for 1 month</span>
                            </td>

                            {/* Manager Contact */}
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-900">{b.manager_name}</div>
                              <a
                                href={`tel:${b.manager_phone}`}
                                className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{b.manager_phone}</span>
                              </a>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>DONE</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AFFILIATED WAREHOUSES DIRECTORY */}
        {activeTab === 'facilities' && (
          <div className="space-y-4">
            {facilities.length === 0 ? (
              <div className="bg-white rounded-3xl border border-primary-200 p-12 text-center shadow-sm space-y-3">
                <Building2 className="w-12 h-12 text-primary-400 mx-auto" />
                <h3 className="text-lg font-bold text-primary-950">No Warehouses Registered for this Mandi</h3>
                <p className="text-xs text-primary-600">
                  There are no affiliated cold storages or dry warehouses mapped to {session.mandi.name}.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {facilities.map((facility) => {
                  const isCold = facility.type === 'cold_storage' || facility.type === 'controlled_atmosphere';
                  const facilityBookings = bookings.filter((b) => b.warehouse_id === facility.id);
                  const bookedVolume = facilityBookings.reduce((sum, b) => sum + (b.quantity_quintals || 0), 0);

                  return (
                    <div
                      key={facility.id}
                      className="bg-white rounded-3xl border-2 border-primary-200 p-6 shadow-md space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isCold ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isCold ? <Snowflake className="w-3 h-3" /> : <Warehouse className="w-3 h-3" />}
                          {isCold ? 'Cold Storage' : 'Dry Warehouse'}
                        </span>

                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {facility.licenseNo}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-primary-950">{facility.name}</h3>
                        <p className="text-xs text-primary-700 flex items-start gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                          <span>{facility.address}</span>
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                          📍 Nearest APMC: <strong>{facility.nearApmcMandi}</strong>
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 bg-primary-50 p-3 rounded-2xl border border-primary-100 text-xs">
                        <div>
                          <span className="text-[10px] text-primary-600 font-bold uppercase block">Monthly Rate</span>
                          <strong className="text-primary-950 text-sm font-extrabold">₹{facility.ratePerQuintalMonth}</strong>
                          <span className="text-[10px] text-primary-600"> / Quintal</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-primary-600 font-bold uppercase block">Total Capacity</span>
                          <strong className="text-primary-950 text-sm font-extrabold">
                            {facility.totalCapacityMT.toLocaleString('en-IN')} MT
                          </strong>
                        </div>
                        <div className="pt-2 border-t border-primary-200">
                          <span className="text-[10px] text-primary-600 font-bold uppercase block">Temperature</span>
                          <span className="font-semibold text-primary-900">{facility.temperatureRange}</span>
                        </div>
                        <div className="pt-2 border-t border-primary-200">
                          <span className="text-[10px] text-primary-600 font-bold uppercase block">Humidity</span>
                          <span className="font-semibold text-primary-900">{facility.humidityRange}</span>
                        </div>
                      </div>

                      {/* Manager Contact */}
                      <div className="pt-2 border-t border-primary-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Facility In-Charge</span>
                          <strong className="text-slate-900 font-bold">{facility.contactPerson}</strong>
                        </div>
                        <a
                          href={`tel:${facility.contactPhone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{facility.contactPhone}</span>
                        </a>
                      </div>

                      {/* Current APMC Allocations */}
                      <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                        <span className="text-emerald-900 font-semibold">Active Farmer Allocations:</span>
                        <strong className="text-emerald-950 font-black">
                          {facilityBookings.length} bookings ({bookedVolume} Qtl)
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
