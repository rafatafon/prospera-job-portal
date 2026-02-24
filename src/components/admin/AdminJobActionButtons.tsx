'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Archive, Trash2, Loader2 } from 'lucide-react';
import {
  adminPublishJob,
  adminArchiveJob,
  adminDeleteJob,
} from '@/app/[locale]/(admin)/admin/jobs/actions';
import type { Database } from '@/types/database.types';

type JobStatus = Database['public']['Enums']['job_status'];

interface AdminJobActionButtonsProps {
  jobId: string;
  status: JobStatus;
  labelPublish: string;
  labelArchive: string;
  labelDelete: string;
  confirmPublish: string;
  confirmArchive: string;
  confirmDelete: string;
}

export function AdminJobActionButtons({
  jobId,
  status,
  labelPublish,
  labelArchive,
  labelDelete,
  confirmPublish,
  confirmArchive,
  confirmDelete,
}: AdminJobActionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    if (!window.confirm(confirmPublish)) return;
    startTransition(async () => {
      await adminPublishJob(jobId);
    });
  }

  function handleArchive() {
    if (!window.confirm(confirmArchive)) return;
    startTransition(async () => {
      await adminArchiveJob(jobId);
    });
  }

  function handleDelete() {
    if (!window.confirm(confirmDelete)) return;
    startTransition(async () => {
      await adminDeleteJob(jobId);
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
        >
          <Globe className="h-3.5 w-3.5" />
          {labelPublish}
        </Button>
      )}

      {status === 'published' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleArchive}
          className="h-7 gap-1 px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800"
        >
          <Archive className="h-3.5 w-3.5" />
          {labelArchive}
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        className="h-7 gap-1 px-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {labelDelete}
      </Button>
    </div>
  );
}
