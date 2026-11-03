import Link from 'next/link';
import { AlertTriangle, KeyRound, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Configuration Required | Kisan Mitra',
  description: 'Supabase environment variables are missing or unconfigured.',
};

export default function ConfigErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-primary-50/30 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border-2 border-amber-200 shadow-xl space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Configuration Required</h1>
          <p className="text-sm text-gray-600">
            Kisan Mitra requires a valid Supabase backend connection to authenticate farmers, manage mandis, and securely book procurement slots.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
          <div className="font-semibold flex items-center gap-1.5 text-amber-800">
            <KeyRound className="w-4 h-4" />
            Missing Environment Variables:
          </div>
          <ul className="list-disc list-inside space-y-1 font-mono text-xs text-amber-900">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>

        <div className="space-y-3 text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <p className="font-semibold text-gray-800">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>Copy <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">.env.example</code> to <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">.env.local</code>.</li>
            <li>Add your Supabase Project URL and Public Anon Key.</li>
            <li>Run the SQL migrations from <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">supabase/migrations/</code> in the Supabase SQL Editor.</li>
            <li>Restart your development server or redeploy.</li>
          </ol>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-primary-800 text-white font-semibold text-xs hover:bg-primary-900 transition-colors shadow-sm"
          >
            Supabase Dashboard
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

