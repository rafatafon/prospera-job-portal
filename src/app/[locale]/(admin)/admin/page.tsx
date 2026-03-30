import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { ShieldCheck, Briefcase, Building2, ArrowRight } from 'lucide-react';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin');
  const tOverview = await getTranslations('adminOverview');
  const tCompanies = await getTranslations('adminCompanies');
  const tJobs = await getTranslations('adminJobs');
  const tAccess = await getTranslations('adminAccess');

  const supabase = await createClient();

  // Fetch stats in parallel
  const [companiesResult, jobsResult, profilesResult] = await Promise.all([
    supabase.from('companies').select('is_active'),
    supabase.from('jobs').select('status'),
    supabase.from('profiles').select('id'),
  ]);

  const companies = companiesResult.data ?? [];
  const jobs = jobsResult.data ?? [];
  const users = profilesResult.data ?? [];

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => c.is_active).length;
  const publishedJobs = jobs.filter((j) => j.status === 'published').length;
  const draftJobs = jobs.filter((j) => j.status === 'draft').length;
  const archivedJobs = jobs.filter((j) => j.status === 'archived').length;
  const totalUsers = users.length;

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {tOverview('subtitle')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Companies card */}
        <Link
          href="/admin/companies"
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#FFF4F0' }}
            >
              <Building2 className="h-5 w-5" style={{ color: '#ff2c02' }} />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-[#ff2c02]" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {tCompanies('title')}
          </h2>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalCompanies}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {tOverview('activeCompanies', { active: activeCompanies })}
          </p>
        </Link>

        {/* Jobs card */}
        <Link
          href="/admin/jobs"
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#FFF4F0' }}
            >
              <Briefcase className="h-5 w-5" style={{ color: '#ff2c02' }} />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-[#ff2c02]" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {tJobs('title')}
          </h2>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {jobs.length}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {tOverview('jobsByStatus', {
              published: publishedJobs,
              draft: draftJobs,
              archived: archivedJobs,
            })}
          </p>
        </Link>

        {/* Access card */}
        <Link
          href="/admin/access"
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#FFF4F0' }}
            >
              <ShieldCheck className="h-5 w-5" style={{ color: '#ff2c02' }} />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-[#ff2c02]" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {tAccess('title')}
          </h2>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalUsers}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {tOverview('totalUsers', { count: totalUsers })}
          </p>
        </Link>
      </div>

      {/* Admin only notice */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5">
        <p className="text-sm text-slate-500">
          {tOverview('adminNotice')}
        </p>
      </div>
    </div>
  );
}
