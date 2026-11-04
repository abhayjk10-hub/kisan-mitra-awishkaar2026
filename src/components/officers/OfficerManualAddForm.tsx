'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { registerOfficer, SHARED_DEMO_PASSWORD } from '@/lib/officer-service';
import { OfficerProfile } from '@/types/officer';

interface OfficerManualAddFormProps {
  onSuccess?: (newOfficer: OfficerProfile) => void;
  className?: string;
}

export default function OfficerManualAddForm({
  onSuccess,
  className = '',
}: OfficerManualAddFormProps) {
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [batchId, setBatchId] = useState('APMC-B11');
  const [officerId, setOfficerId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(SHARED_DEMO_PASSWORD);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOfficer, setSuccessOfficer] = useState<OfficerProfile | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerOfficer({
        full_name: fullName,
        contact_number: contactNumber,
        batch_id: batchId,
        officer_id: officerId.trim() || undefined,
        email: email.trim() || undefined,
        password: password.trim() || SHARED_DEMO_PASSWORD,
      });

      if (!res.success || !res.officer) {
        setError(res.error || 'Failed to add new inspection officer.');
        setLoading(false);
        return;
      }

      setSuccessOfficer(res.officer);
      setLoading(false);

      // Reset form fields
      setFullName('');
      setContactNumber('');
      setOfficerId('');
      setEmail('');
      setPassword(SHARED_DEMO_PASSWORD);

      if (onSuccess) {
        onSuccess(res.officer);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-primary-200 shadow-xl p-6 sm:p-8 ${className}`}>
      <div className="flex items-center gap-3 border-b border-primary-100 pb-4 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-primary-950">Manual Officer Registration</h3>
          <p className="text-xs text-primary-700">
            Create an APMC inspection officer profile linked to Supabase Auth
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successOfficer && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-sm font-bold text-emerald-900">
              Officer Added Successfully!
            </strong>
            <p className="mt-0.5 text-emerald-800">
              {successOfficer.full_name} ({successOfficer.officer_id}) registered in batch{' '}
              <span className="font-mono font-bold">{successOfficer.batch_id}</span>.
              Login Email: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">{successOfficer.email}</code>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Officer Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Anand K. Bhosale"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Contact Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="e.g. +91 98220 01011"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Batch Identifier (Batch ID) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. APMC-B11"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Officer ID (Optional, auto-generated if blank)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. OFF-011"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Login Email (Optional, auto-generated if blank)
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g. officer011@apmc-demo.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Demo Access Password (Defaults to shared password)
            </label>
            <div className="relative">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Shared demo password: <code className="font-mono font-bold text-emerald-800">{SHARED_DEMO_PASSWORD}</code>
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{loading ? 'Creating Officer Record...' : 'Register Inspection Officer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
