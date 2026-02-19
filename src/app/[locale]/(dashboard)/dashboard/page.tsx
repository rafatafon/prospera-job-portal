import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Globe, FileText } from 'lucide-react';

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

  // Count jobs by status for the company
  let totalJobs = 0;
  let publishedJobs = 0;
  let draftJobs = 0;

  if (companyId) {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('status')
      .eq('company_id', companyId);

    if (jobs) {
      totalJobs = jobs.length;
      publishedJobs = jobs.filter((j) => j.status === 'published').length;
      draftJobs = jobs.filter((j) => j.status === 'draft').length;
    }
  }

  const stats = [
    {
      label: t('totalJobs'),
      value: totalJobs,
      icon: Briefcase,
      accent: '#0057FF',
      bg: '#eff4ff',
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
          style={{ backgroundColor: '#0057FF' }}
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
          Tu cuenta no esta asociada a una empresa. Contacta al administrador.
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

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="mb-4 text-base font-semibold text-slate-700">
          {t('recentActivity')}
        </h2>
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            {tDashboardJobs('noJobs')}
          </p>
          <Button
            asChild
            size="sm"
            className="mt-4 gap-2 text-white"
            style={{ backgroundColor: '#0057FF' }}
          >
            <Link href="/dashboard/jobs/new">
              <PlusCircle className="h-4 w-4" />
              {t('createJob')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
