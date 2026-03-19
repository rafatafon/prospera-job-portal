'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { updateApplicationStatus } from '@/app/[locale]/(dashboard)/dashboard/applications/actions';
import type { Database } from '@/types/database.types';
import { Eye, Star, XCircle, Loader2 } from 'lucide-react';

type ApplicationStatus = Database['public']['Enums']['application_status'];

interface ApplicationStatusActionsProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

export function ApplicationStatusActions({
  applicationId,
  currentStatus,
}: ApplicationStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const t = useTranslations('dashboardApplications');

  function handleStatusChange(newStatus: ApplicationStatus) {
    startTransition(async () => {
      await updateApplicationStatus(locale, applicationId, newStatus);
    });
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-end">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentStatus !== 'reviewed' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleStatusChange('reviewed')}
          className="h-7 gap-1 px-2 text-xs font-medium text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          title={t('markReviewed')}
        >
          <Eye className="h-3.5 w-3.5" />
          {t('markReviewed')}
        </Button>
      )}

      {currentStatus !== 'interested' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleStatusChange('interested')}
          className="h-7 gap-1 px-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          title={t('markInterested')}
        >
          <Star className="h-3.5 w-3.5" />
          {t('markInterested')}
        </Button>
      )}

      {currentStatus !== 'denied' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleStatusChange('denied')}
          className="h-7 gap-1 px-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
          title={t('markDenied')}
        >
          <XCircle className="h-3.5 w-3.5" />
          {t('markDenied')}
        </Button>
      )}
    </div>
  );
}
