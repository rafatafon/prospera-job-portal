'use client';

import { useState, useTransition, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  supportedCountries,
  getCountryName,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_PHONE_CODE,
} from '@/lib/countries';
import { submitApplication } from '@/app/[locale]/(public)/jobs/[id]/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2, CheckCircle2, Paperclip, X } from 'lucide-react';

/* ── File upload zone ─────────────────────────────────────────────────────── */

interface FileFieldProps {
  id: string;
  name: string;
  label: string;
  hint: string;
  required?: boolean;
  disabled?: boolean;
}

function FileField({ id, name, label, hint, required, disabled }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string | null>(null);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">*</span>
        )}
      </Label>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept=".pdf"
        required={required}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setFilename(file ? file.name : null);
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={[
          'flex w-full items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3',
          'text-left transition-colors duration-150',
          filename
            ? 'border-orange-200 bg-orange-50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ].join(' ')}
      >
        <Paperclip
          className="h-4 w-4 shrink-0"
          style={{ color: filename ? '#E8501C' : '#94a3b8' }}
        />
        <span className="min-w-0 flex-1 truncate text-sm">
          {filename ? (
            <span className="font-medium" style={{ color: '#E8501C' }}>
              {filename}
            </span>
          ) : (
            <span className="text-slate-400">PDF</span>
          )}
        </span>
        {filename && (
          <X
            className="h-3.5 w-3.5 shrink-0 text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              if (inputRef.current) inputRef.current.value = '';
              setFilename(null);
            }}
          />
        )}
      </button>
      <p className="text-xs text-slate-400">{hint}</p>
    </div>
  );
}

/* ── Main form ────────────────────────────────────────────────────────────── */

interface ApplicationFormProps {
  jobId: string;
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const t = useTranslations('applicationForm');
  const locale = useLocale();

  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_PHONE_CODE);
  const [country, setCountry] = useState(DEFAULT_COUNTRY_CODE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set('phone_country_code', phoneCountryCode);
    formData.set('country', country);
    formData.set('job_id', jobId);

    startTransition(async () => {
      const result = await submitApplication(formData);
      if ('error' in result) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  /* Success state */
  if (success) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: '#E8501C' }}
          aria-hidden="true"
        />
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: '#FFF5F0' }}
          >
            <CheckCircle2 className="h-7 w-7" style={{ color: '#E8501C' }} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {t('successTitle')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {t('successMessage')}
          </p>
        </div>
      </div>
    );
  }

  /* Form state */
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: '#E8501C' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{t('title')}</h3>
        <p className="mt-0.5 text-xs text-slate-400">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5 px-6 py-5">
          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-sm font-medium text-slate-700">
              {t('fullName')}
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder={t('fullNamePlaceholder')}
              disabled={isPending}
              className="h-10 border-slate-200 bg-white focus-visible:ring-1"
              style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              {t('email')}
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              disabled={isPending}
              className="h-10 border-slate-200 bg-white focus-visible:ring-1"
              style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            />
          </div>

          {/* Phone — code picker + number */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              {t('phone')}
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            </Label>
            <div className="flex gap-2">
              <Select
                value={phoneCountryCode}
                onValueChange={setPhoneCountryCode}
                disabled={isPending}
              >
                <SelectTrigger className="h-10 w-[100px] shrink-0 border-slate-200 bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {supportedCountries.map((c) => (
                    <SelectItem key={c.code} value={c.phone_code}>
                      {c.phone_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                placeholder={t('phonePlaceholder')}
                disabled={isPending}
                className="h-10 flex-1 border-slate-200 bg-white focus-visible:ring-1"
                style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Label htmlFor="country_select" className="text-sm font-medium text-slate-700">
              {t('country')}
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            </Label>
            <Select
              value={country}
              onValueChange={setCountry}
              disabled={isPending}
            >
              <SelectTrigger
                id="country_select"
                className="h-10 w-full border-slate-200 bg-white"
              >
                <SelectValue placeholder={t('selectCountry')} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {supportedCountries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {getCountryName(c.code, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* LinkedIn */}
          <div className="space-y-1.5">
            <Label htmlFor="linkedin" className="text-sm font-medium text-slate-700">
              {t('linkedin')}
              <span className="ml-1.5 text-xs font-normal text-slate-400">
                {t('linkedinHint')}
              </span>
            </Label>
            <Input
              id="linkedin"
              name="linkedin"
              type="url"
              placeholder={t('linkedinPlaceholder')}
              disabled={isPending}
              className="h-10 border-slate-200 bg-white focus-visible:ring-1"
              style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            />
          </div>

          {/* Resume */}
          <FileField
            id="resume"
            name="resume"
            label={t('resume')}
            hint={t('resumeHint')}
            required
            disabled={isPending}
          />

          {/* Cover letter */}
          <FileField
            id="cover_letter"
            name="cover_letter"
            label={t('coverLetter')}
            hint={t('coverLetterHint')}
            disabled={isPending}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mb-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <div className="px-6 pb-6">
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#E8501C' }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
