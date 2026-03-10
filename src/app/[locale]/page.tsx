import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JobCard } from '@/components/jobs/JobCard';
import { ArrowRight, Briefcase } from 'lucide-react';
import Image from 'next/image';
import type { Database } from '@/types/database.types';

type EmploymentType = Database['public']['Enums']['employment_type'];
type WorkMode = Database['public']['Enums']['work_mode'];

/**
 * Landing page — /[locale]/
 *
 * This page lives outside the (public) route group because Next.js does not
 * allow two pages.tsx at the same URL level (route groups share the parent URL).
 * Header and Footer are imported directly here so the (public)/layout.tsx is
 * only needed for nested public routes like /jobs and /companies.
 *
 * TODO: Once the old placeholder can be removed, move this into (public)/page.tsx.
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const user = await getUser(supabase);

  let userRole: 'user' | 'company' | 'admin' | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role ?? null;
  }

  const t = await getTranslations('landing');
  const tCommon = await getTranslations('common');
  const tJobs = await getTranslations('jobs');
  const tJobCard = await getTranslations('jobCard');

  // Fetch latest published jobs for the featured section
  const { data: featuredJobs } = await supabase
    .from('jobs')
    .select('*, companies(name, slug, logo_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6);

  const jobList = featuredJobs ?? [];

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} userRole={userRole} showLogin={false} />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative -mt-20 overflow-hidden pt-20 min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh]">
          {/* Background image */}
          <Image
            src="/hero-image/hero-job-prospera.avif"
            alt=""
            fill
            priority
            className="object-cover"
            aria-hidden="true"
          />

          {/* Light overlay for text readability */}
          <div
            className="pointer-events-none absolute inset-0 bg-white/40"
            aria-hidden="true"
          />

          {/* Bottom gradient fade to white */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,1) 100%)',
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <div className="max-w-3xl">

              {/* Headline */}
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 drop-shadow-sm sm:text-5xl lg:text-6xl">
                {t('heroTitle')}
              </h1>

              {/* Sub-headline */}
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-700 drop-shadow-sm sm:text-xl">
                {t('heroSubtitle')}
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-2 rounded-lg px-8 text-base font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#E8501C' }}
                >
                  <Link href="/jobs">
                    {t('ctaButton')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

            </div>
          </div>
        </section>

        {/* Featured jobs section — empty state placeholder */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {t('featuredJobs')}
            </h2>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#E8501C' }}
            >
              {tCommon('viewAll')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {jobList.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-3">
              {jobList.map((job) => {
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
          ) : (
            <div className="mt-8 flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                {tCommon('noResults')}
              </p>
              <Button
                asChild
                size="sm"
                className="mt-6 text-white"
                style={{ backgroundColor: '#E8501C' }}
              >
                <Link href="/jobs">{t('ctaButton')}</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
