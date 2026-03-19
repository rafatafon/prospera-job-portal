'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { candidateSignup } from '@/app/[locale]/candidate/signup/actions';
import { AlertCircle } from 'lucide-react';

export function CandidateSignupForm({ dark = false }: { dark?: boolean }) {
  const t = useTranslations('candidateAuth');
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    startTransition(async () => {
      const result = await candidateSignup(locale, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name" className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-slate-700'}`}>
            {t('fullName')}
          </Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            placeholder="Juan Perez"
            className={`h-11 rounded-lg focus-visible:ring-1 ${dark ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40' : 'border-slate-200 bg-white'}`}
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-slate-700'}`}>
            {t('email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            className={`h-11 rounded-lg focus-visible:ring-1 ${dark ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40' : 'border-slate-200 bg-white'}`}
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-slate-700'}`}>
            {t('password')}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className={`h-11 rounded-lg focus-visible:ring-1 ${dark ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40' : 'border-slate-200 bg-white'}`}
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm_password" className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-slate-700'}`}>
            {t('confirmPassword')}
          </Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className={`h-11 rounded-lg focus-visible:ring-1 ${dark ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40' : 'border-slate-200 bg-white'}`}
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
          {isPending ? t('signingUp') : t('signup')}
        </Button>
      </form>

      <p className={`mt-6 text-center text-sm ${dark ? 'text-white/60' : 'text-slate-500'}`}>
        {t('hasAccount')}{' '}
        <Link
          href="/candidate/login"
          className="font-medium transition-colors hover:opacity-80"
          style={{ color: '#E8501C' }}
        >
          {t('loginLink')}
        </Link>
      </p>

      <p className="mt-4 text-center text-xs">
        <Link
          href="/"
          className={`font-medium transition-colors ${dark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-900'}`}
        >
          &larr; Prospera
        </Link>
      </p>
    </div>
  );
}
