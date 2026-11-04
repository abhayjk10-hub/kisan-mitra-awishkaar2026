'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Users, Shield } from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import OfficerLoginForm from '@/components/officers/OfficerLoginForm';

export default function OfficerLoginPage() {
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Kisan Mitra Home
          </Link>
          <Link
            href="/officers/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Officer Admin Directory
          </Link>
        </div>

        {/* Page Heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-600 to-sky-800 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-900/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            APMC Crop Inspection Officer Portal
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-lg mx-auto">
            Authorized access point for Agricultural Produce Market Committee (APMC) field and quality inspection officers.
          </p>
        </div>

        {/* Login Form Card */}
        <OfficerLoginForm
          redirectTo="/officers/admin"
          className="bg-white/95 backdrop-blur shadow-xl border-sky-100"
        />

        {/* Informational Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-sky-600" />
          <span>Secured with Supabase Auth, Row Level Security (RLS) &amp; APMC Batch Access Control</span>
        </div>
      </div>
    </PageContainer>
  );
}

