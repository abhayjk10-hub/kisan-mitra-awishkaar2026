'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Building2, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MandiError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Mandi Portal Error Boundary]:', error.message || error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-primary-200 p-6 sm:p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center mx-auto shadow-inner">
          <Building2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-primary-950">
            Mandi Portal Error
          </h2>
          <p className="text-xs text-primary-700 font-semibold">
            मंडी पोर्टल लोड करने में समस्या
          </p>
          <p className="text-sm text-primary-700 leading-relaxed pt-1">
            An issue occurred while loading mandi operations or the queue dashboard. Please refresh to reconnect.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-900 text-white font-bold text-sm hover:bg-primary-950 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again / पुनः प्रयास</span>
          </button>
          <Link
            href="/mandi"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-100 text-primary-900 font-bold text-sm hover:bg-primary-200 transition-colors"
          >
            <span>Mandi Gateway</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
