'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { publishJob, archiveJob, deleteJob } from '@/app/[locale]/(dashboard)/dashboard/jobs/actions';
import type { Database } from '@/types/database.types';
import { Globe, Archive, Trash2, Loader2 } from 'lucide-react';

type JobStatus = Database['public']['Enums']['job_status'];

interface JobActionButtonsProps {
  jobId: string;
  status: JobStatus;
}

export function JobActionButtons({ jobId, status }: JobActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const tJobs = useTranslations('dashboardJobs');

  function handlePublish() {
    if (!confirm(tJobs('confirmPublish'))) return;
    startTransition(async () => {
      await publishJob(locale, jobId);
    });
  }

  function handleArchive() {
    if (!confirm(tJobs('confirmArchive'))) return;
    startTransition(async () => {
      await archiveJob(locale, jobId);
    });
  }

  function handleDelete() {
    if (!confirm(tJobs('confirmDelete'))) return;
    startTransition(async () => {
      await deleteJob(locale, jobId);
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
    <div className="flex items-center justify-end gap-1.5">
      {status === 'draft' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePublish}
          className="h-7 gap-1 px-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          title={tCommon('publish')}
        >
          <Globe className="h-3.5 w-3.5" />
          {tCommon('publish')}
        </Button>
      )}

      {status === 'published' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleArchive}
          className="h-7 gap-1 px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          title={tCommon('archive')}
        >
          <Archive className="h-3.5 w-3.5" />
          {tCommon('archive')}
        </Button>
      )}

      {(status === 'draft' || status === 'archived') && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          className="h-7 gap-1 px-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
          title={tCommon('delete')}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {tCommon('delete')}
        </Button>
      )}
    </div>
  );
}
