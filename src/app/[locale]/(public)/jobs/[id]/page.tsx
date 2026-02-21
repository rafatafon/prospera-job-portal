import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Database } from '@/types/database.types';
import { ApplicationForm } from '@/components/jobs/ApplicationForm';
import {
  MapPin,
  Briefcase,
  CalendarDays,
  ArrowLeft,
  Building2,
} from 'lucide-react';

type EmploymentType = Database['public']['Enums']['employment_type'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('jobDetail');
  const tJobs = await getTranslations('jobs');
  const tCommon = await getTranslations('common');

  const supabase = await createClient();

  const { data: job } = await supabase
    .from('jobs')
    .select('*, companies(*)')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (!job) {
    notFound();
  }

  const company = job.companies as Database['public']['Tables']['companies']['Row'] | null;

  const typeLabels: Record<EmploymentType, string> = {
    full_time: tJobs('fullTime'),
    part_time: tJobs('partTime'),
    contract: tJobs('contract'),
  };

  const typeBg = TYPE_BG[job.employment_type];
  const typeText = TYPE_TEXT[job.employment_type];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon('back')}
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Job header card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {/* Brand top bar */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: '#E8501C' }}
                aria-hidden="true"
              />
              <div className="p-6">
                {/* Company + logo row */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                    {company?.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    {company && (
                      <Link
                        href={`/companies/${company.slug}`}
                        className="text-sm font-medium text-slate-600 transition-colors hover:text-[#E8501C]"
                      >
                        {company.name}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  {job.title}
                </h1>

                {/* Meta chips */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {/* Employment type */}
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                    style={{ backgroundColor: typeBg, color: typeText }}
                  >
                    {typeLabels[job.employment_type]}
                  </span>

                  {job.location && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  )}

                  {job.published_at && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(job.published_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description card */}
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  {t('description')}
                </h2>
              </div>
              <div className="p-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {job.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {/* Application form */}
            <ApplicationForm jobId={job.id} />

            {/* Job details card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">
                Detalles del puesto
              </h3>
              <dl className="space-y-3">
                <div className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs font-medium text-slate-400">
                      {t('type')}
                    </dt>
                    <dd className="mt-0.5 text-sm text-slate-700">
                      {typeLabels[job.employment_type]}
                    </dd>
                  </div>
                </div>

                {job.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <dt className="text-xs font-medium text-slate-400">
                        {t('location')}
                      </dt>
                      <dd className="mt-0.5 text-sm text-slate-700">
                        {job.location}
                      </dd>
                    </div>
                  </div>
                )}

                {job.published_at && (
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <dt className="text-xs font-medium text-slate-400">
                        {t('postedDate')}
                      </dt>
                      <dd className="mt-0.5 text-sm text-slate-700">
                        {formatDate(job.published_at)}
                      </dd>
                    </div>
                  </div>
                )}

                {company && (
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <dt className="text-xs font-medium text-slate-400">
                        {t('company')}
                      </dt>
                      <dd className="mt-0.5">
                        <Link
                          href={`/companies/${company.slug}`}
                          className="text-sm font-medium transition-colors hover:text-[#E8501C]"
                          style={{ color: '#E8501C' }}
                        >
                          {company.name}
                        </Link>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
