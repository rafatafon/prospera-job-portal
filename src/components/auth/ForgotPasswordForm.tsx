'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/app/[locale]/forgot-password/actions';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const t = useTranslations('forgotPassword');
  const locale = useLocale();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await requestPasswordReset(locale, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{t('successTitle')}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t('successMessage')}</p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs">
          <Link
            href="/login"
            className="font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            &larr; {t('backToLogin')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            {t('emailLabel')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-1"
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#E8501C' }}
        >
          {isPending ? t('sending') : t('sendButton')}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs">
        <Link
          href="/login"
          className="font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; {t('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
