'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Warehouse,
  Snowflake,
  Compass,
  MapPin,
  LocateFixed,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Thermometer,
  Droplets,
  Search,
  Printer,
  Share2,
  Check,
  Mail,
  FileText,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import {
  StorageFacility,
  getStorageFacilities,
  getStorageRecommendationForCrop,
  StorageRecommendation,
} from '@/lib/cold-storage-service';
import {
  createWarehouseBooking,
  getLatestFarmerWarehouseBooking,
  clearStoredFarmerWarehouseBooking,
} from '@/lib/warehouse-booking-service';
import { WarehouseBooking } from '@/types/warehouse';
import { SUPPORTED_DISTRICTS } from '@/lib/districts';
import { COMMODITIES } from '@/lib/mandi-price-service';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function ColdStoragePage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const tokenCardRef = useRef<HTMLDivElement>(null);
  const confirmationSectionRef = useRef<HTMLDivElement>(null);

  // Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompting' | 'granted' | 'denied'>('prompting');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');

  // Storage data & filters
  const [filterType, setFilterType] = useState<'all' | 'cold_storage' | 'dry_warehouse'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Crop selection for smart recommendation
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');

  // Inquiry / Reservation modal state
  const [selectedFacilityForInquiry, setSelectedFacilityForInquiry] = useState<StorageFacility | null>(null);
  const [inquiryName, setInquiryName] = useState(() => (user?.user_metadata?.full_name || 'Anagha Katkar'));
  const [inquiryPhone, setInquiryPhone] = useState(() => (user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '8928909642'));
  const [inquiryQuantity, setInquiryQuantity] = useState('20');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active / Confirmed Warehouse Booking state
  const [activeBooking, setActiveBooking] = useState<WarehouseBooking | null>(() => getLatestFarmerWarehouseBooking());
  const [copiedToken, setCopiedToken] = useState(false);

  // Derive facilities sorted by distance & filtered by type
  const facilities = useMemo(() => {
    return getStorageFacilities(userLocation?.lat, userLocation?.lng, filterType);
  }, [userLocation, filterType]);

  // Derive crop storage recommendation
  const recommendation: StorageRecommendation | null = useMemo(() => {
    return selectedCrop ? getStorageRecommendationForCrop(selectedCrop, language) : null;
  }, [selectedCrop, language]);


  // Request browser GPS on mount or user click
  const requestLocation = () => {
    setLocationStatus('prompting');
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('denied');
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('denied');
      },
      { timeout: 8000 }
    );
  }, []);

  // Handle District Change
  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    if (!distId) {
      setUserLocation(null);
      return;
    }
    const dist = SUPPORTED_DISTRICTS.find((d) => d.id === distId);
    if (dist) {
      setUserLocation({ lat: dist.latitude, lng: dist.longitude });
      setLocationStatus('granted');
    }
  };

  // Filter facilities by search query
  const filteredFacilities = facilities.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.nearApmcMandi.toLowerCase().includes(q) ||
      f.suitableCrops.some((c) => c.toLowerCase().includes(q))
    );
  });

  const handleOpenReserveModal = (facility: StorageFacility) => {
    setSelectedFacilityForInquiry(facility);
    setInquiryError(null);
    setInquirySuccess(false);
    if (!inquiryName) {
      setInquiryName(user?.user_metadata?.full_name || 'Anagha Katkar');
    }
    if (!inquiryPhone) {
      setInquiryPhone(user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '8928909642');
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);

    if (!selectedFacilityForInquiry) return;

    if (!inquiryName.trim() || inquiryName.trim().length < 2) {
      setInquiryError('Please provide your full farmer name (at least 2 characters).');
      return;
    }

    const cleanPhone = inquiryPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setInquiryError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const qty = Number(inquiryQuantity);
    if (isNaN(qty) || qty <= 0) {
      setInquiryError('Please enter a valid quantity of quintals (minimum 1 quintal).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createWarehouseBooking({
        warehouse_id: selectedFacilityForInquiry.id,
        farmer_name: inquiryName.trim(),
        farmer_phone: cleanPhone,
        crop_name: selectedCrop,
        quantity_quintals: qty,
        storage_duration_months: 1,
        farmer_id: user?.id,
      });

      if (!res.success || !res.booking) {
        setInquiryError(res.error || 'Failed to complete storage booking.');
        setIsSubmitting(false);
        return;
      }

      setActiveBooking(res.booking);
      setInquirySuccess(true);
      setIsSubmitting(false);

      // Scroll to confirmation after brief delay
      setTimeout(() => {
        tokenCardRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: unknown) {
      setInquiryError(err instanceof Error ? err.message : 'An unexpected error occurred while reserving space.');
      setIsSubmitting(false);
    }
  };

  const handleDismissModal = () => {
    setSelectedFacilityForInquiry(null);
    setInquirySuccess(false);
    setInquiryError(null);
  };

  const handleCopyToken = () => {
    if (!activeBooking) return;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const text = `Kisan Mitra Storage Token #${activeBooking.ticket_number}\nWarehouse: ${activeBooking.warehouse_name}\nManager: ${activeBooking.manager_name} (${activeBooking.manager_phone})\nCrop: ${activeBooking.crop_name} (${activeBooking.quantity_quintals} Qtl)\nStatus: ${activeBooking.status.toUpperCase()}\nEstimated Charge: ₹${activeBooking.estimated_monthly_charge}`;
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleClearBooking = () => {
    clearStoredFarmerWarehouseBooking();
    setActiveBooking(null);
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-primary-950 to-slate-950 text-white rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-emerald-800/30">
          <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
            <Snowflake className="w-80 h-80" />
          </div>

          <div className="max-w-3xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
              {t('storage.eyebrow', language)}
            </div>
            <h1 className="display-font text-3xl sm:text-5xl font-extrabold leading-tight">
              {t('storage.title', language)}
            </h1>
            <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed">
              {t('storage.subtitle', language)}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
         * ACTIVE CONFIRMED STORAGE BOOKING TOKEN (Farmer Side Token View)
         * Shows the full booking token details on the same page.
         * ════════════════════════════════════════════════════════════════════ */}
        {activeBooking && (
          <section
            ref={tokenCardRef}
            className="bg-white rounded-[2.5rem] border-2 border-emerald-600 shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Top Verification Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-primary-900 to-slate-900 p-6 sm:p-8 text-white relative">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {t('storage.tokenCardTitle', language)}
                </span>
                <span className="text-xs text-primary-200 font-mono">
                  {language === 'hi' ? 'जारी:' : language === 'mr' ? 'जारी:' : language === 'gu' ? 'જારી:' : language === 'pa' ? 'ਜਾਰੀ:' : 'Issued:'} {new Date(activeBooking.booked_at).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="display-font text-2xl sm:text-3xl font-black text-white">
                    {activeBooking.warehouse_name}
                  </h2>
                  <p className="text-xs text-primary-100 mt-1 max-w-xl">
                    {t('storage.tokenCardSubtitle', language)}
                  </p>
                </div>

                {/* Status Done Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-200 border-2 border-emerald-400/50 backdrop-blur-sm self-start md:self-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {t('storage.bookingStatusDone', language)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Token Graphic Display */}
              <div className="p-6 rounded-3xl bg-primary-50/70 border-2 border-dashed border-primary-300 text-center relative">
                <span className="text-xs uppercase tracking-wider font-extrabold text-primary-600 block">
                  {t('storage.ticketTokenId', language)}
                </span>
                <div className="display-font text-3xl sm:text-4xl font-black text-primary-950 tracking-wider my-1.5 font-mono">
                  {activeBooking.ticket_number}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('storage.spaceGuaranteed', language)} • License: {activeBooking.license_no || 'WDRA Accredited'}</span>
                </div>
              </div>

              {/* Grid: Farmer & Produce vs Warehouse & Manager */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 1. Farmer & Produce Details */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{t('storage.farmerProduceId', language)}</span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {t('storage.verifiedFarmer', language)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">{t('storage.farmerName', language)}</span>
                    <p className="text-base font-extrabold text-slate-900">{activeBooking.farmer_name}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">{t('storage.mobileNumber', language)}</span>
                    <a
                      href={`tel:${activeBooking.farmer_phone}`}
                      className="text-sm font-bold text-emerald-700 hover:underline flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{activeBooking.farmer_phone}</span>
                    </a>
                  </div>

                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">{t('storage.cropStored', language)}</span>
                      <strong className="text-slate-900 font-bold text-sm">{activeBooking.crop_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">{t('storage.reservedVolume', language)}</span>
                      <strong className="text-slate-900 font-bold text-sm">{activeBooking.quantity_quintals} {t('storage.reservedVolume', language).includes('प्रमाण') ? 'क्विंटल' : 'Quintals'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Warehouse & Manager / Owner Details */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{t('storage.facilityOwnerManager', language)}</span>
                    <span className="text-xs font-bold text-slate-700">{t('storage.wdraApproved', language)}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">{t('storage.facilityAddress', language)}</span>
                    <p className="text-xs font-bold text-slate-900 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                      <span>{activeBooking.warehouse_address}</span>
                    </p>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {t('storage.nearestMandiLabel', language)}: <strong>{activeBooking.nearest_apmc_mandi}</strong>
                    </p>
                  </div>

                  {/* Owner / Manager Details */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block">
                      {t('storage.ownerManagerContact', language)}
                    </span>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{activeBooking.manager_name}</p>
                        <p className="text-[11px] text-slate-500">{t('storage.authorizedInCharge', language)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${activeBooking.manager_phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{activeBooking.manager_phone}</span>
                        </a>
                        {activeBooking.manager_email && (
                          <a
                            href={`mailto:${activeBooking.manager_email}`}
                            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                            title={activeBooking.manager_email}
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Environmental Specs */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('storage.facilityType', language)}</span>
                  <strong className="text-xs font-bold text-slate-900 uppercase">
                    {activeBooking.warehouse_type === 'cold_storage'
                      ? t('storage.typeColdStorage', language)
                      : t('storage.typeDryWarehouse', language)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('storage.temperature', language)}</span>
                  <strong className="text-xs font-bold text-slate-900">
                    {activeBooking.temperature_range || t('storage.ambient', language)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('storage.monthlyRate', language)}</span>
                  <strong className="text-sm font-bold text-emerald-800">
                    ₹{activeBooking.rate_per_quintal_month} {t('storage.perQtlMonth', language)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('storage.estimatedCharge', language)}</span>
                  <strong className="text-base font-extrabold text-emerald-950">
                    ₹{activeBooking.estimated_monthly_charge.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Token Action Controls */}
              <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-primary-200 hover:bg-primary-50 text-primary-900 font-bold text-xs shadow-sm transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-primary-700" />
                    <span>{t('storage.printReceipt', language)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-primary-200 hover:bg-primary-50 text-primary-900 font-bold text-xs shadow-sm transition-colors"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-primary-700" />
                        <span>{t('storage.shareSlip', language)}</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClearBooking}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline px-3 py-2"
                >
                  {language === 'hi' ? 'अन्य फसल / गोदाम के लिए बुक करें' : language === 'mr' ? 'दुसऱ्या पिकासाठी / गोदामासाठी आरक्षित करा' : language === 'gu' ? 'અન્ય પાક / ગોદામ માટે બુક કરો' : language === 'pa' ? 'ਹੋਰ ਫਸਲ / ਗੁਦਾਮ ਲਈ ਬੁੱਕ ਕਰੋ' : 'Reserve For Another Crop / Warehouse'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════════════════
         * SMART CROP RECOMMENDATION ENGINE: Cold Storage vs Normal Warehouse
         * ════════════════════════════════════════════════════════════════════ */}
        <section className="bg-white/95 rounded-[2rem] border border-primary-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                  AI Storage Advisory
                </span>
              </div>
              <h2 className="text-2xl font-bold text-primary-950 mt-1">
                {t('storage.engineTitle', language)}
              </h2>
              <p className="text-xs text-primary-700 mt-0.5">
                {t('storage.engineSubtitle', language)}
              </p>
            </div>

            {/* Crop Selector */}
            <div className="shrink-0">
              <label htmlFor="crop-select" className="block text-xs font-bold text-primary-800 mb-1">
                {language === 'hi' ? 'अपनी फसल चुनें:' : language === 'mr' ? 'आपले पीक निवडा:' : language === 'gu' ? 'તમારો પાક પસંદ કરો:' : language === 'pa' ? 'ਆਪਣੀ ਫਸਲ ਚੁਣੋ:' : 'Select Your Crop:'}
              </label>
              <select
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full sm:w-64 bg-primary-50 border-2 border-primary-300 rounded-xl px-3 py-2 text-sm font-bold text-primary-950 focus:outline-none focus:border-emerald-600"
              >
                {COMMODITIES.map((c) => (
                  <option key={c.id} value={c.defaultName.split('(')[0].trim()}>
                    {c.defaultName}
                  </option>
                ))}
                <option value="Cotton">Cotton (कपास / कापूस)</option>
                <option value="Sugarcane">Sugarcane (गन्ना / ऊस)</option>
                <option value="Garlic">Garlic (लहसुन / लसूण)</option>
              </select>
            </div>
          </div>

          {/* Recommendation Card */}
          {recommendation && (
            <div
              className={`rounded-2xl p-6 border-2 transition-all ${
                recommendation.recommendedType === 'cold_storage'
                  ? 'bg-cyan-50/70 border-cyan-300 ring-2 ring-cyan-500/10'
                  : 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-black/10">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                      recommendation.recommendedType === 'cold_storage' ? 'bg-cyan-600' : 'bg-amber-600'
                    }`}
                  >
                    {recommendation.recommendedType === 'cold_storage' ? (
                      <Snowflake className="w-6 h-6" />
                    ) : (
                      <Warehouse className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700">
                      {t('storage.scientificRecFor', language)} {recommendation.cropName}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-primary-950">
                      {recommendation.recommendedType === 'cold_storage'
                        ? t('storage.typeColdStorage', language)
                        : t('storage.typeDryWarehouse', language)}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="bg-white px-3.5 py-1.5 rounded-xl border border-black/10 shadow-sm text-xs">
                    <span className="text-gray-500 font-medium">{t('storage.idealTemp', language)}: </span>
                    <strong className="text-primary-950 font-bold">{recommendation.idealTemp}</strong>
                  </div>
                  <div className="bg-white px-3.5 py-1.5 rounded-xl border border-black/10 shadow-sm text-xs">
                    <span className="text-gray-500 font-medium">{t('storage.humidityTarget', language)}: </span>
                    <strong className="text-primary-950 font-bold">{recommendation.idealHumidity}</strong>
                  </div>
                  <div className="bg-white px-3.5 py-1.5 rounded-xl border border-black/10 shadow-sm text-xs">
                    <span className="text-gray-500 font-medium">{t('storage.maxStorage', language)}: </span>
                    <strong className="text-primary-950 font-bold">{recommendation.maxStorageDays} {t('storage.days', language)}</strong>
                  </div>
                </div>
              </div>

              {/* Reason Explanation */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary-950 leading-relaxed">
                  💡 <span className="font-extrabold uppercase text-xs tracking-wider text-primary-700">{t('storage.biologicalReason', language)}:</span>{' '}
                  {recommendation.reason}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/80 p-3.5 rounded-xl border border-black/5">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
                      ✓ {t('storage.scientificBenefits', language)}
                    </span>
                    <ul className="text-xs text-primary-800 space-y-1">
                      {recommendation.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-xl border border-black/5">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1.5">
                      ⚠ {t('storage.spoilageRisks', language)}
                    </span>
                    <p className="text-xs text-rose-950 leading-relaxed mb-2 font-medium">
                      {recommendation.risksIfStoredWrong}
                    </p>
                    <span className="text-[11px] font-bold text-primary-700 block">
                      {t('storage.recommendedHandling', language)}
                    </span>
                    <ul className="text-[11px] text-primary-800 space-y-0.5 mt-1">
                      {recommendation.handlingTips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════════════
         * GEOLOCATION & NEARBY FACILITY SEARCH (GPS TRACKER PATTERN)
         * ════════════════════════════════════════════════════════════════════ */}
        <section className="bg-white/95 rounded-[2rem] border border-primary-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                <h2 className="text-2xl font-bold text-primary-950">
                  {t('storage.nearestTitle', language)}
                </h2>
              </div>
              <p className="text-xs text-primary-700 mt-1">
                Real-time distance tracking to accredited facilities near your regional APMC Mandi.
              </p>
            </div>

            {/* GPS Trigger & District Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={requestLocation}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
              >
                <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                <span>{locationStatus === 'granted' ? t('storage.gpsActive', language) : t('storage.gpsPrompt', language)}</span>
              </button>

              <select
                value={selectedDistrictId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="text-xs font-bold bg-primary-50 border border-primary-200 text-primary-900 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
              >
                <option value="">{t('storage.chooseDistrict', language)}</option>
                {SUPPORTED_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.state})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search & Type Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-primary-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={t('storage.searchPlaceholder', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-primary-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-primary-100/60 rounded-xl border border-primary-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  filterType === 'all' ? 'bg-primary-900 text-white shadow-sm' : 'text-primary-700 hover:text-primary-950'
                }`}
              >
                {t('storage.filterAll', language)} ({facilities.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('cold_storage')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  filterType === 'cold_storage' ? 'bg-cyan-700 text-white shadow-sm' : 'text-primary-700 hover:text-primary-950'
                }`}
              >
                <Snowflake className="w-3 h-3" />
                <span>{t('storage.filterCold', language)}</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('dry_warehouse')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  filterType === 'dry_warehouse' ? 'bg-amber-700 text-white shadow-sm' : 'text-primary-700 hover:text-primary-950'
                }`}
              >
                <Warehouse className="w-3 h-3" />
                <span>{t('storage.filterDry', language)}</span>
              </button>
            </div>
          </div>

          {/* Storage Facilities Grid */}
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {filteredFacilities.map((facility) => {
              const isCold = facility.type === 'cold_storage' || facility.type === 'controlled_atmosphere';
              const capacityPct = Math.round(
                ((facility.totalCapacityMT - facility.availableSpaceMT) / facility.totalCapacityMT) * 100
              );

              return (
                <div
                  key={facility.id}
                  className="bg-white rounded-3xl border-2 border-primary-100 hover:border-emerald-600 transition-all shadow-md hover:shadow-xl p-6 flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isCold ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isCold ? <Snowflake className="w-3 h-3 text-cyan-600" /> : <Warehouse className="w-3 h-3 text-amber-600" />}
                        {isCold ? t('storage.typeColdStorage', language) : t('storage.typeDryWarehouse', language)}
                      </span>

                      {facility.distance_km !== undefined && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          <LocateFixed className="w-3 h-3 text-emerald-600" />
                          {t('storage.kmAway', language, { dist: facility.distance_km })}
                        </span>
                      )}

                      {facility.isWdraAccredited && (
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {t('storage.wdraApproved', language)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-primary-950 leading-snug">{facility.name}</h3>
                    <p className="text-xs text-primary-700 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                      <span>{facility.address}</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      📍 {t('storage.locatedAdjacent', language, { mandi: facility.nearApmcMandi })}
                    </p>

                    {/* Specifications & Rate Matrix */}
                    <div className="mt-4 grid grid-cols-2 gap-2 bg-primary-50/70 p-3 rounded-2xl border border-primary-100 text-xs">
                      <div>
                        <span className="text-primary-600 text-[10px] uppercase font-bold block">{t('storage.monthlyRate', language)}</span>
                        <strong className="text-primary-950 text-sm font-extrabold">
                          ₹{facility.ratePerQuintalMonth}
                        </strong>{' '}
                        <span className="text-[11px] text-primary-700">{t('storage.perQtlMonth', language)}</span>
                      </div>
                      <div>
                        <span className="text-primary-600 text-[10px] uppercase font-bold block">{t('storage.dailyRate', language)}</span>
                        <strong className="text-emerald-800 text-sm font-extrabold">
                          ₹{facility.ratePerBagDay}
                        </strong>{' '}
                        <span className="text-[11px] text-primary-700">{t('storage.perBagDay', language)}</span>
                      </div>
                      <div className="pt-2 border-t border-primary-200">
                        <span className="text-primary-600 text-[10px] uppercase font-bold block flex items-center gap-1">
                          <Thermometer className="w-3 h-3" /> {t('storage.temperature', language)}
                        </span>
                        <span className="text-primary-900 font-semibold text-[11px]">{facility.temperatureRange}</span>
                      </div>
                      <div className="pt-2 border-t border-primary-200">
                        <span className="text-primary-600 text-[10px] uppercase font-bold block flex items-center gap-1">
                          <Droplets className="w-3 h-3" /> {t('storage.humidity', language)}
                        </span>
                        <span className="text-primary-900 font-semibold text-[11px]">{facility.humidityRange}</span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-semibold text-primary-700 mb-1">
                        <span>{t('storage.availableCap', language)}: {facility.availableSpaceMT.toLocaleString('en-IN')} MT</span>
                        <span>{t('storage.totalCap', language)}: {facility.totalCapacityMT.toLocaleString('en-IN')} MT</span>
                      </div>
                      <div className="w-full bg-primary-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            capacityPct > 80 ? 'bg-red-500' : capacityPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Features Tag Chips */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {facility.features.map((feat, i) => (
                        <span key={i} className="text-[10px] font-medium bg-white border border-primary-200 px-2 py-0.5 rounded-md text-primary-800">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-primary-100 flex items-center justify-between gap-3">
                    <a
                      href={`tel:${facility.contactPhone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-800 hover:text-emerald-700 bg-primary-100 hover:bg-primary-200 px-3 py-2 rounded-xl transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t('storage.callStore', language)}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenReserveModal(facility)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      <span>{t('storage.reserveSpace', language)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
         * MANDATORY BOOKING CONFIRMATION SECTION (At the end of the same page)
         * States clearly that the warehouse has been booked, with status set to DONE
         * and the key booking details repeated.
         * ════════════════════════════════════════════════════════════════════ */}
        {activeBooking && (
          <section
            ref={confirmationSectionRef}
            className="bg-white rounded-[2.5rem] border-2 border-emerald-600/70 shadow-2xl p-6 sm:p-10 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 mb-1">
                    {t('storage.bookingStatusDoneLabel', language)}: {activeBooking.status.toUpperCase()}
                  </div>
                  <h3 className="display-font text-2xl sm:text-3xl font-black text-primary-950">
                    {t('storage.confirmedAllocatedHeading', language)}
                  </h3>
                  <p className="text-xs text-primary-700 mt-0.5">
                    {t('storage.confirmedAllocatedSub', language, { name: activeBooking.manager_name })}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => tokenCardRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-4 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('storage.viewAllocationSlip', language)}</span>
                </button>
              </div>
            </div>

            {/* Repeated Key Booking Details */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-primary-600 block">{t('storage.ticketNumberLabel', language)}</span>
                <p className="text-base font-black text-primary-950 font-mono">{activeBooking.ticket_number}</p>
                <span className="text-[11px] text-emerald-700 font-semibold">{t('storage.bookingStatusDoneLabel', language)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-primary-600 block">{t('storage.farmerIdLabel', language)}</span>
                <p className="text-sm font-extrabold text-primary-950">{activeBooking.farmer_name}</p>
                <p className="text-[11px] text-primary-700 font-medium">{t('storage.mobileNumber', language)}: {activeBooking.farmer_phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-primary-600 block">{t('storage.reservedStorageFacility', language)}</span>
                <p className="text-sm font-extrabold text-primary-950">{activeBooking.warehouse_name}</p>
                <p className="text-[11px] text-primary-700 truncate">{activeBooking.warehouse_address}</p>
              </div>

              <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-primary-600 block">{t('storage.facilityOwnerManager', language)}</span>
                <p className="text-sm font-extrabold text-primary-950">{activeBooking.manager_name}</p>
                <p className="text-[11px] text-emerald-800 font-bold">{t('storage.ownerManagerContact', language)}: {activeBooking.manager_phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-primary-600 block">{t('storage.cropAndVolume', language)}</span>
                <p className="text-sm font-extrabold text-primary-950">
                  {activeBooking.crop_name} • {activeBooking.quantity_quintals} {t('storage.cropAndVolume', language).includes('प्रमाण') ? 'क्विंटल' : 'Quintals'}
                </p>
                <p className="text-[11px] text-primary-700">{t('storage.estimatedCharge', language)} ₹{activeBooking.estimated_monthly_charge}</p>
              </div>

              <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-primary-600 block">{t('storage.associatedApmc', language)}</span>
                <p className="text-xs font-extrabold text-primary-950">{activeBooking.nearest_apmc_mandi}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {t('storage.allocatedDate', language)}: {new Date(activeBooking.booked_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════════════════
         * DIRECT STORAGE ALLOCATION REQUEST MODAL
         * (Matches the User's Screenshot Form & Confirmation Popup Exactly)
         * ════════════════════════════════════════════════════════════════════ */}
        {selectedFacilityForInquiry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-primary-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start border-b border-primary-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {t('storage.modalTitle', language)}
                  </span>
                  <h3 className="text-xl font-bold text-primary-950 mt-0.5">
                    {selectedFacilityForInquiry.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleDismissModal}
                  className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {inquirySuccess ? (
                /* Confirmation Popup (Matches Screenshot Exactly) */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-primary-950">{t('storage.successIssued', language)}</h4>
                    <p className="text-xs text-primary-700 max-w-xs mx-auto mt-1">
                      {language === 'hi'
                        ? `आपका आवंटन टिकट पंजीकृत हो गया है। गोदाम प्रबंधक (${selectedFacilityForInquiry.contactPerson}) को सूचित कर दिया गया है।`
                        : language === 'mr'
                        ? `तुमचे वाटप तिकीट नोंदवले गेले आहे. गोदाम व्यवस्थापक (${selectedFacilityForInquiry.contactPerson}) यांना सूचित करण्यात आले आहे.`
                        : language === 'gu'
                        ? `તમારી ફાળવણી ટિકિટ નોંધાઈ ગઈ છે. વેરહાઉસ મેનેજર (${selectedFacilityForInquiry.contactPerson}) ને સૂચિત કરવામાં આવ્યા છે.`
                        : language === 'pa'
                        ? `ਤੁਹਾਡੀ ਵੰਡ ਟਿਕਟ ਰਜਿਸਟਰ ਹੋ ਗਈ ਹੈ। ਗੁਦਾਮ ਮੈਨੇਜਰ (${selectedFacilityForInquiry.contactPerson}) ਨੂੰ ਸੂਚਿਤ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।`
                        : `Your allocation ticket has been registered. The warehouse manager (${selectedFacilityForInquiry.contactPerson}) has been notified.`}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDismissModal}
                      className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-colors"
                    >
                      {language === 'hi' ? 'बुकिंग टोकन एवं पुष्टि पर्ची देखें' : language === 'mr' ? 'बुकिंग टोकन आणि पुष्टीकरण पावती पहा' : language === 'gu' ? 'બુકિંગ ટોકન અને પુષ્ટિકરણ સ્લિપ જુઓ' : language === 'pa' ? 'ਬੁਕਿੰਗ ਟੋਕਨ ਅਤੇ ਪੁਸ਼ਟੀ ਸਲਿੱਪ ਦੇਖੋ' : 'View Booking Token & Confirmation Slip'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Form (Matches Screenshot Form Exactly) */
                <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
                  {inquiryError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                      {t('storage.farmerName', language)} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rameshwar Patil"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                      {t('storage.mobileNumber', language)} *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9822012345"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                        {t('storage.cropToStore', language)}
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedCrop}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 bg-primary-50 font-bold text-primary-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-primary-800 uppercase tracking-wider mb-1">
                        {t('storage.estimatedQuintals', language)} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        required
                        value={inquiryQuantity}
                        onChange={(e) => setInquiryQuantity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="font-bold">{t('storage.estimatedCharge', language)}</p>
                    <p className="text-lg font-extrabold text-emerald-950">
                      ₹{((Number(inquiryQuantity) || 0) * selectedFacilityForInquiry.ratePerQuintalMonth).toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal">{t('storage.forOneMonth', language)}</span>
                    </p>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleDismissModal}
                      className="w-1/2 py-2.5 rounded-xl border border-primary-200 font-bold text-primary-800 hover:bg-primary-50 transition-colors"
                    >
                      {t('storage.cancelBtn', language)}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-1/2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold shadow-md transition-colors disabled:opacity-50"
                    >
                      {isSubmitting
                        ? t('storage.confirmingBtn', language)
                        : t('storage.confirmSpace', language)}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
