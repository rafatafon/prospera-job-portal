import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Briefcase,
  Globe,
  FileText,
  CalendarDays,
  User,
} from 'lucide-react';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('dashboard');
  const tDashboardJobs = await getTranslations('dashboardJobs');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch company via profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  const companyId = profile?.company_id;

  // Fetch jobs with details for stats + activity feed
  let totalJobs = 0;
  let publishedJobs = 0;
  let draftJobs = 0;
  let recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }> = [];

  if (companyId) {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (jobs) {
      totalJobs = jobs.length;
      publishedJobs = jobs.filter((j) => j.status === 'published').length;
      draftJobs = jobs.filter((j) => j.status === 'draft').length;
      recentJobs = jobs.slice(0, 5);
    }
  }

  // Fetch recent applications (RLS scopes to company's jobs)
  const { data: recentApps } = await supabase
    .from('applications')
    .select('id, full_name, created_at, jobs(title)')
    .order('created_at', { ascending: false })
    .limit(5);

  // Build unified activity feed
  type ActivityItem = {
    id: string;
    type: 'job' | 'application';
    title: string;
    subtitle: string;
    date: string;
  };

  const statusLabels: Record<string, string> = {
    draft: tDashboardJobs('draft'),
    published: tDashboardJobs('published'),
    archived: tDashboardJobs('archived'),
  };

  const jobItems: ActivityItem[] = recentJobs.map((job) => ({
    id: `job-${job.id}`,
    type: 'job',
    title: job.title,
    subtitle: statusLabels[job.status] ?? job.status,
    date: job.created_at,
  }));

  const appItems: ActivityItem[] = (recentApps ?? []).map((app) => {
    const job = app.jobs as { title: string } | null;
    return {
      id: `app-${app.id}`,
      type: 'application',
      title: app.full_name,
      subtitle: t('appliedTo', { jobTitle: job?.title ?? '' }),
      date: app.created_at,
    };
  });

  const activityItems = [...jobItems, ...appItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: t('totalJobs'),
      value: totalJobs,
      icon: Briefcase,
      accent: '#ff2c02',
      bg: '#FFF5F0',
    },
    {
      label: t('publishedJobs'),
      value: publishedJobs,
      icon: Globe,
      accent: '#059669',
      bg: '#f0fdf4',
    },
    {
      label: t('draftJobs'),
      value: draftJobs,
      icon: FileText,
      accent: '#d97706',
      bg: '#fffbeb',
    },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('title')}
          </h1>
        </div>
        <Button
          asChild
          size="sm"
          className="gap-2 text-white"
          style={{ backgroundColor: '#ff2c02' }}
        >
          <Link href="/dashboard/jobs/new">
            <PlusCircle className="h-4 w-4" />
            {t('createJob')}
          </Link>
        </Button>
      </div>

      {/* No company warning */}
      {!companyId && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {t('noCompanyWarning')}
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {/* Left accent border */}
              <div
                className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                style={{ backgroundColor: stat.accent }}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon className="h-5 w-5" style={{ color: stat.accent }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="mt-10">
        <h2 className="mb-4 text-base font-semibold text-slate-700">
          {t('recentActivity')}
        </h2>
        {activityItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              {t('noActivity')}
            </p>
            <Button
              asChild
              size="sm"
              className="mt-4 gap-2 text-white"
              style={{ backgroundColor: '#ff2c02' }}
            >
              <Link href="/dashboard/jobs/new">
                <PlusCircle className="h-4 w-4" />
                {t('createJob')}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {activityItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      item.type === 'application' ? '#EFF6FF' : '#FFF5F0',
                  }}
                >
                  {item.type === 'application' ? (
                    <User
                      className="h-4 w-4"
                      style={{ color: '#3B82F6' }}
                    />
                  ) : (
                    <Briefcase
                      className="h-4 w-4"
                      style={{ color: '#ff2c02' }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
                <span className="shrink-0 flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(item.date, locale)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
