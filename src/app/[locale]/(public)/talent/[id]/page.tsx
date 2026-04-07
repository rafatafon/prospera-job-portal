import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Linkedin,
  Download,
  User,
  Calendar,
  Sparkles,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database.types';

type CandidateAvailability = Database['public']['Enums']['candidate_availability'];

const CREATOR_ID = process.env.CREATOR_CANDIDATE_ID;

const AVAILABILITY_COLORS = {
  actively_looking: 'bg-green-50 text-green-700 border-green-200',
  open_to_offers: 'bg-amber-50 text-amber-700 border-amber-200',
  not_available: 'bg-slate-50 text-slate-500 border-slate-200',
} as const;

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Only company and admin users
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'company' && profile?.role !== 'admin') {
    redirect(`/${locale}/jobs`);
  }

  const t = await getTranslations('talent');

  // Fetch candidate
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single();

  if (!candidate) {
    notFound();
  }

  // Fetch experiences
  const { data: experiences } = await supabase
    .from('candidate_experiences')
    .select('*')
    .eq('candidate_id', candidate.id)
    .order('start_date', { ascending: false });

  const experienceList = experiences ?? [];

  // Calculate total years from experiences
  let totalExperienceYears = 0;
  if (experienceList.length > 0) {
    let totalMonths = 0;
    const now = new Date();
    for (const exp of experienceList) {
      const start = new Date(exp.start_date + 'T00:00:00');
      const end = exp.is_current || !exp.end_date ? now : new Date(exp.end_date + 'T00:00:00');
      totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    }
    totalExperienceYears = Math.max(0, Math.round(totalMonths / 12));
  }

  // Generate signed URL for CV download
  let cvUrl: string | null = null;
  if (candidate.cv_path) {
    const { data: signedData } = await supabase.storage
      .from('candidate-cvs')
      .createSignedUrl(candidate.cv_path, 120);
    cvUrl = signedData?.signedUrl ?? null;
  }

  const availabilityLabels: Record<CandidateAvailability, string> = {
    actively_looking: t('activelyLooking'),
    open_to_offers: t('openToOffers'),
    not_available: t('notAvailable'),
  };

  const joinedDate = new Date(candidate.created_at).toLocaleDateString(
    locale === 'es' ? 'es-HN' : 'en-US',
    { year: 'numeric', month: 'long' },
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <Link
          href="/talent"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToTalent')}
        </Link>

        {/* Profile card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div
            className="h-1.5 w-full rounded-t-xl"
            style={{ backgroundColor: '#ff2c02' }}
            aria-hidden="true"
          />

          <div className="p-6 sm:p-8">
            {/* Header row */}
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              {candidate.photo_url ? (
                <Image
                  src={candidate.photo_url}
                  alt={candidate.full_name}
                  width={96}
                  height={96}
                  className="h-24 w-24 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
              )}

              <div className="text-center sm:text-left">
                {!!CREATOR_ID && candidate.id === CREATOR_ID && (
                  <span
                    className="mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ color: '#ff2c02', backgroundColor: 'rgba(255, 44, 2, 0.08)' }}
                  >
                    <Sparkles className="h-2.5 w-2.5 shrink-0" />
                    {t('creatorBadge')}
                  </span>
                )}
                <h1 className="text-2xl font-bold text-slate-900">
                  {candidate.full_name}
                </h1>
                {candidate.headline && (
                  <p className="mt-1 text-base text-slate-500">
                    {candidate.headline}
                  </p>
                )}

                {/* Badges */}
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${AVAILABILITY_COLORS[candidate.availability]}`}
                  >
                    {availabilityLabels[candidate.availability]}
                  </span>
                </div>

                {/* Meta */}
                <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-slate-400 sm:justify-start">
                  {candidate.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {candidate.location}
                    </span>
                  )}
                  {totalExperienceYears > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {t('yearsExperience').replace(
                        '__count__',
                        String(totalExperienceYears),
                      )}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {candidate.bio && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-slate-700">{t('bio')}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {candidate.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {candidate.skills.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-slate-700">
                  {t('skills')}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience timeline */}
            {experienceList.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-slate-700">
                  {t('experienceSection')}
                </h2>
                <div className="mt-3 space-y-3">
                  {experienceList.map((exp) => {
                    const startFormatted = new Date(exp.start_date + 'T00:00:00').toLocaleDateString(
                      locale === 'es' ? 'es-HN' : 'en-US',
                      { year: 'numeric', month: 'short' },
                    );
                    const endFormatted = exp.is_current
                      ? (locale === 'es' ? 'Actualidad' : 'Present')
                      : exp.end_date
                        ? new Date(exp.end_date + 'T00:00:00').toLocaleDateString(
                            locale === 'es' ? 'es-HN' : 'en-US',
                            { year: 'numeric', month: 'short' },
                          )
                        : '';

                    return (
                      <div key={exp.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <h3 className="text-sm font-semibold text-slate-900">{exp.job_title}</h3>
                        <p className="mt-0.5 text-sm text-slate-600">{exp.company_name}</p>
                        {exp.location && (
                          <p className="mt-0.5 text-xs text-slate-400">{exp.location}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {startFormatted}{endFormatted ? ` — ${endFormatted}` : ''}
                        </p>
                        {exp.employment_type && (
                          <span className="mt-1.5 inline-block rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                            {exp.employment_type === 'full_time' ? (locale === 'es' ? 'Tiempo completo' : 'Full time')
                              : exp.employment_type === 'part_time' ? (locale === 'es' ? 'Medio tiempo' : 'Part time')
                              : (locale === 'es' ? 'Contrato' : 'Contract')}
                          </span>
                        )}
                        {exp.description && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-500">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              {cvUrl && (
                <Button asChild className="gap-2 text-white hover:opacity-90" style={{ backgroundColor: '#ff2c02' }}>
                  <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    {t('downloadCV')}
                  </a>
                </Button>
              )}

              {candidate.linkedin_url && (
                <Button asChild variant="outline" className="gap-2">
                  <a
                    href={
                      candidate.linkedin_url.startsWith('http')
                        ? candidate.linkedin_url
                        : `https://${candidate.linkedin_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4" />
                    {t('linkedin')}
                  </a>
                </Button>
              )}

              {candidate.contact_email && (
                <Button asChild variant="outline" className="gap-2">
                  <a href={`mailto:${candidate.contact_email}`}>
                    <Mail className="h-4 w-4" />
                    {t('sendEmail')}
                  </a>
                </Button>
              )}

              {candidate.phone_number && (
                <Button asChild variant="outline" className="gap-2">
                  <a href={`tel:${candidate.phone_country_code || ''}${candidate.phone_number}`}>
                    <Phone className="h-4 w-4" />
                    {t('callPhone')}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
