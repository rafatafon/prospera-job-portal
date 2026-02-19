import type { Database } from '@/types/database.types';

type JobStatus = Database['public']['Enums']['job_status'];

interface JobStatusBadgeProps {
  status: JobStatus;
  labelDraft?: string;
  labelPublished?: string;
  labelArchived?: string;
}

/**
 * Colored pill badge for job status.
 * Pass translated labels in as props so this can be used in both
 * Server and Client contexts without importing next-intl directly.
 */
export function JobStatusBadge({
  status,
  labelDraft = 'Draft',
  labelPublished = 'Published',
  labelArchived = 'Archived',
}: JobStatusBadgeProps) {
  const config: Record<
    JobStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    draft: {
      label: labelDraft,
      bg: '#fffbeb',
      text: '#b45309',
      dot: '#d97706',
    },
    published: {
      label: labelPublished,
      bg: '#f0fdf4',
      text: '#15803d',
      dot: '#16a34a',
    },
    archived: {
      label: labelArchived,
      bg: '#f8fafc',
      text: '#64748b',
      dot: '#94a3b8',
    },
  };

  const { label, bg, text, dot } = config[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dot }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
