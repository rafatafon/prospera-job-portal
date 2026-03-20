'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/app/[locale]/login/actions';
import { adminLogin } from '@/app/[locale]/admin/login/actions';
import { AlertCircle } from 'lucide-react';

interface LoginFormProps {
  variant?: 'company' | 'admin';
  dark?: boolean;
}

export function LoginForm({ variant = 'company', dark = false }: LoginFormProps) {
  const t = useTranslations('login');
  const tCommon = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const action = variant === 'admin' ? adminLogin : login;
      const result = await action(locale, formData);
      if (result?.error) {
        if (result.error === 'company_only') {
          setError(t('companyOnly'));
        } else if (result.error === 'access_denied') {
          setError(tAdmin('accessDenied'));
        } else {
          setError(t('loginError'));
        }
      }
    });
  }

  const labelColor = dark ? 'text-white/80' : 'text-slate-700';
  const inputClasses = dark
    ? 'h-11 rounded-lg border-white/10 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-1'
    : 'h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-1';
  const backLinkColor = dark
    ? 'font-medium text-white/50 transition-colors hover:text-white'
    : 'font-medium text-slate-500 transition-colors hover:text-slate-900';

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className={`text-sm font-medium ${labelColor}`}>
            {t('email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className={inputClasses}
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className={`text-sm font-medium ${labelColor}`}>
            {t('password')}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClasses}
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium hover:opacity-80"
              style={{ color: '#E8501C' }}
            >
              {t('forgotPassword')}
            </Link>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${dark ? 'border border-red-400/30 bg-red-500/20 text-red-300' : 'border border-red-100 bg-red-50 text-red-600'}`}>
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
          {isPending ? tCommon('loading') : t('loginButton')}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs">
        <Link href="/" className={backLinkColor}>
          &larr; {tCommon('back')}
        </Link>
      </p>
    </div>
  );
}
