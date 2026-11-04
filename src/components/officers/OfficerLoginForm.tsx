'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { loginOfficer, SHARED_DEMO_PASSWORD, SEED_OFFICERS } from '@/lib/officer-service';
import { OfficerAuthSession } from '@/types/officer';

interface OfficerLoginFormProps {
  onSuccess?: (session: OfficerAuthSession) => void;
  redirectTo?: string;
  className?: string;
}

export default function OfficerLoginForm({
  onSuccess,
  redirectTo = '/officers/admin',
  className = '',
}: OfficerLoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(SHARED_DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your officer login email or officer ID.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginOfficer(email, password);
      if (!res.success || !res.session) {
        setError(res.error || 'Authentication failed. Please verify your officer credentials.');
        setLoading(false);
        return;
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess(res.session);
      }
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during officer sign-in.');
      setLoading(false);
    }
  };

  const handleQuickFill = (officerEmail: string) => {
    setEmail(officerEmail);
    setPassword(SHARED_DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className={`bg-white rounded-3xl border border-sky-200 shadow-2xl p-6 sm:p-8 space-y-6 ${className}`}>
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">APMC Officer Portal Sign In</h2>
          <p className="text-xs text-gray-500">
            Sign in with your authorized inspection officer credentials
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
            Officer Email or Officer ID *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. officer001@apmc-demo.local or OFF-001"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
            Inspection Access Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              placeholder="Demo@12345"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Shared Demo Password: <code className="font-mono font-bold text-sky-800">{SHARED_DEMO_PASSWORD}</code>
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>{loading ? 'Authenticating Officer...' : 'Sign In as Inspection Officer'}</span>
          </button>
        </div>
      </form>

      {/* Quick One-Click Demo Officer Fillers */}
      <div className="pt-4 border-t border-gray-100">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Quick Demo Credentials (One-Click)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SEED_OFFICERS.slice(0, 5).map((o) => (
            <button
              key={o.officer_id}
              type="button"
              onClick={() => handleQuickFill(o.email)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 hover:bg-sky-50 text-gray-700 hover:text-sky-800 border border-gray-200 hover:border-sky-300 transition-colors"
            >
              {o.officer_id} ({o.batch_id})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
