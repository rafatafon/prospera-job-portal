'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function CandidateFilters() {
  const t = useTranslations('talent');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get('query') ?? '';
  const availability = searchParams.get('availability') ?? '';

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const hasFilters = query || availability;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          defaultValue={query}
          placeholder={t('searchPlaceholder')}
          onChange={(e) => updateFilters({ query: e.target.value })}
          className="h-10 rounded-lg border-slate-200 bg-white pl-10 focus-visible:ring-1"
          style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
        />
      </div>

      {/* Availability */}
      <select
        value={availability}
        onChange={(e) => updateFilters({ availability: e.target.value })}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-1"
        style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
      >
        <option value="">{t('allAvailability')}</option>
        <option value="actively_looking">{t('activelyLooking')}</option>
        <option value="open_to_offers">{t('openToOffers')}</option>
        <option value="not_available">{t('notAvailable')}</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => updateFilters({ query: '', availability: '' })}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
          {tCommon('clearFilters')}
        </button>
      )}
    </div>
  );
}
