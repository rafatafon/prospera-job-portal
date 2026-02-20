'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface JobFiltersProps {
  initialQuery?: string;
  initialLocation?: string;
  initialType?: string;
}

const ALL_VALUE = '__all__';

export function JobFilters({
  initialQuery = '',
  initialLocation = '',
  initialType = '',
}: JobFiltersProps) {
  const t = useTranslations('jobs');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  const hasActiveFilters = Boolean(initialQuery || initialLocation || initialType);

  function buildParams(overrides: { query?: string; location?: string; type?: string }) {
    const params = new URLSearchParams();
    const query = overrides.query !== undefined ? overrides.query : initialQuery;
    const location = overrides.location !== undefined ? overrides.location : initialLocation;
    const type = overrides.type !== undefined ? overrides.type : initialType;

    if (query) params.set('query', query);
    if (location) params.set('location', location);
    if (type) params.set('type', type);

    return params;
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = buildParams({ query: e.target.value });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleTypeChange(value: string) {
    const resolved = value === ALL_VALUE ? '' : value;
    const params = buildParams({ type: resolved });
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
          className="h-10 border-slate-200 bg-white pl-9 focus-visible:ring-1"
          style={{ '--tw-ring-color': '#E8501C' } as React.CSSProperties}
        />
      </div>

      {/* Job type select */}
      <Select
        value={initialType || ALL_VALUE}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="h-10 w-full border-slate-200 bg-white sm:w-44">
          <SelectValue placeholder={t('allTypes')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t('allTypes')}</SelectItem>
          <SelectItem value="full_time">{t('fullTime')}</SelectItem>
          <SelectItem value="part_time">{t('partTime')}</SelectItem>
          <SelectItem value="contract">{t('contract')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-10 gap-1.5 text-slate-500 hover:text-slate-800"
        >
          <X className="h-3.5 w-3.5" />
          {tCommon('clearFilters')}
        </Button>
      )}
    </div>
  );
}
