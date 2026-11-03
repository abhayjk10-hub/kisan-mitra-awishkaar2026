'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Lock, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import InputField from '@/components/shared/InputField';
import PrimaryButton from '@/components/shared/PrimaryButton';
import AlertMessage from '@/components/shared/AlertMessage';
import ForgotPasswordFlow from '@/components/auth/ForgotPasswordFlow';

type ActiveView = 'login' | 'forgot-password';

export default function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { language } = useLanguage();
  const router = useRouter();
  const supabase = createClient();

  const [activeView, setActiveView] = useState<ActiveView>('login');
  const [identifier, setIdentifier] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('km_last_registered_identifier') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const validateIdentifier = (val: string): boolean => {
    const trimmed = val.trim();
    if (trimmed.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    }
    const digitsOnly = trimmed.replace(/\D/g, '');
    return digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('91'));
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * SUBMIT LOGIN (Email or Mobile + Password)
   * ───────────────────────────────────────────────────────────────────────── */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!identifier.trim()) {
      newErrors.identifier = t('validation.required.mobile', language);
    } else if (!validateIdentifier(identifier)) {
      newErrors.identifier = t('validation.invalid.mobile', language);
    }

    if (!password) {
      newErrors.password = t('login.password', language);
    } else if (password.length < 6) {
      newErrors.password = t('forgot.passwordTooShort', language);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const isEmail = identifier.includes('@');
      const cleanEmail = identifier.trim().toLowerCase();
      const digits = identifier.trim().replace(/\D/g, '');
      const tenDigits = digits.slice(-10);
      const formattedPhone = '+91' + tenDigits;

      let authResponse: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>> | null = null;

      if (isEmail) {
        authResponse = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
      } else {
        // Try all representations against Supabase Auth:
        // 1. Raw 10-digit number (e.g. 7700037441)
        // 2. E.164 with +91 (e.g. +917700037441)
        // 3. Country code without plus (e.g. 917700037441)
        // 4. Raw string as typed
        const candidates = Array.from(
          new Set([
            tenDigits,
            formattedPhone,
            '91' + tenDigits,
            identifier.trim(),
          ])
        ).filter(Boolean);

        for (const phoneAttempt of candidates) {
          try {
            const resp = await supabase.auth.signInWithPassword({
              phone: phoneAttempt,
              password: password,
            });
            if (!resp.error && resp.data?.user) {
              authResponse = resp;
              break;
            } else {
              authResponse = resp;
            }
          } catch {
            // try next candidate
          }
        }
      }

      const { data, error } = authResponse || {};

      if (error || !data?.user) {
        throw new Error(error?.message || t('forgot.accountNotFound', language));
      }

      setAlert({ type: 'success', message: t('login.success', language) });
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 700);
      return;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('error.generic', language);
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSuccess = (updatedIdentifier: string) => {
    setIdentifier(updatedIdentifier);
    setPassword('');
    setActiveView('login');
    setAlert({
      type: 'success',
      message: t('forgot.passwordSuccess', language),
    });
  };

  if (activeView === 'forgot-password') {
    return (
      <ForgotPasswordFlow
        initialIdentifier={identifier}
        onSuccess={handleForgotPasswordSuccess}
        onCancel={() => {
          setActiveView('login');
          setAlert(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {alert && (
        <AlertMessage type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {/* ── EMAIL OR MOBILE + PASSWORD LOGIN FORM ── */}
      <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
        <InputField
          id="login-identifier"
          label={t('login.identifierLabel', language)}
          type="text"
          placeholder={t('login.identifierPlaceholder', language)}
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setErrors((prev) => ({ ...prev, identifier: undefined }));
          }}
          error={errors.identifier}
          icon={<Smartphone className="w-4 h-4" />}
          required
          autoComplete="username"
        />

        <div className="space-y-1">
          <InputField
            id="login-password"
            label={t('login.password', language)}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('login.passwordPlaceholder', language)}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            icon={<Lock className="w-4 h-4" />}
            required
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-gray-400 hover:text-primary-700 p-1 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveView('forgot-password');
                setAlert(null);
              }}
              className="text-xs font-semibold text-primary-700 hover:text-primary-900 transition-colors focus:outline-none focus:underline"
            >
              {t('login.forgotPassword', language)}
            </button>
          </div>
        </div>

        <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
          {t('login.signInBtn', language)}
        </PrimaryButton>
      </form>

      {/* Switch to Register */}
      <div className="pt-3 border-t border-primary-100 text-center">
        <p className="text-sm text-gray-600">
          {t('login.newFarmer', language)}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-primary-600 hover:text-primary-800 underline underline-offset-2 transition-colors"
          >
            {t('login.registerNow', language)}
          </button>
        </p>
      </div>
    </div>
  );
}