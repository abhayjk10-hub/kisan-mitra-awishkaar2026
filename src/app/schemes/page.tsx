'use client';

import React, { useState } from 'react';
import {
  Shield,
  Heart,
  CreditCard,
  Wallet,
  Sun,
  UserCheck,
  ExternalLink,
  Phone,
  Search,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import {
  OFFICIAL_KISAN_SCHEMES,
  SchemeCategory,
  SchemeItem,
} from '@/lib/schemes-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function SchemesPage() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'all' | SchemeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalScheme, setActiveModalScheme] = useState<SchemeItem | null>(null);

  const filteredSchemes = OFFICIAL_KISAN_SCHEMES.filter((scheme) => {
    const matchesCat = selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getSchemeIcon = (iconType: SchemeItem['iconType']) => {
    switch (iconType) {
      case 'shield':
        return <Shield className="w-6 h-6 text-emerald-400" />;
      case 'heart':
        return <Heart className="w-6 h-6 text-rose-400" />;
      case 'credit-card':
        return <CreditCard className="w-6 h-6 text-amber-400" />;
      case 'wallet':
        return <Wallet className="w-6 h-6 text-lime-400" />;
      case 'sun':
        return <Sun className="w-6 h-6 text-orange-400" />;
      case 'user-check':
        return <UserCheck className="w-6 h-6 text-indigo-400" />;
      default:
        return <Shield className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-primary-950 to-slate-950 text-white rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-emerald-800/40">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white">
            <Shield className="w-80 h-80" />
          </div>

          <div className="max-w-3xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('schemes.hubEyebrow', language)}
            </div>
            <h1 className="display-font text-3xl sm:text-5xl font-extrabold leading-tight">
              {t('schemes.title', language)}
            </h1>
            <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed">
              {t('schemes.subtitle', language)}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
         * SEARCH & CATEGORY FILTER TABS
         * ════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-primary-900 text-white shadow-md'
                  : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
              }`}
            >
              {t('schemes.allSchemes', language)} ({OFFICIAL_KISAN_SCHEMES.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('insurance')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'insurance'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {t('schemes.catInsurance', language)}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('health')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'health'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Health Insurance (PM-JAY)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('credit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'credit'
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              {t('schemes.catCredit', language)}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('income')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'income'
                  ? 'bg-lime-700 text-white shadow-md'
                  : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              {t('schemes.catIncome', language)}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('solar_infra')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'solar_infra'
                  ? 'bg-orange-700 text-white shadow-md'
                  : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              {t('schemes.catSolar', language)}
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-2.5 text-primary-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('schemes.searchPlaceholder', language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-primary-200 bg-white text-primary-950 font-medium focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
         * SCHEMES INTERACTIVE CARDS GRID
         * ════════════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl border-2 border-primary-100 hover:border-emerald-600 transition-all shadow-md hover:shadow-xl p-6 sm:p-7 flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Visual Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                      style={{ backgroundColor: scheme.categoryColor }}
                    >
                      {getSchemeIcon(scheme.iconType)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        {scheme.categoryLabel}
                      </span>
                      <h3 className="text-xl font-extrabold text-primary-950 leading-snug">
                        {scheme.name}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                    {scheme.badge}
                  </span>
                </div>

                <p className="text-xs text-primary-700 font-medium leading-relaxed">
                  {scheme.tagline}
                </p>

                {/* Key Benefits List */}
                <div className="mt-4 space-y-1.5 bg-primary-50/70 p-4 rounded-2xl border border-primary-100 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block mb-1">
                    Direct Farmer Benefits:
                  </span>
                  <ul className="space-y-1 text-primary-900">
                    {scheme.keyBenefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Authority & Helpline */}
                <div className="mt-3 flex items-center justify-between text-xs text-primary-600 flex-wrap gap-2 pt-2 border-t border-primary-100">
                  <span className="text-[11px] text-slate-600">
                    Ministry: <strong>{scheme.ministryOrAuthority.split(',')[0]}</strong>
                  </span>
                  <a
                    href={`tel:${scheme.helplinePhone.split(' ')[0]}`}
                    className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{scheme.helplinePhone}</span>
                  </a>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-primary-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalScheme(scheme)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-800 bg-primary-100 hover:bg-primary-200 px-3.5 py-2.5 rounded-xl transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Eligibility & Documents</span>
                </button>

                <a
                  href={scheme.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
         * SCHEME ELIGIBILITY & DOCUMENT CHECKLIST MODAL
         * ════════════════════════════════════════════════════════════════════ */}
        {activeModalScheme && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-primary-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-primary-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Official Guidelines & Checklist
                  </span>
                  <h3 className="text-xl font-extrabold text-primary-950 mt-0.5">
                    {activeModalScheme.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalScheme(null)}
                  className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-primary-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Who is Eligible?
                </h4>
                <ul className="space-y-1.5 pl-2 text-primary-800">
                  {activeModalScheme.eligibilityCriteria.map((crit, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents Required */}
              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-700" />
                  Mandatory Documents Checklist:
                </h4>
                <ul className="space-y-1.5 text-slate-800">
                  {activeModalScheme.documentsRequired.map((doc, i) => (
                    <li key={i} className="flex items-start gap-1.5 font-medium">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How to Apply */}
              <div className="text-xs text-primary-800 space-y-1">
                <strong className="text-primary-950 block font-bold uppercase tracking-wider text-[11px]">
                  How to Enroll:
                </strong>
                <p className="leading-relaxed">{activeModalScheme.applicationProcedure}</p>
              </div>

              {/* Modal Footer with External Direct Link */}
              <div className="pt-3 border-t border-primary-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalScheme(null)}
                  className="px-4 py-2.5 rounded-xl border border-primary-200 text-primary-800 font-bold text-xs hover:bg-primary-50"
                >
                  Close
                </button>

                <a
                  href={activeModalScheme.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-5 py-2.5 rounded-xl transition-colors shadow-md"
                >
                  <span>Open {activeModalScheme.acronym} Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
