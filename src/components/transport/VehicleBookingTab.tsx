'use client';

import React, { useState } from 'react';
import {
  Truck,
  Phone,
  Printer,
  Share2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { DEFAULT_MANDIS } from '@/lib/mandi-service';
import {
  VehicleType,
  VehicleBookingToken,
  VEHICLE_OPTIONS,
  calculateTripDetails,
  createVehicleBooking,
  getStoredVehicleBooking,
  saveStoredVehicleBooking,
} from '@/lib/transport-booking-service';
import { SUPPORTED_DISTRICTS } from '@/lib/districts';

interface VehicleBookingTabProps {
  userLocation?: { lat: number; lng: number } | null;
  defaultMandiId?: string;
  defaultCrop?: string;
  defaultQuantity?: number;
}

export default function VehicleBookingTab({
  userLocation,
  defaultMandiId,
  defaultCrop,
  defaultQuantity = 15,
}: VehicleBookingTabProps) {
  const { language } = useLanguage();

  // Form state
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [pickupDistrict, setPickupDistrict] = useState('pune');
  const [pickupAddress, setPickupAddress] = useState('');
  const [selectedMandiId, setSelectedMandiId] = useState(defaultMandiId || DEFAULT_MANDIS[0].id);
  const [cropName, setCropName] = useState(defaultCrop || 'Wheat (गहूं)');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(defaultQuantity);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('chhota_hathi');

  // Confirmed booking state (lazy initialized to prevent cascading renders)
  const [confirmedBooking, setConfirmedBooking] = useState<VehicleBookingToken | null>(() =>
    getStoredVehicleBooking()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Derived trip calculation based on current form inputs
  const coords = userLocation || {
    lat: SUPPORTED_DISTRICTS.find((d) => d.id === pickupDistrict)?.latitude || 18.5204,
    lng: SUPPORTED_DISTRICTS.find((d) => d.id === pickupDistrict)?.longitude || 73.8567,
  };

  const tripEstimates = calculateTripDetails(
    coords.lat,
    coords.lng,
    selectedMandiId,
    quantityQuintals,
    selectedVehicleType
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim() || !farmerPhone.trim()) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const booking = createVehicleBooking({
        farmerName,
        farmerPhone,
        pickupLocation: `${pickupAddress ? `${pickupAddress}, ` : ''}${
          SUPPORTED_DISTRICTS.find((d) => d.id === pickupDistrict)?.name || 'Farm Hub'
        }`,
        userLat: coords.lat,
        userLng: coords.lng,
        destinationMandiId: selectedMandiId,
        cropName,
        quantityQuintals,
        vehicleType: selectedVehicleType,
      });

      setConfirmedBooking(booking);
      setIsSubmitting(false);
    }, 600);
  };

  const handleShareToken = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `Kisan Mitra Transport Token #${confirmedBooking?.tokenNumber}\nDriver: ${confirmedBooking?.driverName} (${confirmedBooking?.driverPhone})\nVehicle: ${confirmedBooking?.vehicleNumber} (${confirmedBooking?.vehicleLabel})\nDestination: ${confirmedBooking?.destinationMandiName}\nTotal Cost: ₹${confirmedBooking?.totalCost}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ════════════════════════════════════════════════════════════════════
       * CONFIRMED VEHICLE BOOKING TOKEN (Matches Slot Booking Token Format)
       * ════════════════════════════════════════════════════════════════════ */}
      {confirmedBooking ? (
        <section className="bg-white rounded-[2rem] border-2 border-emerald-600 shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-primary-900 to-slate-900 p-6 sm:p-7 text-white">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                {t('transport.tokenIssued', language)}
              </span>
              <span className="text-xs text-primary-200 font-mono">
                {language === 'hi' ? 'जारी:' : language === 'mr' ? 'जारी:' : language === 'gu' ? 'જારી:' : language === 'pa' ? 'ਜਾਰੀ:' : 'Issued:'} {new Date(confirmedBooking.bookedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3 className="display-font text-2xl sm:text-3xl font-extrabold mt-2 text-white">
              {t('transport.driverAssigned', language)}
            </h3>
            <p className="text-xs text-primary-100 mt-1 max-w-xl">
              {language === 'hi' ? 'आपका समर्पित परिवहन वाहन बुक हो गया है। परिवहन एजेंसी और चालक को आपके खेत से उठाव समय की सूचना दे दी गई है।' : language === 'mr' ? 'तुमचे वाहतूक वाहन बुक झाले आहे. वाहतूक एजन्सी आणि चालकाला तुमच्या शेतावरून माल उचलण्याच्या वेळेची माहिती देण्यात आली आहे.' : language === 'gu' ? 'તમારું ટ્રાન્સપોર્ટ વાહન બુક થઈ ગયું છે. ટ્રાન્સપોર્ટ એજન્સી અને ડ્રાઇવરને તમારા ખેતરેથી માલ ઉપાડવાના સમયની જાણ કરવામાં આવી છે.' : language === 'pa' ? 'ਤੁਹਾਡਾ ਟਰਾਂਸਪੋਰਟ ਵਾਹਨ ਬੁੱਕ ਹੋ ਗਿਆ ਹੈ। ਟਰਾਂਸਪੋਰਟ ਏਜੰਸੀ ਅਤੇ ਡਰਾਈਵਰ ਨੂੰ ਖੇਤ ਤੋਂ ਮਾਲ ਚੁੱਕਣ ਦੇ ਸਮੇਂ ਬਾਰੇ ਸੂਚਿਤ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।' : 'Your dedicated transport vehicle is booked. The logistics agency and driver have been notified of your farm pickup window.'}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Token Card Graphic */}
            <div className="p-6 rounded-2xl bg-primary-50 border-2 border-dashed border-primary-300 text-center relative">
              <span className="text-xs uppercase tracking-wider font-extrabold text-primary-600">
                {t('transport.tokenNumber', language)}
              </span>
              <div className="display-font text-3xl sm:text-4xl font-black text-primary-950 tracking-wider my-1.5 font-mono">
                {confirmedBooking.tokenNumber}
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>{language === 'hi' ? 'चालक एवं वाहन प्रेषित' : language === 'mr' ? 'चालक व वाहन रवाना' : language === 'gu' ? 'ડ્રાઈવર અને વાહન રવાના' : language === 'pa' ? 'ਡਰਾਈਵਰ ਅਤੇ ਵਾਹਨ ਰਵਾਨਾ' : 'DRIVER & VEHICLE DISPATCHED'}</span>
              </div>
            </div>

            {/* Carrier, Driver & Vehicle Plate Details */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Agency & Vehicle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('transport.agencyLabel', language)}</span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {t('transport.verifiedFleet', language)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{confirmedBooking.agencyName}</div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('transport.agencyDispatch', language, { phone: confirmedBooking.agencyPhone })}</span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    {t('transport.assignedVehicleNum', language)}
                  </span>
                  <div className="inline-block bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl font-mono text-base font-black border-2 border-slate-950 shadow-sm">
                    {confirmedBooking.vehicleNumber}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{confirmedBooking.vehicleLabel}</p>
                </div>
              </div>

              {/* Driver & Trip Schedule */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('transport.designatedDriver', language)}</span>
                  <span className="text-xs font-bold text-slate-700">⭐ 4.9 Rating</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0">
                    {confirmedBooking.driverName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{confirmedBooking.driverName}</div>
                    <a
                      href={`tel:${confirmedBooking.driverPhone}`}
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{confirmedBooking.driverPhone}</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('transport.farmPickupWindow', language)}</span>
                    <strong className="text-slate-900">{confirmedBooking.pickupWindow}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('transport.estimatedTransitTime', language)}</span>
                    <strong className="text-emerald-800">
                      ~{confirmedBooking.estimatedTransitMinutes} Mins ({confirmedBooking.distanceKm} km)
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary & Mandi Destination */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('transport.totalLoad', language)}</span>
                  <strong className="text-sm font-bold text-slate-900">
                    {confirmedBooking.quantityQuintals} {t('transport.totalLoad', language).includes('वजन') ? 'क्विंटल' : 'Quintals'}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('transport.tripDistanceLabel', language)}</span>
                  <strong className="text-sm font-bold text-slate-900">
                    {confirmedBooking.distanceKm} km
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('transport.ratePerQtl', language)}</span>
                  <strong className="text-sm font-bold text-emerald-800">
                    ₹{confirmedBooking.costPerQuintal}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('transport.totalFreightCost', language)}</span>
                  <strong className="text-base font-extrabold text-emerald-950">
                    ₹{confirmedBooking.totalCost.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="text-xs text-primary-900 border-t border-emerald-200 pt-2 flex items-center justify-between flex-wrap gap-2">
                <span>
                  {t('transport.destMandiLabel', language)} <strong>{confirmedBooking.destinationMandiName}</strong>
                </span>
                <span>
                  {t('transport.farmerName', language)}: <strong>{confirmedBooking.farmerName}</strong> ({confirmedBooking.farmerPhone})
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary-300 text-primary-900 hover:bg-primary-50 font-bold text-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{t('transport.printSlip', language)}</span>
              </button>

              <button
                type="button"
                onClick={handleShareToken}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? (language === 'hi' ? 'विवरण कॉपी किया गया!' : language === 'mr' ? 'तपशील कॉपी केले!' : language === 'gu' ? 'વિગતો કૉપિ કરી!' : language === 'pa' ? 'ਵੇਰਵੇ ਕਾਪੀ ਕੀਤੇ!' : 'Copied Details!') : t('transport.shareToken', language)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  saveStoredVehicleBooking(null);
                  setConfirmedBooking(null);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white hover:bg-primary-800 font-bold text-xs transition-colors"
              >
                <span>{t('transport.bookAnother', language)}</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ════════════════════════════════════════════════════════════════════
         * VEHICLE BOOKING INTAKE FORM & TRIP COST CALCULATOR
         * ════════════════════════════════════════════════════════════════════ */
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 rounded-[2rem] border border-primary-200 shadow-xl p-6 sm:p-8 space-y-6"
        >
          <div className="border-b border-primary-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-900 border border-amber-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              {t('transport.demoModeBadge', language)}
            </div>
            <h2 className="text-2xl font-bold text-primary-950">
              {t('transport.formHeading', language)}
            </h2>
            <p className="text-xs text-primary-700 mt-1">
              {t('transport.formSubheading', language)}
            </p>
          </div>

          {/* Farmer & Location Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="farmer-name" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                {t('transport.farmerName', language)} *
              </label>
              <input
                id="farmer-name"
                type="text"
                required
                placeholder="e.g. Rameshwar Patil"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label htmlFor="farmer-phone" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                {t('transport.mobileNumber', language)} *
              </label>
              <input
                id="farmer-phone"
                type="tel"
                required
                maxLength={10}
                placeholder="e.g. 9822012345"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pickup-district" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                {t('transport.pickupRegion', language)} *
              </label>
              <select
                id="pickup-district"
                value={pickupDistrict}
                onChange={(e) => setPickupDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold bg-white focus:outline-none focus:border-emerald-600"
              >
                {SUPPORTED_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pickup-address" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                {t('transport.villageLandmark', language)}
              </label>
              <input
                id="pickup-address"
                type="text"
                placeholder="e.g. Near Shiv Mandir"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label htmlFor="dest-mandi" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                {t('transport.destinationMandi', language)} *
              </label>
              <select
                id="dest-mandi"
                value={selectedMandiId}
                onChange={(e) => setSelectedMandiId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold bg-white focus:outline-none focus:border-emerald-600"
              >
                {DEFAULT_MANDIS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crop & Quantity */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="crop-name" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                {t('transport.cropBeingTransported', language)} *
              </label>
              <input
                id="crop-name"
                type="text"
                required
                placeholder="e.g. Onion / Soybean / Wheat"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                {t('transport.quantityQuintals', language)} *
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="250"
                required
                value={quantityQuintals}
                onChange={(e) => setQuantityQuintals(Number(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Vehicle Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
              {t('transport.selectCarrierSize', language)} *
            </label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VEHICLE_OPTIONS.map((v) => {
                const isSelected = selectedVehicleType === v.type;
                const isOverCapacity = quantityQuintals > v.capacityQuintals;

                return (
                  <button
                    type="button"
                    key={v.type}
                    onClick={() => setSelectedVehicleType(v.type)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-primary-100 bg-white hover:border-primary-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-primary-950">{v.label.split('(')[0]}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-primary-700">{v.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-primary-100 flex items-center justify-between text-xs">
                      <span className="text-primary-600">{t('transport.capacityLabel', language, { cap: v.capacityQuintals })}</span>
                      {isOverCapacity && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          {t('transport.mayRequireTwo', language)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Calculated Trip Cost Breakdown */}
          <div className="p-5 rounded-2xl bg-primary-50/90 border border-primary-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-3">
              {t('transport.costBreakdownHeading', language)}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-primary-200">
                <span className="text-[10px] uppercase font-bold text-primary-500 block">{t('transport.tripDistance', language)}</span>
                <strong className="text-sm font-bold text-primary-950">
                  {tripEstimates.distanceKm} km
                </strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-primary-200">
                <span className="text-[10px] uppercase font-bold text-primary-500 block">{t('transport.transitTime', language)}</span>
                <strong className="text-sm font-bold text-emerald-800">
                  ~{tripEstimates.estimatedTransitMinutes} mins
                </strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-primary-200">
                <span className="text-[10px] uppercase font-bold text-primary-500 block">{t('transport.freightPerQuintal', language)}</span>
                <strong className="text-sm font-bold text-primary-950">
                  ₹{tripEstimates.costPerQuintal} / Qtl
                </strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-300 ring-1 ring-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">{t('transport.totalFreight', language)}</span>
                <strong className="text-base font-extrabold text-emerald-950">
                  ₹{tripEstimates.totalCost.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-lg hover:shadow-emerald-600/20 text-base disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{t('transport.matchingCarrier', language)}</span>
              </>
            ) : (
              <>
                <span>{t('transport.dispatchBtn', language)}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
