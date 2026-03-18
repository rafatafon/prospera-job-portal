import type { Database } from '@/types/database.types';

type ApplicationStatus = Database['public']['Enums']['application_status'];

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  labelPending?: string;
  labelReviewed?: string;
  labelInterested?: string;
  labelDenied?: string;
}

export function ApplicationStatusBadge({
  status,
  labelPending = 'Pending',
  labelReviewed = 'Reviewed',
  labelInterested = 'Interested',
  labelDenied = 'Denied',
}: ApplicationStatusBadgeProps) {
  const config: Record<
    ApplicationStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    pending: {
      label: labelPending,
      bg: '#f8fafc',
      text: '#64748b',
      dot: '#94a3b8',
    },
    reviewed: {
      label: labelReviewed,
      bg: '#eff6ff',
      text: '#1d4ed8',
      dot: '#3b82f6',
    },
    interested: {
      label: labelInterested,
      bg: '#f0fdf4',
      text: '#15803d',
      dot: '#16a34a',
    },
    denied: {
      label: labelDenied,
      bg: '#fef2f2',
      text: '#b91c1c',
      dot: '#dc2626',
    },
  };

  const { label, bg, text, dot } = config[status] ?? config.pending;

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
