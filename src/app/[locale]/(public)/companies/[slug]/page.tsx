import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/jobs/JobCard';
import type { Database } from '@/types/database.types';
import { Globe, Briefcase, Building2, ArrowLeft } from 'lucide-react';

type EmploymentType = Database['public']['Enums']['employment_type'];

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('companies');
  const tCommon = await getTranslations('common');
  const tJobs = await getTranslations('jobs');

  const supabase = await createClient();

  // Fetch active company by slug
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!company) {
    notFound();
  }

  // Fetch published jobs for this company
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const jobList = jobs ?? [];

  const typeLabels: Record<EmploymentType, string> = {
    full_time: tJobs('fullTime'),
    part_time: tJobs('partTime'),
    contract: tJobs('contract'),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F8FC' }}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon('back')}
        </Link>

        {/* Company hero card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Top accent bar */}
          <div
            className="h-2 w-full"
            style={{ backgroundColor: '#0057FF' }}
            aria-hidden="true"
          />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Logo */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={company.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="h-9 w-9 text-slate-400" />
                )}
              </div>

              {/* Company info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {company.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-4">
                  {/* Job count badge */}
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Briefcase className="h-4 w-4" />
                    {jobList.length > 0
                      ? `${jobList.length} empleo${jobList.length !== 1 ? 's' : ''} activo${jobList.length !== 1 ? 's' : ''}`
                      : 'Sin empleos activos'}
                  </span>

                  {/* Website */}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: '#0057FF' }}
                    >
                      <Globe className="h-4 w-4" />
                      {t('website')}
                    </a>
                  )}
                </div>

                {company.description && (
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {company.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('viewJobs')}
            </h2>
            {jobList.length > 0 && (
              <span className="text-sm text-slate-400">
                {jobList.length} resultado{jobList.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {jobList.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: '#eff4ff' }}
              >
                <Briefcase className="h-6 w-6" style={{ color: '#0057FF' }} />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Esta empresa no tiene empleos activos en este momento.
              </p>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-4 text-slate-600"
              >
                <Link href="/jobs">{tCommon('viewAll')}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {jobList.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  company={{
                    name: company.name,
                    slug: company.slug,
                    logo_url: company.logo_url,
                  }}
                  typeLabel={typeLabels[job.employment_type]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
