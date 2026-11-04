'use client';

import React, { useState } from 'react';
import {
  Sprout,
  Shield,
  Leaf,
  FlaskConical,
  Bug,
  CheckCircle2,
  BookOpen,
  Search,
  AlertCircle,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import {
  CROP_CARE_CATALOG,
  CropCareItem,
  getCropCareForCrop,
  CropCategory,
  scaleDosage,
} from '@/lib/crop-care-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function CropCarePage() {
  const { language } = useLanguage();
  // State
  const [selectedCropId, setSelectedCropId] = useState<string>('wheat');
  const [activeTab, setActiveTab] = useState<'fertilizers' | 'pesticides'>('fertilizers');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CropCategory>('all');
  const [searchCrop, setSearchCrop] = useState('');
  const [acreageInput, setAcreageInput] = useState<string>('1');

  // Validate exact acreage input (> 0, allows decimals like 3.7 or 12.25)
  const parsedAcreage = parseFloat(acreageInput);
  const isValidAcreage = Number.isFinite(parsedAcreage) && parsedAcreage > 0;
  const activeAcreage = isValidAcreage ? parsedAcreage : 1;
  const acreageError =
    acreageInput.trim() === ''
      ? t('cropCare.errorEmpty', language)
      : !isValidAcreage
      ? t('cropCare.errorInvalid', language)
      : null;

  // Active crop care record
  const currentCare: CropCareItem = getCropCareForCrop(selectedCropId);

  // Filter crops
  const filteredCrops = CROP_CARE_CATALOG.filter((c) => {
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesSearch =
      !searchCrop.trim() ||
      c.cropName.toLowerCase().includes(searchCrop.toLowerCase()) ||
      c.hindiName.toLowerCase().includes(searchCrop.toLowerCase()) ||
      c.marathiName.toLowerCase().includes(searchCrop.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-primary-950 text-white rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-emerald-800/40">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white">
            <Sprout className="w-80 h-80" />
          </div>

          <div className="max-w-3xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              {t('cropCare.eyebrow', language)}
            </div>
            <h1 className="display-font text-3xl sm:text-5xl font-extrabold leading-tight">
              {t('cropCare.title', language)}
            </h1>
            <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed">
              {t('cropCare.subtitle', language)}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
         * CROP SELECTOR BAR (Covers All 24 Crops Across App)
         * ════════════════════════════════════════════════════════════════════ */}
        <section className="bg-white/95 rounded-[2rem] border border-primary-200 shadow-xl p-6 sm:p-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                {t('cropCare.step1', language)}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-primary-950 mt-0.5">
                {t('cropCare.selectCrop', language)}
              </h2>
            </div>

            {/* Search and Category Filter Chips */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-primary-400" />
                <input
                  type="text"
                  value={searchCrop}
                  onChange={(e) => setSearchCrop(e.target.value)}
                  placeholder={t('cropCare.searchPlaceholder', language)}
                  className="w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-xl border border-primary-200 text-xs font-medium text-primary-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  aria-label="Search crop"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    categoryFilter === 'all'
                      ? 'bg-primary-900 text-white shadow-sm'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {t('cropCare.allCrops', language)} ({CROP_CARE_CATALOG.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('cereal')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    categoryFilter === 'cereal'
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {t('cropCare.cereals', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('pulse')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    categoryFilter === 'pulse'
                      ? 'bg-indigo-700 text-white shadow-sm'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {t('cropCare.pulses', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('vegetable')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    categoryFilter === 'vegetable'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {t('cropCare.vegetables', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('commercial')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    categoryFilter === 'commercial'
                      ? 'bg-rose-700 text-white shadow-sm'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {t('cropCare.commercial', language)}
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Crop Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {filteredCrops.map((crop) => {
              const isSelected = currentCare.id === crop.id;
              return (
                <button
                  type="button"
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`text-left p-3 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-primary-100 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-sm font-bold text-primary-950">{crop.cropName}</strong>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-primary-600 font-medium">
                    {crop.hindiName} • {crop.growthDurationDays} Days
                  </div>
                </button>
              );
            })}
          </div>

          {/* Exact Land Size Dosage Calculator Input */}
          <div className="pt-4 border-t border-primary-100 space-y-2.5 bg-primary-50/60 p-4 rounded-2xl text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label htmlFor="farm-acreage-input" className="font-extrabold text-primary-950 text-xs block">
                  {t('cropCare.calcDosageForLand', language)}
                </label>
                <p className="text-[11px] text-primary-600 mt-0.5">
                  {t('cropCare.calcDosageSub', language)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    id="farm-acreage-input"
                    type="number"
                    step="any"
                    min="0.01"
                    value={acreageInput}
                    onChange={(e) => setAcreageInput(e.target.value)}
                    placeholder="e.g. 3.7"
                    className={`w-36 pr-14 pl-3 py-2 rounded-xl text-xs font-bold bg-white border focus:outline-none focus:ring-2 ${
                      acreageError
                        ? 'border-red-400 focus:ring-red-400 text-red-900'
                        : 'border-emerald-300 focus:ring-emerald-500 text-emerald-950'
                    }`}
                    aria-label="Farm size in acres"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-primary-500 pointer-events-none">
                    {t('cropCare.acres', language)}
                  </span>
                </div>

                {/* Quick preset buttons for convenience */}
                <div className="hidden md:flex items-center gap-1">
                  {[1, 2.5, 3.7, 5, 12.25].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setAcreageInput(String(preset))}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                        acreageInput === String(preset)
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-white text-primary-700 border-primary-200 hover:bg-primary-100'
                      }`}
                    >
                      {preset} Ac
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message if Invalid */}
            {acreageError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{acreageError}</span>
              </div>
            )}

            {/* Scaled confirmation badge */}
            {!acreageError && (
              <div className="flex items-center justify-between text-[11px] text-emerald-900 bg-emerald-100/70 px-3 py-1.5 rounded-xl font-medium border border-emerald-200">
                <span>
                  ✓ {t('cropCare.scalingBadge', language)}: <strong>{activeAcreage} {t('cropCare.acres', language)}</strong>
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-800">
                  {activeAcreage === 1 ? '1.0x Baseline' : `${activeAcreage}x Proportional Scale`}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
         * DUAL-TAB TOGGLE: FERTILIZERS vs PESTICIDES (On the Same Page)
         * ════════════════════════════════════════════════════════════════════ */}
        <div className="flex rounded-2xl border-2 border-primary-200 bg-white/95 p-1.5 shadow-md" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'fertilizers'}
            onClick={() => setActiveTab('fertilizers')}
            className={`flex-1 py-3 px-4 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'fertilizers'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-primary-700 hover:text-primary-950 hover:bg-primary-100/50'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-300" />
            <span>{t('cropCare.tabFertilizers', language)}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pesticides'}
            onClick={() => setActiveTab('pesticides')}
            className={`flex-1 py-3 px-4 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pesticides'
                ? 'bg-teal-800 text-white shadow-md'
                : 'text-primary-700 hover:text-primary-950 hover:bg-primary-100/50'
            }`}
          >
            <Shield className="w-4 h-4 text-teal-300" />
            <span>{t('cropCare.tabPesticides', language)}</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
         * TAB 1: FERTILIZER RECOMMENDATIONS (Organic vs Inorganic Side-by-Side)
         * ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'fertilizers' ? (
          <section className="space-y-6 animate-in fade-in duration-150">
            {/* Primary Recommendation Headline */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-1">
                ICAR Recommended Fertilizer Protocol for {currentCare.cropName} ({currentCare.hindiName})
              </span>
              <h3 className="text-lg font-bold text-emerald-950">
                {currentCare.fertilizerAdvisory.primaryRecommendationSummary}
              </h3>
              <p className="text-xs text-emerald-800 mt-1 font-medium">
                💡 Soil Health Note: {currentCare.fertilizerAdvisory.soilHealthNote}
              </p>
            </div>

            {/* Side-by-Side Organic vs Inorganic Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Organic Option */}
              <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 shadow-lg flex flex-col justify-between space-y-5 relative">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      Option A: 100% Organic & Bio-Fertilizer
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Suitability: {currentCare.fertilizerAdvisory.organicOption.suitabilityScore}%
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-primary-950">
                    {currentCare.fertilizerAdvisory.organicOption.name}
                  </h4>
                  <p className="text-xs text-primary-700 mt-1">
                    {currentCare.fertilizerAdvisory.organicOption.suitabilityReason}
                  </p>

                  {/* Composition & Dosage */}
                  <div className="mt-4 space-y-2 bg-primary-50/70 p-4 rounded-2xl border border-primary-100 text-xs">
                    <div>
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Composition / Bio-Agents</span>
                      <strong className="text-primary-950 font-semibold">{currentCare.fertilizerAdvisory.organicOption.composition}</strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">
                        Dosage for {isValidAcreage ? activeAcreage : 1} Acre{activeAcreage === 1 ? '' : 's'}
                      </span>
                      <strong className="text-emerald-800 font-bold">
                        {scaleDosage(currentCare.fertilizerAdvisory.organicOption.dosagePerAcre, activeAcreage)}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Stage & Application Method</span>
                      <strong className="text-primary-950 font-semibold">{currentCare.fertilizerAdvisory.organicOption.applicationStage} — {currentCare.fertilizerAdvisory.organicOption.applicationMethod}</strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Estimated Cost</span>
                      <strong className="text-primary-950 font-extrabold text-sm">{currentCare.fertilizerAdvisory.organicOption.priceEstimate}</strong>
                    </div>
                  </div>

                  {/* Benefits Bullets */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-emerald-800 block">Agronomic Advantages:</span>
                    <ul className="text-xs text-primary-800 space-y-1">
                      {currentCare.fertilizerAdvisory.organicOption.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Farmer Precaution: </strong>
                  {currentCare.fertilizerAdvisory.organicOption.precautions.join(' ')}
                </div>
              </div>

              {/* Inorganic / Chemical Option */}
              <div className="bg-white rounded-3xl border-2 border-blue-400 p-6 shadow-lg flex flex-col justify-between space-y-5 relative">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
                      <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                      Option B: Subsidized Inorganic Mineral Fertilizer
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Suitability: {currentCare.fertilizerAdvisory.inorganicOption.suitabilityScore}%
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-primary-950">
                    {currentCare.fertilizerAdvisory.inorganicOption.name}
                  </h4>
                  <p className="text-xs text-primary-700 mt-1">
                    {currentCare.fertilizerAdvisory.inorganicOption.suitabilityReason}
                  </p>

                  {/* Composition & Dosage */}
                  <div className="mt-4 space-y-2 bg-primary-50/70 p-4 rounded-2xl border border-primary-100 text-xs">
                    <div>
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Composition (NPK Formulation)</span>
                      <strong className="text-primary-950 font-semibold">{currentCare.fertilizerAdvisory.inorganicOption.composition}</strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">
                        Dosage for {isValidAcreage ? activeAcreage : 1} Acre{activeAcreage === 1 ? '' : 's'}
                      </span>
                      <strong className="text-blue-800 font-bold">
                        {scaleDosage(currentCare.fertilizerAdvisory.inorganicOption.dosagePerAcre, activeAcreage)}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Stage & Application Method</span>
                      <strong className="text-primary-950 font-semibold">{currentCare.fertilizerAdvisory.inorganicOption.applicationStage} — {currentCare.fertilizerAdvisory.inorganicOption.applicationMethod}</strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Subsidized Government Price (FCO)</span>
                      <strong className="text-primary-950 font-extrabold text-sm">{currentCare.fertilizerAdvisory.inorganicOption.priceEstimate}</strong>
                    </div>
                  </div>

                  {/* Benefits Bullets */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-blue-800 block">Agronomic Advantages:</span>
                    <ul className="text-xs text-primary-800 space-y-1">
                      {currentCare.fertilizerAdvisory.inorganicOption.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Farmer Precaution: </strong>
                  {currentCare.fertilizerAdvisory.inorganicOption.precautions.join(' ')}
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* ════════════════════════════════════════════════════════════════════
           * TAB 2: PESTICIDE RECOMMENDATIONS (Organic vs Chemical Side-by-Side)
           * ════════════════════════════════════════════════════════════════════ */
          <section className="space-y-6 animate-in fade-in duration-150">
            {/* Primary Protection Headline & Target Pests */}
            <div className="bg-teal-50 rounded-2xl p-5 border border-teal-200 space-y-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 block mb-1">
                  CIBRC Certified Crop Protection Strategy for {currentCare.cropName} ({currentCare.hindiName})
                </span>
                <h3 className="text-lg font-bold text-teal-950">
                  {currentCare.pesticideAdvisory.primaryProtectionSummary}
                </h3>
              </div>

              {/* Target Pests & Diseases Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-teal-200">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1">
                  <Bug className="w-3.5 h-3.5 text-teal-700" /> Major Pests & Diseases Covered:
                </span>
                {currentCare.pesticideAdvisory.targetPests.map((pest, i) => (
                  <span key={i} className="text-[11px] font-bold bg-white text-teal-900 border border-teal-300 px-2.5 py-0.5 rounded-full">
                    🐛 {pest}
                  </span>
                ))}
                {currentCare.pesticideAdvisory.targetDiseases.map((dis, i) => (
                  <span key={i} className="text-[11px] font-bold bg-white text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full">
                    🦠 {dis}
                  </span>
                ))}
              </div>
            </div>

            {/* Side-by-Side Organic Bio-Pesticide vs Chemical Pesticide */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Organic Bio-Pesticide */}
              <div className="bg-white rounded-3xl border-2 border-teal-400 p-6 shadow-lg flex flex-col justify-between space-y-5 relative">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-300">
                      <Leaf className="w-3.5 h-3.5 text-teal-600" />
                      Option A: Botanical & Bio-Pesticide
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Suitability: {currentCare.pesticideAdvisory.organicOption.suitabilityScore}%
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-primary-950">
                    {currentCare.pesticideAdvisory.organicOption.name}
                  </h4>
                  <p className="text-xs text-primary-700 mt-1">
                    {currentCare.pesticideAdvisory.organicOption.suitabilityReason}
                  </p>

                  {/* Scientific Details */}
                  <div className="mt-4 space-y-2 bg-primary-50/70 p-4 rounded-2xl border border-primary-100 text-xs">
                    <div>
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Active Microbial / Botanical Ingredient</span>
                      <strong className="text-primary-950 font-semibold">{currentCare.pesticideAdvisory.organicOption.activeIngredient}</strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">
                        Dosage for {isValidAcreage ? activeAcreage : 1} Acre{activeAcreage === 1 ? '' : 's'}
                      </span>
                      <strong className="text-teal-800 font-bold">
                        {scaleDosage(currentCare.pesticideAdvisory.organicOption.dosagePerAcre, activeAcreage)}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-primary-500 font-bold uppercase text-[10px] block">Pre-Harvest Interval (PHI)</span>
                        <strong className="text-emerald-800 font-bold text-sm">
                          {currentCare.pesticideAdvisory.organicOption.preHarvestIntervalDays} Days (Safe)
                        </strong>
                      </div>
                      <div>
                        <span className="text-primary-500 font-bold uppercase text-[10px] block">Toxicity Class</span>
                        <strong className="text-emerald-800 font-bold text-xs">
                          {currentCare.pesticideAdvisory.organicOption.toxicityLabel}
                        </strong>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Treatment Cost</span>
                      <strong className="text-primary-950 font-extrabold text-sm">{currentCare.pesticideAdvisory.organicOption.priceEstimate}</strong>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-teal-800 block">Eco-Safety Advantages:</span>
                    <ul className="text-xs text-primary-800 space-y-1">
                      {currentCare.pesticideAdvisory.organicOption.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px]">
                  <strong>Application Guidance: </strong>
                  {currentCare.pesticideAdvisory.organicOption.safetyPrecautions.join(' ')}
                </div>
              </div>

              {/* Chemical Synthetic Pesticide */}
              <div className="bg-white rounded-3xl border-2 border-rose-400 p-6 shadow-lg flex flex-col justify-between space-y-5 relative">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
                      <FlaskConical className="w-3.5 h-3.5 text-rose-600" />
                      Option B: Targeted Chemical Protection
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Suitability: {currentCare.pesticideAdvisory.chemicalOption.suitabilityScore}%
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-primary-950">
                    {currentCare.pesticideAdvisory.chemicalOption.name}
                  </h4>
                  <p className="text-xs text-primary-700 mt-1">
                    {currentCare.pesticideAdvisory.chemicalOption.suitabilityReason}
                  </p>

                  {/* Scientific Details */}
                  <div className="mt-4 space-y-2 bg-primary-50/70 p-4 rounded-2xl border border-primary-100 text-xs">
                    <div>
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Active Chemical Chemistry</span>
                      <strong className="text-primary-950 font-semibold">{currentCare.pesticideAdvisory.chemicalOption.activeIngredient}</strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">
                        Dosage for {isValidAcreage ? activeAcreage : 1} Acre{activeAcreage === 1 ? '' : 's'}
                      </span>
                      <strong className="text-rose-800 font-bold">
                        {scaleDosage(currentCare.pesticideAdvisory.chemicalOption.dosagePerAcre, activeAcreage)}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-primary-200 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-primary-500 font-bold uppercase text-[10px] block">Mandatory Waiting Period (PHI)</span>
                        <strong className="text-rose-800 font-extrabold text-sm">
                          {currentCare.pesticideAdvisory.chemicalOption.preHarvestIntervalDays} Days Waiting
                        </strong>
                      </div>
                      <div>
                        <span className="text-primary-500 font-bold uppercase text-[10px] block">Toxicity Class</span>
                        <strong className="text-amber-800 font-bold text-xs">
                          {currentCare.pesticideAdvisory.chemicalOption.toxicityLabel}
                        </strong>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-primary-200">
                      <span className="text-primary-500 font-bold uppercase text-[10px] block">Market Treatment Cost</span>
                      <strong className="text-primary-950 font-extrabold text-sm">{currentCare.pesticideAdvisory.chemicalOption.priceEstimate}</strong>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-rose-800 block">Knockdown Advantages:</span>
                    <ul className="text-xs text-primary-800 space-y-1">
                      {currentCare.pesticideAdvisory.chemicalOption.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px]">
                  <strong>Mandatory Safety Precaution: </strong>
                  {currentCare.pesticideAdvisory.chemicalOption.safetyPrecautions.join(' ')}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Research Citations Footer Note */}
        <div className="p-5 rounded-2xl bg-white border border-primary-200 shadow-sm flex items-start gap-3 text-xs text-primary-700">
          <BookOpen className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-primary-950 block font-bold">Official Agricultural Data Sources & Citations:</strong>
            <p className="leading-relaxed">
              Advisories compiled in strict adherence with guidelines from the <strong>Indian Council of Agricultural Research (ICAR)</strong>, the <strong>Central Insecticide Board & Registration Committee (CIBRC)</strong>, and the <strong>Fertilizer Control Order (FCO) 1985</strong>, Ministry of Agriculture & Farmers Welfare, Government of India.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
