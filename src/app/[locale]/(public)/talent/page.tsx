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
    title: `${t('title')} — Prospera Job Portal`,
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

  if (user) {
    isAuthenticated = true;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role ?? null;
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

  const count = candidates.length;

  // Pre-translate labels
  const availabilityLabels: Record<CandidateAvailability, string> = {
    actively_looking: t('activelyLooking'),
    open_to_offers: t('openToOffers'),
    not_available: t('notAvailable'),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <CandidateFilters />
        </div>

        {/* Count */}
        <p className="mb-4 text-sm font-medium text-slate-500">
          {count === 1
            ? t('candidateCount').replace('__count__', '1')
            : t('candidateCountPlural').replace('__count__', String(count))}
        </p>

        {/* Grid */}
        {candidates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isCreator={!!CREATOR_ID && candidate.id === CREATOR_ID}
                creatorLabel={t('creatorBadge')}
                availabilityLabel={availabilityLabels[candidate.availability]}
                experienceLabel={
                  candidate.years_of_experience != null
                    ? t('yearsExperience').replace(
                        '__count__',
                        String(candidate.years_of_experience),
                      )
                    : ''
                }
                viewProfileLabel={t('viewProfile')}
                isAuthenticated={isAuthenticated}
                userRole={userRole}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFF5F0' }}
            >
              <Users className="h-6 w-6" style={{ color: '#E8501C' }} />
            </div>
            <p className="text-sm font-medium text-slate-900">{t('noCandidates')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('noCandidatesDetail')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
