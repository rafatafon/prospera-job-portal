'use client';

import { useState, useTransition, Fragment } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Building2, Check } from 'lucide-react';
import { verifyRpn, registerCompany } from '@/app/[locale]/company/signup/actions';

export function CompanySignupForm() {
  const t = useTranslations('companyAuth');
  const locale = useLocale();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rpn, setRpn] = useState('');
  const [companyData, setCompanyData] = useState<{
    name: string;
    extension: string;
    entityId: string;
    rpn: string;
  } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const errorMessages: Record<string, string> = {
    invalid_format: t('errorInvalidFormat'),
    duplicate_rpn: t('errorDuplicateRpn'),
    not_found: t('errorNotFound'),
    inactive: t('errorInactive'),
    natural_person: t('errorNaturalPerson'),
    rate_limited: t('errorRateLimited'),
    api_error: t('errorApiError'),
    email_exists: t('errorEmailExists'),
    validation: t('errorGeneric'),
    auth_error: t('errorGeneric'),
    db_error: t('errorGeneric'),
  };

  function getErrorMessage(code: string): string {
    return errorMessages[code] ?? t('errorGeneric');
  }

  // ─── Step 1: Verify RPN ──────────────────────────────────────────────────

  function handleVerifyRpn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = rpn.trim();
    if (!trimmed) {
      setError(t('errorRpnEmpty'));
      return;
    }

    startTransition(async () => {
      const result = await verifyRpn(trimmed);
      if ('error' in result) {
        setError(getErrorMessage(result.code));
        return;
      }
      setCompanyData({
        name: result.companyName,
        extension: result.companyExtension,
        entityId: result.entityId,
        rpn: result.rpn,
      });
      setStep(2);
    });
  }

  // ─── Step 2: Back ────────────────────────────────────────────────────────

  function handleBack() {
    setCompanyData(null);
    setConfirmed(false);
    setError(null);
    setStep(1);
  }

  // ─── Step 3: Register ────────────────────────────────────────────────────

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password.length < 8) {
      setError(t('errorPasswordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }

    // Inject company data into the form payload
    formData.set('rpn', companyData!.rpn);
    formData.set('entityId', companyData!.entityId);
    formData.set('companyName', `${companyData!.name} ${companyData!.extension}`.trim());

    startTransition(async () => {
      const result = await registerCompany(locale, formData);
      if (result?.error) {
        setError(getErrorMessage(result.code));
      }
    });
  }

  // ─── Step Indicator ──────────────────────────────────────────────────────

  const stepIndicator = (
    <div className="mb-6">
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <Fragment key={s}>
            {s > 1 && (
              <div
                className={`h-px w-8 ${s <= step ? 'bg-slate-300' : 'bg-slate-200'}`}
              />
            )}
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                s < step
                  ? 'bg-emerald-500 text-white'
                  : s === step
                    ? 'text-white'
                    : 'border border-slate-300 text-slate-400'
              }`}
              style={s === step ? { backgroundColor: '#E8501C' } : undefined}
            >
              {s < step ? <Check className="h-3.5 w-3.5" /> : s}
            </div>
          </Fragment>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">
        {t('stepLabel', { current: step, total: 3 })}
      </p>
    </div>
  );

  // ─── Error Banner ─────────────────────────────────────────────────────────

  const errorBanner = error ? (
    <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{error}</span>
    </div>
  ) : null;

  // ─── Bottom Links ─────────────────────────────────────────────────────────

  const bottomLinks = (
    <>
      <p className="mt-6 text-center text-sm text-slate-500">
        {t('hasAccount')}{' '}
        <Link
          href="/login"
          className="font-medium transition-colors hover:opacity-80"
          style={{ color: '#E8501C' }}
        >
          {t('loginLink')}
        </Link>
      </p>
      <p className="mt-4 text-center text-xs">
        <Link
          href="/"
          className="font-medium text-slate-400 transition-colors hover:text-slate-600"
        >
          &larr; Prospera
        </Link>
      </p>
    </>
  );

  // ─── Shared input class ───────────────────────────────────────────────────

  const inputClass =
    'h-11 rounded-lg focus-visible:ring-1 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400';
  const inputStyle = { '--tw-ring-color': '#E8501C' } as React.CSSProperties;
  const labelClass = 'text-sm font-medium text-slate-700';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {stepIndicator}

      {/* ── Step 1: Verify RPN ── */}
      {step === 1 && (
        <form onSubmit={handleVerifyRpn} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rpn" className={labelClass}>
              {t('rpnLabel')}
            </Label>
            <Input
              id="rpn"
              name="rpn"
              type="text"
              required
              autoComplete="off"
              placeholder={t('rpnPlaceholder')}
              value={rpn}
              onChange={(e) => setRpn(e.target.value)}
              className={inputClass}
              style={inputStyle}
              disabled={isPending}
            />
          </div>

          {errorBanner}

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#E8501C' }}
          >
            {isPending ? t('verifying') : t('verifyButton')}
          </Button>
        </form>
      )}

      {/* ── Step 2: Confirm Company ── */}
      {step === 2 && companyData && (
        <div className="space-y-5">
          {/* Company card */}
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: 'rgba(52,211,153,0.4)',
              backgroundColor: 'rgba(52,211,153,0.07)',
            }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-400">
              {t('companyFound')}
            </p>
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(52,211,153,0.15)' }}
              >
                <Building2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold leading-snug text-slate-900">
                  {companyData.name}
                </p>
                {companyData.extension && (
                  <p className="mt-0.5 text-sm text-slate-500">
                    {companyData.extension}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Authorization checkbox */}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-orange-500"
            />
            <span className="text-sm leading-relaxed text-slate-600">
              {t('confirmCheckbox')}
            </span>
          </label>

          {errorBanner}

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleBack}
              disabled={isPending}
              variant="outline"
              className="h-11 flex-1 rounded-lg border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60"
            >
              {t('backButton')}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setError(null);
                setStep(3);
              }}
              disabled={!confirmed || isPending}
              className="h-11 flex-1 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#E8501C' }}
            >
              {t('continueButton')}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Create Account ── */}
      {step === 3 && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className={labelClass}>
              {t('fullName')}
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Juan Perez"
              className={inputClass}
              style={inputStyle}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className={labelClass}>
              {t('email')}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className={inputClass}
              style={inputStyle}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className={labelClass}>
              {t('password')}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass}
              style={inputStyle}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password" className={labelClass}>
              {t('confirmPassword')}
            </Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass}
              style={inputStyle}
              disabled={isPending}
            />
          </div>

          {errorBanner}

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#E8501C' }}
          >
            {isPending ? t('creatingAccount') : t('createAccount')}
          </Button>
        </form>
      )}

      {bottomLinks}
    </div>
  );
}
