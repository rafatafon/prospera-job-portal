import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { toDateLocale } from '@/lib/locale';
import { getCountryName } from '@/lib/countries';
import {
  FileText,
  Mail,
  Phone,
  Globe,
  CalendarDays,
  Download,
  Linkedin,
  Briefcase,
} from 'lucide-react';

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(toDateLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function DashboardApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('dashboardApplications');

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

  const { data: applications } = await supabase
    .from('applications')
    .select('*, jobs(title, id)')
    .order('created_at', { ascending: false });

  const appList = applications ?? [];

  // Generate signed URLs for file downloads
  const appsWithUrls = await Promise.all(
    appList.map(async (app) => {
      const { data: resumeUrl } = await supabase.storage
        .from('applications')
        .createSignedUrl(app.resume_path, 3600);

      let coverLetterUrl: string | null = null;
      if (app.cover_letter_path) {
        const { data } = await supabase.storage
          .from('applications')
          .createSignedUrl(app.cover_letter_path, 3600);
        coverLetterUrl = data?.signedUrl ?? null;
      }

      return {
        ...app,
        resumeSignedUrl: resumeUrl?.signedUrl ?? null,
        coverLetterSignedUrl: coverLetterUrl,
      };
    })
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {appList.length === 0
            ? t('noApplications')
            : t(appList.length === 1 ? 'count' : 'countPlural', { count: appList.length })}
        </p>
      </div>

      {/* Applications list */}
      <div className="mt-6">
        {appsWithUrls.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFF5F0' }}
            >
              <FileText className="h-6 w-6" style={{ color: '#E8501C' }} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              {t('noApplications')}
            </h3>
          </div>
        ) : (
          <div className="space-y-2.5">
            {appsWithUrls.map((app) => {
              const job = app.jobs as { title: string; id: string } | null;
              return (
                <div
                  key={app.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Left accent */}
                  <div
                    className="absolute left-0 top-0 h-full w-1"
                    style={{ backgroundColor: '#E8501C' }}
                    aria-hidden="true"
                  />

                  <div className="flex flex-col gap-4 px-5 py-4 pl-6 sm:flex-row sm:items-start sm:justify-between">
                    {/* Applicant info */}
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-semibold text-slate-900">
                        {app.full_name}
                      </h2>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {app.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {app.phone_country_code} {app.phone_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {getCountryName(app.country, locale)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(app.created_at, locale)}
                        </span>
                      </div>

                      {/* Job title */}
                      {job && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                          <Briefcase className="h-3 w-3" />
                          <span>
                            {t('job')}: {job.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {app.resumeSignedUrl && (
                        <a
                          href={app.resumeSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 items-center gap-1.5 rounded-md bg-slate-100 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          <Download className="h-3 w-3" />
                          {t('resume')}
                        </a>
                      )}
                      {app.coverLetterSignedUrl && (
                        <a
                          href={app.coverLetterSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 items-center gap-1.5 rounded-md bg-slate-100 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          <Download className="h-3 w-3" />
                          {t('coverLetter')}
                        </a>
                      )}
                      {app.linkedin_url && (
                        <a
                          href={app.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 items-center gap-1.5 rounded-md bg-blue-50 px-2.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          <Linkedin className="h-3 w-3" />
                          {t('linkedin')}
                        </a>
                      )}
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
