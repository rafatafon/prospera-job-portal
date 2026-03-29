'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface JobFiltersProps {
  initialQuery?: string;
  initialLocation?: string;
  initialType?: string;
  initialWorkMode?: string;
}

export function JobFilters({
  initialQuery = '',
  initialLocation = '',
  initialType = '',
  initialWorkMode = '',
}: JobFiltersProps) {
  const t = useTranslations('jobs');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  const hasActiveFilters = Boolean(initialQuery || initialLocation || initialType || initialWorkMode);

  function buildParams(overrides: { query?: string; location?: string; type?: string; work_mode?: string }) {
    const params = new URLSearchParams();
    const query = overrides.query !== undefined ? overrides.query : initialQuery;
    const location = overrides.location !== undefined ? overrides.location : initialLocation;
    const type = overrides.type !== undefined ? overrides.type : initialType;
    const workMode = overrides.work_mode !== undefined ? overrides.work_mode : initialWorkMode;

    if (query) params.set('query', query);
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    if (workMode) params.set('work_mode', workMode);

    return params;
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = buildParams({ query: e.target.value });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = buildParams({ type: e.target.value });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleWorkModeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = buildParams({ work_mode: e.target.value });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleClearFilters() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder={t('searchPlaceholder')}
          defaultValue={initialQuery}
          onChange={handleQueryChange}
          className="h-10 rounded-lg border-slate-200 bg-white pl-9 focus-visible:ring-1"
          style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
        />
      </div>

      {/* Job type select */}
      <select
        value={initialType}
        onChange={handleTypeChange}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-1 sm:w-44"
        style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
      >
        <option value="">{t('allTypes')}</option>
        <option value="full_time">{t('fullTime')}</option>
        <option value="part_time">{t('partTime')}</option>
        <option value="contract">{t('contract')}</option>
      </select>

      {/* Work mode select */}
      <select
        value={initialWorkMode}
        onChange={handleWorkModeChange}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-1 sm:w-52"
        style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
      >
        <option value="">{t('allWorkModes')}</option>
        <option value="on_site">{t('onSite')}</option>
        <option value="remote">{t('remote')}</option>
        <option value="hybrid">{t('hybrid')}</option>
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
          {tCommon('clearFilters')}
        </button>
      )}
    </div>
  );
}
