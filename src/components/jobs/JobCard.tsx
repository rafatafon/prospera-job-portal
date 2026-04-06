import { Link } from '@/i18n/navigation';
import { toDateLocale } from '@/lib/locale';
import { CompanyLogo } from '@/components/ui/company-logo';
import type { Database } from '@/types/database.types';
import { MapPin, Clock } from 'lucide-react';

type EmploymentType = Database['public']['Enums']['employment_type'];
type WorkMode = Database['public']['Enums']['work_mode'];

/** Color accent per employment type for the card's left border on hover */
const TYPE_ACCENT: Record<EmploymentType, string> = {
  full_time: '#ff2c02',
  part_time: '#0d9488',
  contract: '#7c3aed',
};

const TYPE_BG: Record<EmploymentType, string> = {
  full_time: '#FFF5F0',
  part_time: '#f0fdfa',
  contract: '#f5f3ff',
};

const TYPE_TEXT: Record<EmploymentType, string> = {
  full_time: '#C2410C',
  part_time: '#0f766e',
  contract: '#6d28d9',
};

const WORK_MODE_STYLE: Record<WorkMode, { bg: string; text: string }> = {
  on_site: { bg: '#f1f5f9', text: '#475569' },
  remote: { bg: '#ecfdf5', text: '#065f46' },
  hybrid: { bg: '#eff6ff', text: '#1e40af' },
};

/** Pre-translated relative date labels passed from the parent server component */
export interface JobCardDateLabels {
  today: string;
  yesterday: string;
  /** Template string with `{count}` placeholder, e.g. "Hace {count} dias" */
  daysAgo: string;
  /** Template string with `{count}` placeholder, e.g. "Hace {count} sem." */
  weeksAgo: string;
}

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location: string | null;
    employment_type: EmploymentType;
    work_mode: WorkMode;
    published_at: string | null;
    created_at: string;
  };
  company: {
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
  /** Pre-translated employment type label */
  typeLabel: string;
  /** Pre-translated work mode label */
  workModeLabel?: string;
  /** Locale string used for locale-aware date formatting */
  locale?: string;
  /** Pre-translated labels for relative date display */
  dateLabels?: JobCardDateLabels;
}

function formatRelativeDate(
  dateStr: string | null,
  locale: string,
  labels?: JobCardDateLabels,
): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return labels?.today ?? 'Today';
  if (diffDays === 1) return labels?.yesterday ?? 'Yesterday';
  if (diffDays < 7) {
    const template = labels?.daysAgo ?? '__count__ days ago';
    return template.replace('__count__', String(diffDays));
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const template = labels?.weeksAgo ?? '__count__w ago';
    return template.replace('__count__', String(weeks));
  }
  return date.toLocaleDateString(toDateLocale(locale), {
    month: 'short',
    day: 'numeric',
  });
}

export function JobCard({
  job,
  company,
  typeLabel,
  workModeLabel,
  locale = 'es',
  dateLabels,
}: JobCardProps) {
  const accent = TYPE_ACCENT[job.employment_type];
  const typeBg = TYPE_BG[job.employment_type];
  const typeText = TYPE_TEXT[job.employment_type];

  return (
    <Link href={`/jobs/${job.id}`} className="group block focus:outline-none">
      <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        {/* Colored left accent bar — employment type specific */}
        <div
          className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />

        <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
          {/* Company logo */}
          <CompanyLogo
            name={company?.name ?? 'E'}
            logoUrl={company?.logo_url ?? null}
            size="sm"
          />

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Company name */}
            <p className="truncate text-xs font-medium text-slate-500">
              {company?.name ?? ''}
            </p>

            {/* Job title */}
            <h3 className="mt-0.5 text-base font-semibold leading-snug text-slate-900 group-hover:text-[#ff2c02] transition-colors">
              {job.title}
            </h3>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {job.location && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{job.location}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3 shrink-0" />
                {formatRelativeDate(
                  job.published_at ?? job.created_at,
                  locale,
                  dateLabels,
                )}
              </span>
              {/* Employment type badge */}
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: typeBg, color: typeText }}
              >
                {typeLabel}
              </span>
              {/* Work mode badge */}
              {workModeLabel && (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: WORK_MODE_STYLE[job.work_mode].bg,
                    color: WORK_MODE_STYLE[job.work_mode].text,
                  }}
                >
                  {workModeLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
