'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Smartphone,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import InputField from '@/components/shared/InputField';
import PrimaryButton from '@/components/shared/PrimaryButton';
import AlertMessage from '@/components/shared/AlertMessage';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const supabase = createClient();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Mobile number or Email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    identifier?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  /* ─────────────────────────────────────────────────────────────────────────
   * STRONG PASSWORD VALIDATION RULES:
   * 1. Minimum 8 characters
   * 2. At least 1 uppercase letter (A-Z)
   * 3. At least 1 lowercase letter (a-z)
   * 4. At least 1 number (0-9)
   * 5. At least 1 special character (!@#$%^&*...)
   * ───────────────────────────────────────────────────────────────────────── */
  const passwordRules = useMemo(() => {
    return [
      {
        id: 'min-length',
        label: 'Minimum 8 characters',
        met: password.length >= 8,
      },
      {
        id: 'uppercase',
        label: 'At least 1 uppercase letter (A-Z)',
        met: /[A-Z]/.test(password),
      },
      {
        id: 'lowercase',
        label: 'At least 1 lowercase letter (a-z)',
        met: /[a-z]/.test(password),
      },
      {
        id: 'number',
        label: 'At least 1 number (0-9)',
        met: /\d/.test(password),
      },
      {
        id: 'special',
        label: 'At least 1 special character (!@#$%^&*)',
        met: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(password),
      },
    ];
  }, [password]);

  const metCount = passwordRules.filter((r) => r.met).length;

  // Password Strength Meter styling
  const strengthMeter = useMemo(() => {
    if (!password) return { width: '0%', color: 'bg-gray-200', text: '', textColor: 'text-gray-400' };
    if (metCount <= 2) return { width: '33%', color: 'bg-red-500', text: 'Weak', textColor: 'text-red-600' };
    if (metCount <= 4) return { width: '66%', color: 'bg-amber-500', text: 'Moderate', textColor: 'text-amber-600' };
    return { width: '100%', color: 'bg-emerald-500', text: 'Strong', textColor: 'text-emerald-600' };
  }, [password, metCount]);

  // Confirm password matching status
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Validation helper: either a valid email format OR exactly 10 digits
  const validateIdentifier = (val: string): boolean => {
    const trimmed = val.trim();
    if (trimmed.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    }
    const digitsOnly = trimmed.replace(/\D/g, '');
    return digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('91'));
  };

  const isIdentifierValid = validateIdentifier(identifier);
  const isPasswordValid = password.length >= 6;

  // Submit button enabled when basic requirements are met
  const isSubmitDisabled =
    !fullName.trim() ||
    !isIdentifierValid ||
    !isPasswordValid ||
    !passwordsMatch ||
    loading;

  /* ─────────────────────────────────────────────────────────────────────────
   * SUBMIT REGISTRATION
   * ───────────────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = t('validation.required.name', language);
    }

    if (!identifier.trim()) {
      newErrors.identifier = t('validation.required.mobile', language);
    } else if (!validateIdentifier(identifier)) {
      newErrors.identifier = t('validation.invalid.mobile', language);
    }

    if (!isPasswordValid) {
      newErrors.password = t('forgot.passwordTooShort', language);
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('forgot.confirmPassword', language);
    } else if (!passwordsMatch) {
      newErrors.confirmPassword = t('forgot.passwordMismatch', language);
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

      let authResponse;

      if (isEmail) {
        authResponse = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
      } else {
        // Try signup with formatted E.164 phone (+91...)
        authResponse = await supabase.auth.signUp({
          phone: formattedPhone,
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
      }

      const { data, error } = authResponse;

      if (error) {
        setAlert({ type: 'error', message: error.message });
        setLoading(false);
        return;
      }

      // Upsert profile in Supabase farmers table
      if (data?.user) {
        try {
          await supabase.from('farmers').upsert(
            {
              user_id: data.user.id,
              full_name: fullName.trim(),
              mobile_number: isEmail ? (data.user.phone || '') : formattedPhone,
              preferred_language: language,
            },
            { onConflict: 'user_id' }
          );
        } catch (dbErr: unknown) {
          console.warn('Could not insert farmers table record:', dbErr);
        }
      }

      setAlert({
        type: 'success',
        message: t('register.success', language),
      });

      // Auto-redirect to home if session established, otherwise to login
      setTimeout(() => {
        if (data?.session) {
          router.push('/');
          router.refresh();
        } else if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          router.push('/login');
        }
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('error.generic', language);
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };


  const handleGoToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      router.push('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 animate-in fade-in duration-200">
      {alert && (
        <AlertMessage type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {/* 1. Full Name */}
      <InputField
        id="register-fullname"
        label={t('register.fullName', language)}
        type="text"
        placeholder={t('register.fullNamePlaceholder', language)}
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value);
          setErrors((prev) => ({ ...prev, fullName: undefined }));
        }}
        error={errors.fullName}
        icon={<User className="w-4 h-4" />}
        required
        autoComplete="name"
      />

      {/* 2. Mobile Number / Email */}
      <InputField
        id="register-identifier"
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

      {/* 3. Create Password */}
      <div className="space-y-2">
        <InputField
          id="register-password"
          label={t('register.password', language)}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('register.passwordPlaceholder', language)}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          icon={<Lock className="w-4 h-4" />}
          required
          autoComplete="new-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-gray-400 hover:text-primary-700 p-1 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Visual Strength Meter Bar */}
        {password.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Password Strength:</span>
              <span className={`font-semibold ${strengthMeter.textColor}`}>
                {strengthMeter.text}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${strengthMeter.color} transition-all duration-300 rounded-full`}
                style={{ width: strengthMeter.width }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Confirm Password */}
      <div className="space-y-1">
        <InputField
          id="register-confirm-password"
          label={t('register.confirmPassword', language)}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder={t('register.confirmPasswordPlaceholder', language)}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          error={errors.confirmPassword}
          icon={<ShieldCheck className="w-4 h-4" />}
          required
          autoComplete="new-password"
          className={
            passwordsMatch
              ? 'border-emerald-500 focus:ring-emerald-500'
              : passwordMismatch
              ? 'border-red-400 focus:ring-red-400'
              : ''
          }
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-gray-400 hover:text-primary-700 p-1 focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Live matching indicator */}
        {confirmPassword.length > 0 && (
          <div className="pt-1 flex items-center gap-1 text-xs">
            {passwordsMatch ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('register.password', language)} ✓
              </span>
            ) : (
              <span className="text-red-500 font-medium flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {t('forgot.passwordMismatch', language)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <PrimaryButton
          type="submit"
          fullWidth
          loading={loading}
          disabled={isSubmitDisabled}
          size="lg"
          className={isSubmitDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        >
          {t('register.submit', language)}
        </PrimaryButton>
      </div>

      {/* Switch to Login */}
      <div className="pt-3 border-t border-primary-100 text-center">
        <p className="text-sm text-gray-600">
          {t('register.alreadyRegistered', language)}{' '}
          <button
            type="button"
            onClick={handleGoToLogin}
            className="font-semibold text-primary-600 hover:text-primary-800 underline underline-offset-2 transition-colors"
          >
            {t('register.signIn', language)}
          </button>
        </p>
      </div>
    </form>
  );
}
