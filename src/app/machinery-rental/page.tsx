'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  Phone,
  MapPin,
  BookOpen,
  Layers,
  Gauge,
  Clock,
  UserCheck,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import MachineryIllustration from '@/components/machinery/MachineryIllustration';
import {
  FARM_MACHINERY_CATALOG,
  FarmMachine,
  FarmingStage,
} from '@/lib/machinery-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function MachineryRentalPage() {
  const { language } = useLanguage();
  const [selectedStage, setSelectedStage] = useState<'all' | FarmingStage>('all');
  const [selectedMachine, setSelectedMachine] = useState<FarmMachine>(FARM_MACHINERY_CATALOG[0]);

  // Filtered machinery based on farming stage
  const filteredMachines = FARM_MACHINERY_CATALOG.filter((m) => {
    if (selectedStage === 'all') return true;
    return m.stage === selectedStage;
  });

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-primary-950 to-emerald-950 text-white rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white">
            <Wrench className="w-80 h-80" />
          </div>

          <div className="max-w-3xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('machinery.eyebrow', language)}
            </div>
            <h1 className="display-font text-3xl sm:text-5xl font-extrabold leading-tight">
              {t('machinery.title', language)}
            </h1>
            <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed">
              {t('machinery.subtitle', language)}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
         * FEATURED MACHINERY SPOTLIGHT (SVG ILLUSTRATION & TECHNICAL SPECS)
         * ════════════════════════════════════════════════════════════════════ */}
        <section className="bg-white rounded-[2rem] border border-primary-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-100 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                {t('machinery.spotlight', language)}
              </span>
              <h2 className="text-2xl font-bold text-primary-950 mt-0.5">
                {language === 'hi' ? selectedMachine.hindiName || selectedMachine.name : language === 'mr' ? selectedMachine.marathiName || selectedMachine.name : selectedMachine.name}
              </h2>
              <p className="text-xs text-primary-700">
                {selectedMachine.hindiName} • {selectedMachine.marathiName}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{t('machinery.hourlyRateLabel', language)}</span>
              <strong className="text-2xl font-black text-emerald-800">
                ₹{selectedMachine.hourlyRentalRate}
              </strong>{' '}
              <span className="text-xs text-primary-700">{t('machinery.perHour', language)}</span>
              {selectedMachine.perAcreRentalRate && (
                <div className="text-[11px] font-semibold text-primary-600">
                  ₹{selectedMachine.perAcreRentalRate} {t('machinery.perAcre', language)}
                </div>
              )}
            </div>
          </div>

          {/* Spotlight Hero Illustration & Specs Layout */}
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            {/* Real Visual Photo Display */}
            <div className="lg:col-span-7 bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200 flex items-center justify-center">
              <div className="w-full max-w-md mx-auto aspect-[16/10] flex items-center justify-center">
                <MachineryIllustration id={selectedMachine.id} name={selectedMachine.name} />
              </div>
            </div>

            {/* Technical Specifications & Direct Owner Contact */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('machinery.engineeringOverview', language)}
                </span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {selectedMachine.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-primary-50/70 border border-primary-100">
                  <span className="text-[10px] uppercase font-bold text-primary-600 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {t('machinery.farmingStage', language)}
                  </span>
                  <strong className="text-xs text-primary-950 font-bold block mt-0.5 truncate">
                    {selectedMachine.stageLabel}
                  </strong>
                </div>

                <div className="p-3 rounded-2xl bg-primary-50/70 border border-primary-100">
                  <span className="text-[10px] uppercase font-bold text-primary-600 flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> {t('machinery.horsepower', language)}
                  </span>
                  <strong className="text-xs text-primary-950 font-bold block mt-0.5 truncate">
                    {selectedMachine.hpRequired}
                  </strong>
                </div>
              </div>

              {/* Technical Spec List */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {t('machinery.specifications', language)}
                </span>
                {Object.entries(selectedMachine.specifications).slice(0, 3).map(([key, val]) => {
                  const translatedKey =
                    key === 'Working Depth' ? t('machinery.specWorkingDepth', language) :
                    key === 'Furrow Width' ? t('machinery.specFurrowWidth', language) :
                    key === 'Hydraulic Turnover' ? t('machinery.specHydraulicTurnover', language) :
                    key === 'Field Capacity' ? t('machinery.specFieldCapacity', language) :
                    key === 'Fuel Consumption' ? t('machinery.specFuelConsumption', language) : key;
                  return (
                    <div key={key} className="flex justify-between items-center text-[11px] border-b border-slate-200/60 pb-1 last:border-none last:pb-0">
                      <span className="text-slate-600">{translatedKey}:</span>
                      <strong className="text-slate-900 font-semibold">{val}</strong>
                    </div>
                  );
                })}
              </div>

              {/* Machine Owner Contact Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <UserCheck className="w-3 h-3 text-emerald-700" />
                    {t('machinery.ownerDetails', language)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800">
                    {selectedMachine.provider.distanceKm} km away
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-primary-950">
                    {selectedMachine.provider.operatorName}
                  </div>
                  <div className="text-[11px] text-primary-700 font-medium">
                    {selectedMachine.provider.name} ({selectedMachine.provider.type})
                  </div>
                  <div className="text-[11px] text-primary-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{selectedMachine.provider.hubLocation}</span>
                  </div>
                </div>

                <a
                  href={`tel:${selectedMachine.provider.operatorPhone}`}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 py-3 rounded-xl transition-colors shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('machinery.callOwnerBtn', language)} ({selectedMachine.provider.operatorPhone})</span>
                </a>

                <p className="text-[10px] text-emerald-800 text-center font-medium">
                  {t('machinery.noCommission', language)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
         * FARMING PROCESS STAGES FILTER BAR
         * ════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
          <button
            type="button"
            onClick={() => setSelectedStage('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === 'all'
                ? 'bg-primary-900 text-white shadow-md'
                : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
            }`}
          >
            {t('machinery.allMachinery', language)} ({FARM_MACHINERY_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStage('ploughing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === 'ploughing'
                ? 'bg-amber-700 text-white shadow-md'
                : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
            }`}
          >
            1. {t('machinery.stagePloughing', language)}
          </button>
          <button
            type="button"
            onClick={() => setSelectedStage('sowing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === 'sowing'
                ? 'bg-blue-700 text-white shadow-md'
                : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
            }`}
          >
            2. {t('machinery.stageSowing', language)}
          </button>
          <button
            type="button"
            onClick={() => setSelectedStage('harvesting')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === 'harvesting'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
            }`}
          >
            3. {t('machinery.stageHarvesting', language)}
          </button>
          <button
            type="button"
            onClick={() => setSelectedStage('threshing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === 'threshing'
                ? 'bg-sky-700 text-white shadow-md'
                : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
            }`}
          >
            4. {t('machinery.stageThreshing', language)}
          </button>
          <button
            type="button"
            onClick={() => setSelectedStage('hulling')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === 'hulling'
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
            }`}
          >
            5. {t('machinery.stageHulling', language)}
          </button>
          <button
            type="button"
            onClick={() => setSelectedStage('land_prep')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === 'land_prep'
                ? 'bg-rose-700 text-white shadow-md'
                : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
            }`}
          >
            6. {t('machinery.stageLandPrep', language)}
          </button>
          <button
            type="button"
            onClick={() => setSelectedStage('protection')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === 'protection'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
            }`}
          >
            7. {t('machinery.stageProtection', language)}
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
         * COMPLETE MACHINERY LIST (ALL WITH PHOTOS, SPECS & OWNER CONTACT)
         * ════════════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredMachines.map((machine) => {
            const isCurrentlyInspected = selectedMachine.id === machine.id;

            return (
              <div
                key={machine.id}
                className={`bg-white rounded-3xl border-2 transition-all p-6 shadow-md flex flex-col justify-between space-y-4 ${
                  isCurrentlyInspected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xl'
                    : 'border-primary-100 hover:border-primary-300'
                }`}
              >
                <div>
                  {/* Category & Provider Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-900 uppercase tracking-wider">
                      {machine.stageLabel}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {machine.provider.type}
                    </span>
                  </div>

                  {/* Real Photo Machinery Display (Visible on every single card) */}
                  <div className="w-full bg-slate-50/80 rounded-2xl border border-slate-200/80 p-2 mb-4 flex items-center justify-center overflow-hidden">
                    <div className="w-full max-w-sm aspect-[16/10]">
                      <MachineryIllustration id={machine.id} name={machine.name} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-primary-950 leading-snug">
                    {language === 'hi' ? machine.hindiName || machine.name : language === 'mr' ? machine.marathiName || machine.name : machine.name}
                  </h3>
                  <p className="text-xs text-primary-600 font-medium">
                    {machine.hindiName} • {machine.marathiName}
                  </p>
                  <p className="text-xs text-primary-700 mt-1 leading-relaxed">
                    {machine.description}
                  </p>

                  {/* Hourly & Per Acre Rates */}
                  <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-emerald-700 font-bold text-[10px] uppercase block">{t('machinery.hourlyRateLabel', language)}</span>
                      <strong className="text-lg font-black text-emerald-950">
                        ₹{machine.hourlyRentalRate}
                      </strong>{' '}
                      <span className="text-[11px] text-emerald-800">{t('machinery.perHour', language)}</span>
                    </div>

                    {machine.perAcreRentalRate && (
                      <div className="text-right">
                        <span className="text-emerald-700 font-bold text-[10px] uppercase block">{t('machinery.perAcre', language)}</span>
                        <strong className="text-base font-extrabold text-emerald-950">
                          ₹{machine.perAcreRentalRate}
                        </strong>{' '}
                        <span className="text-[11px] text-emerald-800">{t('machinery.perAcre', language)}</span>
                      </div>
                    )}
                  </div>

                  {/* Machine Owner & Operator Details */}
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('machinery.ownerOperator', language)}</span>
                        <strong className="text-slate-900 font-bold text-xs">{machine.provider.operatorName}</strong>
                      </div>
                      <span className="text-slate-600 font-semibold text-[11px]">{machine.provider.distanceKm} km away</span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-medium">
                      {machine.provider.name}
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{machine.provider.hubLocation}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-semibold">{t('machinery.directPhone', language)}:</span>
                      <a
                        href={`tel:${machine.provider.operatorPhone}`}
                        className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{machine.provider.operatorPhone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Card Actions: View Specs and Call Owner */}
                <div className="pt-3 border-t border-primary-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMachine(machine);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors ${
                      isCurrentlyInspected
                        ? 'bg-slate-900 text-white'
                        : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isCurrentlyInspected ? t('machinery.selectedInSpotlight', language) : t('machinery.viewSpecs', language)}</span>
                  </button>

                  <a
                    href={`tel:${machine.provider.operatorPhone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t('machinery.callOwnerBtn', language)}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Citations Footer Note */}
        <div className="p-5 rounded-2xl bg-white border border-primary-200 shadow-sm flex items-start gap-3 text-xs text-primary-700">
          <BookOpen className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-primary-950 block font-bold">{t('machinery.citationsHeading', language)}</strong>
            <p className="leading-relaxed">
              {t('machinery.citationsBody', language)}
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
