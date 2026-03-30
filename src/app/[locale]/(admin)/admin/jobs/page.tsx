import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/company-logo';
import type { Database } from '@/types/database.types';
import { Briefcase, MapPin, CalendarDays } from 'lucide-react';

type JobStatus = Database['public']['Enums']['job_status'];
type EmploymentType = Database['public']['Enums']['employment_type'];
type WorkMode = Database['public']['Enums']['work_mode'];

const STATUS_ACCENT: Record<JobStatus, string> = {
  draft: '#d97706',
  published: '#16a34a',
  archived: '#94a3b8',
};

const STATUS_BG: Record<JobStatus, string> = {
  draft: '#fffbeb',
  published: '#f0fdf4',
  archived: '#f8fafc',
};

const STATUS_TEXT: Record<JobStatus, string> = {
  draft: '#92400e',
  published: '#166534',
  archived: '#475569',
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

export default async function AdminJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status: statusFilter } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('adminJobs');
  const tJobs = await getTranslations('jobs');

  const supabase = await createClient();

  let query = supabase
    .from('jobs')
    .select('*, companies(name, slug, logo_url)')
    .order('created_at', { ascending: false });

  const validStatuses: JobStatus[] = ['draft', 'published', 'archived'];
  const activeStatus = validStatuses.includes(statusFilter as JobStatus)
    ? (statusFilter as JobStatus)
    : null;

  if (activeStatus) {
    query = query.eq('status', activeStatus);
  }

  const { data: jobs } = await query;
  const jobList = (jobs ?? []) as (Database['public']['Tables']['jobs']['Row'] & {
    companies: { name: string; slug: string; logo_url: string | null } | null;
  })[];

  const statusTabs: { key: string; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'draft', label: t('draft') },
    { key: 'published', label: t('published') },
    { key: 'archived', label: t('archived') },
  ];

  const typeLabels: Record<EmploymentType, string> = {
    full_time: tJobs('fullTime'),
    part_time: tJobs('partTime'),
    contract: tJobs('contract'),
  };

  const workModeLabels: Record<WorkMode, string> = {
    on_site: tJobs('onSite'),
    remote: tJobs('remote'),
    hybrid: tJobs('hybrid'),
  };

  const statusLabels: Record<JobStatus, string> = {
    draft: t('draft'),
    published: t('published'),
    archived: t('archived'),
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t(jobList.length === 1 ? 'jobCount' : 'jobCountPlural', {
            count: jobList.length,
          })}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-slate-200">
        {statusTabs.map((tab) => {
          const isActive =
            tab.key === 'all' ? !activeStatus : tab.key === activeStatus;
          return (
            <Link
              key={tab.key}
              href={
                tab.key === 'all'
                  ? '/admin/jobs'
                  : `/admin/jobs?status=${tab.key}`
              }
              className={[
                'shrink-0 px-4 py-2.5 text-sm font-medium transition-colors',
                'border-b-2 -mb-px',
                isActive
                  ? 'border-[#ff2c02] text-[#ff2c02]'
                  : 'border-transparent text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Jobs list */}
      <div className="mt-4">
        {jobList.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFF5F0' }}
            >
              <Briefcase className="h-6 w-6" style={{ color: '#ff2c02' }} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              {t('noJobs')}
            </h3>
          </div>
        ) : (
          <div className="space-y-2.5">
            {jobList.map((job) => {
              const company = job.companies;
              return (
                <div
                  key={job.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Left accent bar — color by status */}
                  <div
                    className="absolute left-0 top-0 h-full w-1"
                    style={{ backgroundColor: STATUS_ACCENT[job.status] }}
                    aria-hidden="true"
                  />

                  <div className="flex flex-col gap-3 px-5 py-4 pl-6 sm:flex-row sm:items-center sm:justify-between">
                    {/* Job info */}
                    <div className="min-w-0 flex-1">
                      {/* Company row */}
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <CompanyLogo
                          name={company?.name ?? ''}
                          logoUrl={company?.logo_url ?? null}
                          size="xs"
                        />
                        <span className="text-xs font-medium text-slate-500">
                          {company?.name ?? t('company')}
                        </span>
                      </div>

                      {/* Title + status badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-slate-900">
                          {job.title}
                        </h2>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: STATUS_BG[job.status],
                            color: STATUS_TEXT[job.status],
                          }}
                        >
                          {statusLabels[job.status]}
                        </span>
                      </div>

                      {/* Metadata row */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                        <span
                          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: TYPE_BG[job.employment_type],
                            color: TYPE_TEXT[job.employment_type],
                          }}
                        >
                          {typeLabels[job.employment_type]}
                        </span>
                        <span>{workModeLabels[job.work_mode]}</span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(
                            job.published_at ?? job.created_at,
                            locale,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
