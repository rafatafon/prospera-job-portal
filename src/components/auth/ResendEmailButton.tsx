'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

interface ResendEmailButtonProps {
  email: string;
}

export function ResendEmailButton({ email }: ResendEmailButtonProps) {
  const t = useTranslations('candidateAuth');
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
          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 cursor-default'
          : state === 'sending'
            ? 'border-white/10 bg-white/5 text-white/50 cursor-not-allowed'
            : 'border-white/20 bg-transparent text-white hover:bg-white/10 cursor-pointer',
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
