'use client';

import { useState } from 'react';
import {
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import InputField from '@/components/shared/InputField';
import PrimaryButton from '@/components/shared/PrimaryButton';
import AlertMessage from '@/components/shared/AlertMessage';

interface ForgotPasswordFlowProps {
  initialIdentifier?: string;
  onSuccess: (updatedIdentifier: string) => void;
  onCancel: () => void;
}

export default function ForgotPasswordFlow({
  initialIdentifier = '',
  onSuccess,
  onCancel,
}: ForgotPasswordFlowProps) {
  const { language } = useLanguage();
  const supabase = createClient();

  const [step, setStep] = useState<'identify' | 'reset' | 'completed'>('identify');
  const [identifier, setIdentifier] = useState(initialIdentifier.trim());
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [errors, setErrors] = useState<{
    identifier?: string;
    otpCode?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateIdentifier = (val: string): boolean => {
    const trimmed = val.trim();
    if (trimmed.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    }
    const digitsOnly = trimmed.replace(/\D/g, '');
    return digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('91'));
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * STEP 1: IDENTIFY USER & DISPATCH REAL AUTH CHALLENGE
   * ───────────────────────────────────────────────────────────────────────── */
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!identifier.trim()) {
      newErrors.identifier = t('validation.required.mobile', language);
    } else if (!validateIdentifier(identifier)) {
      newErrors.identifier = t('validation.invalid.mobile', language);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setAlert(null);

    const isEmail = identifier.includes('@');
    const cleanEmail = identifier.trim().toLowerCase();
    const digits = identifier.trim().replace(/\D/g, '');
    const tenDigits = digits.slice(-10);
    const formattedPhone = '+91' + tenDigits;

    try {
      if (isEmail) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) {
          setAlert({ type: 'error', message: error.message });
          return;
        }
        setStep('completed');
        setAlert({
          type: 'success',
          message: 'Password reset link sent to your email address.',
        });
        setTimeout(() => {
          onSuccess(cleanEmail);
        }, 2000);
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });
        if (error) {
          setAlert({ type: 'error', message: error.message });
          return;
        }
        setStep('reset');
        setAlert({
          type: 'info',
          message: `OTP sent to ${formattedPhone}. Enter the code below to reset password.`,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('error.generic', language);
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * STEP 2: VERIFY OTP & RESET PASSWORD THROUGH SUPABASE AUTH
   * ───────────────────────────────────────────────────────────────────────── */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      newErrors.otpCode = t('validation.invalid.otp', language);
    }

    if (!newPassword) {
      newErrors.newPassword = t('forgot.newPassword', language);
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('forgot.passwordTooShort', language);
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('forgot.confirmPassword', language);
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('forgot.passwordMismatch', language);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    const digits = identifier.trim().replace(/\D/g, '');
    const tenDigits = digits.slice(-10);
    const formattedPhone = '+91' + tenDigits;

    try {
      // 1. Verify OTP token using Supabase Phone Auth
      const { error: otpErr } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode.trim(),
        type: 'sms',
      });

      if (otpErr) {
        setAlert({ type: 'error', message: otpErr.message || t('validation.invalid.otp', language) });
        return;
      }

      // 2. Set new password on verified Supabase user
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setAlert({ type: 'error', message: updateErr.message });
        return;
      }

      setStep('completed');
      setAlert({
        type: 'success',
        message: t('forgot.passwordSuccess', language),
      });

      setTimeout(() => {
        onSuccess(identifier.trim());
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('error.generic', language);
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Back Link */}
      <div className="flex items-center justify-between border-b border-primary-100 pb-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 transition-colors py-1 px-2 rounded-lg hover:bg-primary-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          {t('forgot.backToLogin', language)}
        </button>

        {step !== 'completed' && (
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
            {step === 'identify' ? `${t('register.step', language)} 1 / 2` : `${t('register.step', language)} 2 / 2`}
          </span>
        )}
      </div>

      {/* Notification Alert Banner */}
      {alert && (
        <AlertMessage type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {/* ── STEP 1: IDENTIFY USER ── */}
      {step === 'identify' && (
        <form onSubmit={handleIdentify} noValidate className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-primary-950">
              {t('forgot.title', language)}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
              {t('forgot.subtitle', language)}
            </p>
          </div>

          <InputField
            id="forgot-identifier"
            label={t('forgot.identifierLabel', language)}
            type="text"
            placeholder={t('forgot.identifierPlaceholder', language)}
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

          <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
            {t('register.next', language)}
          </PrimaryButton>
        </form>
      )}

      {/* ── STEP 2: ENTER OTP & SET NEW PASSWORD ── */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} noValidate className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-primary-950">
              {t('forgot.newPassword', language)}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
              {identifier}
            </p>
          </div>

          <InputField
            id="reset-otp-code"
            label="6-Digit OTP Code"
            type="text"
            placeholder="e.g. 654321"
            value={otpCode}
            onChange={(e) => {
              setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setErrors((prev) => ({ ...prev, otpCode: undefined }));
            }}
            error={errors.otpCode}
            icon={<KeyRound className="w-4 h-4" />}
            required
            autoComplete="one-time-code"
          />

          <InputField
            id="reset-new-password"
            label={t('forgot.newPassword', language)}
            type={showNewPassword ? 'text' : 'password'}
            placeholder={t('forgot.newPasswordPlaceholder', language)}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }}
            error={errors.newPassword}
            icon={<Lock className="w-4 h-4" />}
            required
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="text-gray-400 hover:text-primary-700 p-1 focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <InputField
            id="reset-confirm-password"
            label={t('forgot.confirmPassword', language)}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('forgot.confirmPasswordPlaceholder', language)}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
            icon={<ShieldCheck className="w-4 h-4" />}
            required
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-gray-400 hover:text-primary-700 p-1 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
            {t('forgot.updatePasswordBtn', language)}
          </PrimaryButton>
        </form>
      )}

      {/* ── STEP 3: COMPLETED ── */}
      {step === 'completed' && (
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t('forgot.passwordSuccess', language)}</h3>
        </div>
      )}
    </div>
  );
}
