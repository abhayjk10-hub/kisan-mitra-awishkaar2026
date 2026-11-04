'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/lib/translations';
import { Language } from '@/types';
import { t } from '@/lib/translations';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Globe className="w-4 h-4 text-primary-300" aria-hidden="true" />
      <select
        id="language-selector"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-2 py-1 min-h-[34px] focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer shrink-0 [&>option]:text-gray-900 [&>option]:bg-white"
        aria-label={t('common.selectLanguage', language)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
