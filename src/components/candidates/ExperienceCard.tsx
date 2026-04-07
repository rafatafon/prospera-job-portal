'use client';

import { useTranslations } from 'next-intl';
import { Building2, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExperienceCardProps {
  experience: {
    id: string;
    job_title: string;
    company_name: string;
    location: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean | null;
    description: string | null;
    employment_type: string | null;
  };
  locale: string;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  full_time: 'expFullTime',
  part_time: 'expPartTime',
  contract: 'expContract',
};

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString(locale === 'es' ? 'es-HN' : 'en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export function ExperienceCard({
  experience,
  locale,
  showActions = false,
  onEdit,
  onDelete,
}: ExperienceCardProps) {
  const t = useTranslations('candidateProfile');

  const startFormatted = formatDate(experience.start_date, locale);
  const endFormatted = experience.is_current
    ? t('present')
    : experience.end_date
      ? formatDate(experience.end_date, locale)
      : '';

  const dateRange = endFormatted
    ? `${startFormatted} — ${endFormatted}`
    : startFormatted;

  return (
    <div className="relative rounded-lg border border-slate-200 bg-white p-4">
      {showActions && (
        <div className="absolute right-3 top-3 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <h4 className="text-sm font-semibold text-slate-900 pr-16">
        {experience.job_title}
      </h4>

      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
        <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        {experience.company_name}
      </div>

      {experience.location && (
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="h-3 w-3 shrink-0" />
          {experience.location}
        </div>
      )}

      <p className="mt-1 text-xs text-slate-400">{dateRange}</p>

      {experience.employment_type && TYPE_LABELS[experience.employment_type] && (
        <span className="mt-2 inline-block rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {t(TYPE_LABELS[experience.employment_type])}
        </span>
      )}

      {experience.description && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-500">
          {experience.description}
        </p>
      )}
    </div>
  );
}
