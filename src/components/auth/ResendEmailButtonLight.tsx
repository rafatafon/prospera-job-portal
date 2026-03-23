'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

interface ResendEmailButtonLightProps {
  email: string;
}

export function ResendEmailButtonLight({ email }: ResendEmailButtonLightProps) {
  const t = useTranslations('companyAuth');
  const [state, setState] = useState<'idle' | 'sending' | 'cooldown'>('idle');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  async function handleResend() {
    if (state !== 'idle') return;
    setState('sending');

    try {
      const supabase = createClient();
      await supabase.auth.resend({ type: 'signup', email });
    } catch {
      // Silently fail — Supabase Auth has its own rate limiting
    }

    // 60-second cooldown to prevent resend spam
    setState('cooldown');
    let remaining = 60;
    setCooldownSeconds(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setState('idle');
      }
    }, 1000);
  }

  return (
    <button
      onClick={handleResend}
      disabled={state !== 'idle'}
      className={[
        'w-full rounded-md border px-4 py-2.5 text-sm font-medium transition-all duration-200',
        state === 'cooldown'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default'
          : state === 'sending'
            ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer',
      ].join(' ')}
    >
      {state === 'sending'
        ? t('resending')
        : state === 'cooldown'
          ? `${t('resent')} (${cooldownSeconds}s)`
          : t('resendEmail')}
    </button>
  );
}
