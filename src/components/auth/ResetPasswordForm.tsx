'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle } from 'lucide-react';

interface ResetPasswordFormProps {
  from?: string | null;
  dark?: boolean;
}

export function ResetPasswordForm({ from, dark = false }: ResetPasswordFormProps) {
  const t = useTranslations('resetPassword');
  const tForgot = useTranslations('forgotPassword');
  const router = useRouter();

  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // On mount, check if user has an active session (established by /auth/confirm)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSessionReady(true);
      } else {
        setSessionError(t('errorExpired'));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword.length < 8) {
      setFormError(t('errorMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError(t('errorMismatch'));
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setFormError(t('errorGeneric'));
      } else {
        // Sign out so user logs in with new password
        await supabase.auth.signOut();
        const loginPath = from === 'candidate' ? '/candidate/login' : '/login';
        router.push(`${loginPath}?reset=true`);
      }
    });
  }

  // No session — link was invalid or expired
  if (sessionError) {
    return (
      <div className="w-full">
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${dark ? 'border-red-400/30 bg-red-500/20 text-red-300' : 'border-red-100 bg-red-50 text-red-600'}`}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{sessionError}</span>
        </div>
        <p className="mt-8 text-center text-xs">
          <Link
            href={from === 'candidate' ? '/candidate/login' : '/forgot-password'}
            className={`font-medium transition-colors ${dark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-900'}`}
          >
            &larr; {tForgot('backToLogin')}
          </Link>
        </p>
      </div>
    );
  }

  // Waiting for session check
  if (!sessionReady) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <div className={`h-6 w-6 animate-spin rounded-full border-2 ${dark ? 'border-white/20' : 'border-slate-200'}`} style={{ borderTopColor: '#ff2c02' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-slate-700'}`}>
            {t('newPassword')}
          </Label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            dark={dark}
            className={`h-11 rounded-lg focus-visible:ring-1 ${dark ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40' : 'border-slate-200 bg-white'}`}
            style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-slate-700'}`}>
            {t('confirmPassword')}
          </Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            dark={dark}
            className={`h-11 rounded-lg focus-visible:ring-1 ${dark ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40' : 'border-slate-200 bg-white'}`}
            style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        {formError && (
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${dark ? 'border-red-400/30 bg-red-500/20 text-red-300' : 'border-red-100 bg-red-50 text-red-600'}`}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#ff2c02' }}
        >
          {isPending ? t('updating') : t('resetButton')}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs">
        <Link
          href={from === 'candidate' ? '/candidate/login' : '/login'}
          className={`font-medium transition-colors ${dark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-900'}`}
        >
          &larr; {tForgot('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
