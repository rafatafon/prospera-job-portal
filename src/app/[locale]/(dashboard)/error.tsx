'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-900">
        {t('somethingWentWrong')}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {t('errorMessage')}
      </p>
      <div className="mt-6 flex gap-3">
        <Button
          onClick={reset}
          className="text-white"
          style={{ backgroundColor: '#ff2c02' }}
        >
          {t('tryAgain')}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">{t('goToDashboard')}</Link>
        </Button>
      </div>
    </div>
  );
}
