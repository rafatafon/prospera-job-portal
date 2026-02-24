'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Power, Trash2, Loader2 } from 'lucide-react';
import {
  toggleCompanyActive,
  deleteCompany,
} from '@/app/[locale]/(admin)/admin/companies/actions';

interface CompanyActionButtonsProps {
  companyId: string;
  isActive: boolean;
  labelActive: string;
  labelInactive: string;
  labelDelete: string;
  confirmDelete: string;
  confirmToggleInactive: string;
}

export function CompanyActionButtons({
  companyId,
  isActive,
  labelActive,
  labelInactive,
  labelDelete,
  confirmDelete,
  confirmToggleInactive,
}: CompanyActionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (isActive && !window.confirm(confirmToggleInactive)) return;
    startTransition(async () => {
      await toggleCompanyActive(companyId);
    });
  }

  function handleDelete() {
    if (!window.confirm(confirmDelete)) return;
    startTransition(async () => {
      await deleteCompany(companyId);
    });
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-end">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggle}
        className={[
          'h-7 gap-1 px-2 text-xs font-medium',
          isActive
            ? 'text-amber-700 hover:bg-amber-50 hover:text-amber-800'
            : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800',
        ].join(' ')}
      >
        <Power className="h-3.5 w-3.5" />
        {isActive ? labelInactive : labelActive}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        className="h-7 gap-1 px-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {labelDelete}
      </Button>
    </div>
  );
}
