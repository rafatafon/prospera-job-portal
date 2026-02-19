'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, signup } from '@/app/[locale]/login/actions';
import { AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export function LoginForm() {
  const t = useTranslations('login');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const action = mode === 'login' ? login : signup;
      const result = await action(locale, formData);
      if (result?.error) {
        setError(t('loginError'));
      }
    });
  }

  return (
    <div className="w-full">
      {/* Mode toggle */}
      <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            mode === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('loginButton')}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setError(null);
          }}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            mode === 'signup'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('signupButton')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            {t('email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="h-10 border-slate-200 bg-white focus-visible:ring-1"
            style={{ '--tw-ring-color': '#0057FF' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            {t('password')}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            className="h-10 border-slate-200 bg-white focus-visible:ring-1"
            style={{ '--tw-ring-color': '#0057FF' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#0057FF' }}
        >
          {isPending
            ? tCommon('loading')
            : mode === 'login'
              ? t('loginButton')
              : t('signupButton')}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        <Link
          href="/"
          className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
        >
          &larr; {tCommon('back')}
        </Link>
      </p>
    </div>
  );
}
