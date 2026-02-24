import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { toDateLocale } from '@/lib/locale';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge';
import { JobActionButtons } from '@/components/jobs/JobActionButtons';
import type { Database } from '@/types/database.types';
import { PlusCircle, Briefcase, MapPin, CalendarDays } from 'lucide-react';

type JobStatus = Database['public']['Enums']['job_status'];
type EmploymentType = Database['public']['Enums']['employment_type'];
type WorkMode = Database['public']['Enums']['work_mode'];

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(toDateLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function DashboardJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status: statusFilter } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('dashboardJobs');
  const tCommon = await getTranslations('common');
  const tJobs = await getTranslations('jobs');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
    notFound();
  }

  // TypeScript narrowing: after notFound(), profile and company_id are defined
  const companyId = profile!.company_id as string;

  // Fetch all jobs for this company, ordered newest-first
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  // Apply tab filter if valid
  const validStatuses: JobStatus[] = ['draft', 'published', 'archived'];
  const activeStatus = validStatuses.includes(statusFilter as JobStatus)
    ? (statusFilter as JobStatus)
    : null;

  if (activeStatus) {
    query = query.eq('status', activeStatus);
  }

  const { data: jobs } = await query;

  const jobList = jobs ?? [];

  // Build status tabs dynamically with translations
  const statusTabs: Array<{ key: JobStatus | 'all'; label: string }> = [
    { key: 'all', label: t('all') },
    { key: 'draft', label: t('draft') },
    { key: 'published', label: t('published') },
    { key: 'archived', label: t('archived') },
  ];

  // Build employment type label map with translations
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {jobList.length === 0
              ? t('noJobs')
              : t(jobList.length === 1 ? 'jobCount' : 'jobCountPlural', { count: jobList.length })}
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="gap-2 text-white"
          style={{ backgroundColor: '#E8501C' }}
        >
          <Link href="/dashboard/jobs/new">
            <PlusCircle className="h-4 w-4" />
            {t('newJob')}
          </Link>
        </Button>
      </div>

      {/* Status tabs */}
      <div className="mt-6 flex items-center gap-0.5 overflow-x-auto border-b border-slate-200 pb-0">
        {statusTabs.map((tab) => {
          const isActive = tab.key === 'all' ? !activeStatus : tab.key === activeStatus;
          return (
            <Link
              key={tab.key}
              href={
                tab.key === 'all'
                  ? '/dashboard/jobs'
                  : `/dashboard/jobs?status=${tab.key}`
              }
              className={[
                'shrink-0 px-4 py-2.5 text-sm font-medium transition-colors',
                'border-b-2 -mb-px',
                isActive
                  ? 'border-[#E8501C] text-[#E8501C]'
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
          /* Empty state */
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFF5F0' }}
            >
              <Briefcase className="h-6 w-6" style={{ color: '#E8501C' }} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              {t('noJobs')}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {t('getStarted')}
            </p>
            <Button
              asChild
              size="sm"
              className="mt-6 gap-2 text-white"
              style={{ backgroundColor: '#E8501C' }}
            >
              <Link href="/dashboard/jobs/new">
                <PlusCircle className="h-4 w-4" />
                {t('newJob')}
              </Link>
            </Button>
          </div>
        ) : (
          /* Job cards list */
          <div className="space-y-2.5">
            {jobList.map((job) => (
              <div
                key={job.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Left accent — color by status */}
                <div
                  className="absolute left-0 top-0 h-full w-1"
                  style={{
                    backgroundColor:
                      job.status === 'published'
                        ? '#16a34a'
                        : job.status === 'draft'
                          ? '#d97706'
                          : '#94a3b8',
                  }}
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-3 px-5 py-4 pl-6 sm:flex-row sm:items-center sm:justify-between">
                  {/* Job info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-slate-900">
                        {job.title}
                      </h2>
                      <JobStatusBadge
                        status={job.status}
                        labelDraft={statusLabels.draft}
                        labelPublished={statusLabels.published}
                        labelArchived={statusLabels.archived}
                      />
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {typeLabels[job.employment_type]}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        {workModeLabels[job.work_mode]}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(job.created_at, locale)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {(job.status === 'draft' || job.status === 'published') && (
                      <Link
                        href={`/dashboard/jobs/${job.id}/edit`}
                        className="flex h-7 items-center rounded-md px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                      >
                        {tCommon('edit')}
                      </Link>
                    )}
                    <JobActionButtons jobId={job.id} status={job.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
