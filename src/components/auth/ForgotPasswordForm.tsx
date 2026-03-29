'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/app/[locale]/forgot-password/actions';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  from?: string | null;
  dark?: boolean;
}

export function ForgotPasswordForm({ from, dark = false }: ForgotPasswordFormProps) {
  const t = useTranslations('forgotPassword');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      if (from) formData.set('from', from);
      const result = await requestPasswordReset(locale, formData);
      if (result?.error) {
        if (result.error === 'too_many_requests') {
          setError(tCommon('tooManyRequests'));
        } else if (result.error === 'email_required' || result.error === 'invalid_email') {
          setError(t('invalidEmail'));
        } else {
          setError(result.error);
        }
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="w-full">
        <div className={`flex flex-col items-center gap-4 rounded-xl border px-6 py-8 text-center ${dark ? 'border-emerald-400/30 bg-emerald-500/20' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${dark ? 'bg-emerald-500/30' : 'bg-emerald-100'}`}>
            <CheckCircle className={`h-6 w-6 ${dark ? 'text-emerald-300' : 'text-emerald-600'}`} />
          </div>
          <div>
            <p className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{t('successTitle')}</p>
            <p className={`mt-1.5 text-sm leading-relaxed ${dark ? 'text-white/60' : 'text-slate-500'}`}>{t('successMessage')}</p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs">
          <Link
            href={from === 'candidate' ? '/candidate/login' : '/login'}
            className={`font-medium transition-colors ${dark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-900'}`}
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
          <Label htmlFor="email" className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-slate-700'}`}>
            {t('emailLabel')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className={`h-11 rounded-lg focus-visible:ring-1 ${dark ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40' : 'border-slate-200 bg-white'}`}
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        {error && (
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${dark ? 'border-red-400/30 bg-red-500/20 text-red-300' : 'border-red-100 bg-red-50 text-red-600'}`}>
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
          href={from === 'candidate' ? '/candidate/login' : '/login'}
          className={`font-medium transition-colors ${dark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-900'}`}
        >
          &larr; {t('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
