'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { MapPin, Briefcase, User } from 'lucide-react';
import { AuthGateDialog } from './AuthGateDialog';

interface CandidateCardProps {
  candidate: {
    id: string;
    full_name: string;
    headline: string | null;
    location: string | null;
    photo_url: string | null;
    skills: string[];
    years_of_experience: number | null;
    availability: 'actively_looking' | 'open_to_offers' | 'not_available';
  };
  availabilityLabel: string;
  experienceLabel: string;
  viewProfileLabel: string;
  isAuthenticated: boolean;
  userRole: string | null;
}

const AVAILABILITY_COLORS = {
  actively_looking: 'bg-green-50 text-green-700 border-green-200',
  open_to_offers: 'bg-amber-50 text-amber-700 border-amber-200',
  not_available: 'bg-slate-50 text-slate-500 border-slate-200',
} as const;

export function CandidateCard({
  candidate,
  availabilityLabel,
  experienceLabel,
  viewProfileLabel,
  isAuthenticated,
  userRole,
}: CandidateCardProps) {
  const [showAuthGate, setShowAuthGate] = useState(false);
  const maxSkills = 4;
  const visibleSkills = candidate.skills.slice(0, maxSkills);
  const remainingCount = candidate.skills.length - maxSkills;

  const canAccessProfile =
    isAuthenticated && (userRole === 'company' || userRole === 'admin');

  const cardContent = (
    <>
      <div className="flex gap-4">
        {/* Photo */}
        {candidate.photo_url ? (
          <Image
            src={candidate.photo_url}
            alt={candidate.full_name}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <User className="h-6 w-6 text-slate-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Name + availability */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-slate-700">
              {candidate.full_name}
            </h3>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${AVAILABILITY_COLORS[candidate.availability]}`}
            >
              {availabilityLabel}
            </span>
          </div>

          {/* Headline */}
          {candidate.headline && (
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {candidate.headline}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {candidate.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {candidate.location}
              </span>
            )}
            {candidate.years_of_experience != null && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {experienceLabel}
              </span>
            )}
          </div>

          {/* Skills */}
          {visibleSkills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs text-slate-400">
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View profile */}
      <div className="mt-3 text-right">
        <span
          className="text-xs font-medium transition-colors group-hover:opacity-80"
          style={{ color: '#E8501C' }}
        >
          {viewProfileLabel} &rarr;
        </span>
      </div>
    </>
  );

  if (canAccessProfile) {
    return (
      <Link
        href={`/talent/${candidate.id}`}
        className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus:outline-none"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${viewProfileLabel}: ${candidate.full_name}`}
        onClick={() => setShowAuthGate(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setShowAuthGate(true);
        }}
        className="group block cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus:ring-2 focus:ring-[#E8501C]/50 focus:ring-offset-2 focus:outline-none"
      >
        {cardContent}
      </div>
      <AuthGateDialog open={showAuthGate} onOpenChange={setShowAuthGate} />
    </>
  );
}
