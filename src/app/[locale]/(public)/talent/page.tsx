import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { CandidateFilters } from '@/components/candidates/CandidateFilters';
import { Users } from 'lucide-react';
import type { Metadata } from 'next';
import type { Database } from '@/types/database.types';
import { sanitizeSearchInput } from '@/lib/security/sanitize';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'talent' });

  return {
    title: `${t('title')} — Próspera Job Portal`,
    description: t('subtitle'),
  };
}

/** The site creator is always pinned first in the talent list. */
const CREATOR_ID = process.env.CREATOR_CANDIDATE_ID;

type CandidateAvailability = Database['public']['Enums']['candidate_availability'];

const VALID_AVAILABILITY: CandidateAvailability[] = [
  'actively_looking',
  'open_to_offers',
  'not_available',
];

export default async function TalentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ query?: string; availability?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const user = await getUser(supabase);

  // Derive auth state for candidate card gating (no redirects — page is public)
  let isAuthenticated = false;
  let userRole: string | null = null;
  let ownCandidateId: string | null = null;

  if (user) {
    isAuthenticated = true;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role ?? null;

    // Check if this user has a candidate profile (for own-profile access)
    const { data: ownCandidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('user_id', user.id)
      .single();
    ownCandidateId = ownCandidate?.id ?? null;
  }

  const t = await getTranslations('talent');
  const filters = await searchParams;

  // Build query
  let query = supabase
    .from('candidates')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  // Search filter — sanitize to prevent PostgREST filter injection
  if (filters.query) {
    const safeQuery = sanitizeSearchInput(filters.query);
    if (safeQuery) {
      query = query.or(
        `full_name.ilike.%${safeQuery}%,headline.ilike.%${safeQuery}%`,
      );
    }
  }

  // Availability filter
  if (
    filters.availability &&
    VALID_AVAILABILITY.includes(filters.availability as CandidateAvailability)
  ) {
    query = query.eq('availability', filters.availability as CandidateAvailability);
  }

  const { data: rawCandidates } = await query;

  // Pin the site creator to the top of the list
  const candidates = rawCandidates
    ? [...rawCandidates].sort((a, b) => {
        if (CREATOR_ID) {
          if (a.id === CREATOR_ID) return -1;
          if (b.id === CREATOR_ID) return 1;
        }
        return 0;
      })
    : [];

  // Fetch experiences for all visible candidates to calculate total years
  const candidateIds = candidates.map((c) => c.id);
  const { data: allExperiences } = candidateIds.length > 0
    ? await supabase
        .from('candidate_experiences')
        .select('candidate_id, start_date, end_date, is_current')
        .in('candidate_id', candidateIds)
    : { data: [] };

  // Build a map of candidate_id → total years
  const experienceYearsMap = new Map<string, number>();
  if (allExperiences) {
    const grouped = new Map<string, typeof allExperiences>();
    for (const exp of allExperiences) {
      const list = grouped.get(exp.candidate_id) ?? [];
      list.push(exp);
      grouped.set(exp.candidate_id, list);
    }
    const now = new Date();
    for (const [candidateId, exps] of grouped) {
      let totalMonths = 0;
      for (const exp of exps) {
        const start = new Date(exp.start_date + 'T00:00:00');
        const end = exp.is_current || !exp.end_date ? now : new Date(exp.end_date + 'T00:00:00');
        totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      }
      experienceYearsMap.set(candidateId, Math.max(0, Math.round(totalMonths / 12)));
    }
  }

  const count = candidates.length;

  // Pre-translate labels
  const availabilityLabels: Record<CandidateAvailability, string> = {
    actively_looking: t('activelyLooking'),
    open_to_offers: t('openToOffers'),
    not_available: t('notAvailable'),
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
            {count > 0
              ? count === 1
                ? t('candidateCount').replace('__count__', '1')
                : t('candidateCountPlural').replace('__count__', String(count))
              : t('subtitle')}
          </p>

          {/* Filters */}
          <div className="mt-6">
            <CandidateFilters />
          </div>
        </div>
      </div>

      {/* Candidate list */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {candidates.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isCreator={!!CREATOR_ID && candidate.id === CREATOR_ID}
                creatorLabel={t('creatorBadge')}
                availabilityLabel={availabilityLabels[candidate.availability]}
                experienceLabel={
                  (experienceYearsMap.get(candidate.id) ?? 0) > 0
                    ? t('yearsExperience').replace(
                        '__count__',
                        String(experienceYearsMap.get(candidate.id)),
                      )
                    : ''
                }
                viewProfileLabel={t('viewProfile')}
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                isOwnProfile={!!ownCandidateId && candidate.id === ownCandidateId}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFF5F0' }}
            >
              <Users className="h-7 w-7" style={{ color: '#ff2c02' }} />
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-700">{t('noCandidates')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('noCandidatesDetail')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
