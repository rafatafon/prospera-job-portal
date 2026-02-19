import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { Database } from '@/types/database.types';
import { MapPin, Clock } from 'lucide-react';

type EmploymentType = Database['public']['Enums']['employment_type'];

/** Color accent per employment type for the card's left border on hover */
const TYPE_ACCENT: Record<EmploymentType, string> = {
  full_time: '#0057FF',
  part_time: '#0d9488',
  contract: '#7c3aed',
};

const TYPE_BG: Record<EmploymentType, string> = {
  full_time: '#eff4ff',
  part_time: '#f0fdfa',
  contract: '#f5f3ff',
};

const TYPE_TEXT: Record<EmploymentType, string> = {
  full_time: '#1e40af',
  part_time: '#0f766e',
  contract: '#6d28d9',
};

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location: string | null;
    employment_type: EmploymentType;
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
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
  return date.toLocaleDateString('es-HN', { month: 'short', day: 'numeric' });
}

export function JobCard({ job, company, typeLabel }: JobCardProps) {
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

        <div className="flex items-start gap-4 p-5">
          {/* Company logo */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50"
            aria-hidden="true"
          >
            {company?.logo_url ? (
              <Image
                src={company.logo_url}
                alt={company.name}
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-base font-bold text-slate-400">
                {(company?.name ?? 'E').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Company name */}
            <p className="text-xs font-medium text-slate-500">
              {company?.name ?? ''}
            </p>

            {/* Job title */}
            <h3 className="mt-0.5 text-sm font-semibold leading-snug text-slate-900 group-hover:text-[#0057FF] transition-colors">
              {job.title}
            </h3>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              {job.location && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {formatRelativeDate(job.published_at ?? job.created_at)}
              </span>
            </div>
          </div>

          {/* Employment type badge — right aligned */}
          <div className="shrink-0 self-start">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: typeBg, color: typeText }}
            >
              {typeLabel}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
