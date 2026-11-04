'use client';

import React from 'react';
import { Truck, Sparkles } from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import VehicleBookingTab from '@/components/transport/VehicleBookingTab';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function VehicleBookingPage() {
  const { language } = useLanguage();

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-primary-950 text-white rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-emerald-800/40">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white">
            <Truck className="w-80 h-80" />
          </div>

          <div className="max-w-3xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('nav.vehicleBooking', language)}
            </div>
            <h1 className="display-font text-3xl sm:text-5xl font-extrabold leading-tight">
              {t('transport.formHeading', language)}
            </h1>
            <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed">
              {t('transport.formSubheading', language)}
            </p>
          </div>
        </div>

        {/* Transport Booking Form & Token Generation Component */}
        <VehicleBookingTab />
      </div>
    </PageContainer>
  );
}
