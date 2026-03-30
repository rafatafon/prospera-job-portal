'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { changePassword, changeEmail } from '@/app/[locale]/(dashboard)/dashboard/account/actions';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AccountSettingsFormProps {
  userEmail: string | null;
  emailChanged?: boolean;
}

export function AccountSettingsForm({ userEmail, emailChanged = false }: AccountSettingsFormProps) {
  const t = useTranslations('accountSettings');

  // Password section state
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPendingPassword, startPasswordTransition] = useTransition();

  // Email section state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(emailChanged);
  const [isPendingEmail, startEmailTransition] = useTransition();

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    startPasswordTransition(async () => {
      const result = await changePassword(formData);
      if (result?.error) {
        if (result.error === 'mismatch') {
          setPasswordError(t('errorMismatch'));
        } else if (result.error === 'min_length') {
          setPasswordError(t('errorMinLength'));
        } else {
          setPasswordError(result.error);
        }
      } else {
        setPasswordSuccess(true);
        form.reset();
      }
    });
  }

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    const formData = new FormData(event.currentTarget);
    const newEmail = (formData.get('newEmail') as string)?.trim();

    if (!newEmail || !newEmail.includes('@')) {
      setEmailError(t('errorInvalidEmail'));
      return;
    }

    if (newEmail === userEmail) {
      setEmailError(t('errorSameEmail'));
      return;
    }

    startEmailTransition(async () => {
      const result = await changeEmail(formData);
      if (result?.error) {
        if (result.error === 'same_email') {
          setEmailError(t('errorSameEmail'));
        } else {
          setEmailError(result.error);
        }
      } else {
        setEmailSuccess(true);
      }
    });
  }

  const inputClasses = 'h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-1';
  const ringStyle = { '--tw-ring-color': '#ff2c02' } as React.CSSProperties;

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">{t('changePassword')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('changePasswordDescription')}</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
              {t('newPassword')}
            </Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClasses}
              style={ringStyle}
              disabled={isPendingPassword}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              {t('confirmPassword')}
            </Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClasses}
              style={ringStyle}
              disabled={isPendingPassword}
            />
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{t('passwordUpdated')}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isPendingPassword}
              className="h-10 rounded-lg px-5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#ff2c02' }}
            >
              {isPendingPassword ? t('updating') : t('updatePassword')}
            </Button>
          </div>
        </form>
      </div>

      {/* Change Email Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">{t('changeEmail')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('changeEmailDescription')}</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentEmail" className="text-sm font-medium text-slate-700">
              {t('currentEmail')}
            </Label>
            <Input
              id="currentEmail"
              type="email"
              value={userEmail ?? ''}
              readOnly
              disabled
              className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newEmail" className="text-sm font-medium text-slate-700">
              {t('newEmail')}
            </Label>
            <Input
              id="newEmail"
              name="newEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="new@email.com"
              className={inputClasses}
              style={ringStyle}
              disabled={isPendingEmail}
            />
          </div>

          {emailError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{emailError}</span>
            </div>
          )}

          {emailSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{emailChanged ? t('emailChanged') : t('emailUpdateSent')}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isPendingEmail}
              className="h-10 rounded-lg px-5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#ff2c02' }}
            >
              {isPendingEmail ? t('updating') : t('updateEmail')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
