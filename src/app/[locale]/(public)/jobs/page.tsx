import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import type { Database } from '@/types/database.types';
import { Briefcase } from 'lucide-react';
import { sanitizeSearchInput } from '@/lib/security/sanitize';

type EmploymentType = Database['public']['Enums']['employment_type'];
type WorkMode = Database['public']['Enums']['work_mode'];

export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    query?: string;
    location?: string;
    type?: string;
    work_mode?: string;
  }>;
}) {
  const { locale } = await params;
  const { query, location, type, work_mode } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('jobs');
  const tCommon = await getTranslations('common');
  const tJobCard = await getTranslations('jobCard');

  const supabase = await createClient();
  const user = await getUser(supabase);

  // Base query: published jobs with company info
  let jobsQuery = supabase
    .from('jobs')
    .select('*, companies(name, slug, logo_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (query) {
    const safeQuery = sanitizeSearchInput(query);
    if (safeQuery) {
      jobsQuery = jobsQuery.ilike('title', `%${safeQuery}%`);
    }
  }
  if (location) {
    const safeLocation = sanitizeSearchInput(location);
    if (safeLocation) {
      jobsQuery = jobsQuery.ilike('location', `%${safeLocation}%`);
    }
  }
  if (type && ['full_time', 'part_time', 'contract'].includes(type)) {
    jobsQuery = jobsQuery.eq('employment_type', type as EmploymentType);
  }
  if (work_mode && ['on_site', 'remote', 'hybrid'].includes(work_mode)) {
    jobsQuery = jobsQuery.eq('work_mode', work_mode as WorkMode);
  }

  const { data: jobs } = await jobsQuery;
  const jobList = jobs ?? [];

  const typeLabels: Record<EmploymentType, string> = {
    full_time: t('fullTime'),
    part_time: t('partTime'),
    contract: t('contract'),
  };

  const workModeLabels: Record<WorkMode, string> = {
    on_site: t('onSite'),
    remote: t('remote'),
    hybrid: t('hybrid'),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('title')}
          </h1>
          <p className="mt-2 text-slate-500">
            {jobList.length > 0
              ? t(jobList.length === 1 ? 'jobCount' : 'jobCountPlural', { count: jobList.length })
              : t('noJobs')}
          </p>

          {/* Filters */}
          <div className="mt-6">
            <JobFilters
              initialQuery={query}
              initialLocation={location}
              initialType={type}
              initialWorkMode={work_mode}
            />
          </div>
        </div>
      </div>

      {/* Job list */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Open Application CTA — only for unauthenticated users */}
        {!user && (
          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-orange-100 bg-[#FFF5F0] px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {t('openAppTitle')}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {t('openAppSubtitle')}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href="/candidate/signup"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#ff2c02' }}
              >
                {t('openAppSignUp')}
              </Link>
              <Link
                href="/candidate/login"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {t('openAppLogIn')}
              </Link>
            </div>
          </div>
        )}

        {jobList.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFF5F0' }}
            >
              <Briefcase className="h-7 w-7" style={{ color: '#ff2c02' }} />
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-700">
              {tCommon('noResults')}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{t('noJobs')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {jobList.map((job) => {
              // Supabase returns joined relation as object (or null)
              const company = job.companies as {
                name: string;
                slug: string;
                logo_url: string | null;
              } | null;

              return (
                <JobCard
                  key={job.id}
                  job={job}
                  company={company}
                  typeLabel={typeLabels[job.employment_type]}
                  workModeLabel={workModeLabels[job.work_mode]}
                  locale={locale}
                  dateLabels={{
                    today: tJobCard('today'),
                    yesterday: tJobCard('yesterday'),
                    daysAgo: tJobCard('daysAgo'),
                    weeksAgo: tJobCard('weeksAgo'),
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
