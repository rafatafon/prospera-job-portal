'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle } from 'lucide-react';

export function ResetPasswordForm() {
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
        setFormError(error.message);
      } else {
        // Sign out so user logs in with new password
        await supabase.auth.signOut();
        router.push('/login?reset=true');
      }
    });
  }

  // No session — link was invalid or expired
  if (sessionError) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{sessionError}</span>
        </div>
        <p className="mt-8 text-center text-xs">
          <Link
            href="/forgot-password"
            className="font-medium text-slate-500 transition-colors hover:text-slate-900"
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
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200" style={{ borderTopColor: '#E8501C' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
            {t('newPassword')}
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-1"
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            {t('confirmPassword')}
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-1"
            style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
            disabled={isPending}
          />
        </div>

        {formError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#E8501C' }}
        >
          {isPending ? t('updating') : t('resetButton')}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs">
        <Link
          href="/login"
          className="font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          &larr; {tForgot('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
