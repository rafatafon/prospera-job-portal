'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import {
  changeUserRole,
  assignUserCompany,
  removeUserCompany,
} from '@/app/[locale]/(admin)/admin/access/actions';

type UserRole = 'user' | 'company' | 'admin';

interface UserAccessControlsProps {
  userId: string;
  currentRole: UserRole;
  currentCompanyId: string | null;
  companies: { id: string; name: string }[];
  labels: {
    roleUser: string;
    roleCompany: string;
    roleAdmin: string;
    noCompany: string;
    confirmRoleChange: string;
  };
}

export function UserAccessControls({
  userId,
  currentRole,
  currentCompanyId,
  companies,
  labels,
}: UserAccessControlsProps) {
  const [isPending, startTransition] = useTransition();

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'user', label: labels.roleUser },
    { value: 'company', label: labels.roleCompany },
    { value: 'admin', label: labels.roleAdmin },
  ];

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole;
    if (newRole === currentRole) return;

    const roleLabel = roleOptions.find((r) => r.value === newRole)?.label ?? newRole;
    if (!window.confirm(labels.confirmRoleChange.replace('{role}', roleLabel))) {
      e.target.value = currentRole;
      return;
    }

    startTransition(async () => {
      await changeUserRole(userId, newRole);
    });
  }

  function handleCompanyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const companyId = e.target.value;
    startTransition(async () => {
      if (companyId === '') {
        await removeUserCompany(userId);
      } else {
        await assignUserCompany(userId, companyId);
      }
    });
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Role selector */}
      <select
        value={currentRole}
        onChange={handleRoleChange}
        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:border-[#E8501C] focus:outline-none focus:ring-1 focus:ring-[#E8501C]"
      >
        {roleOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Company selector */}
      <select
        value={currentCompanyId ?? ''}
        onChange={handleCompanyChange}
        className="h-8 max-w-[180px] rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:border-[#E8501C] focus:outline-none focus:ring-1 focus:ring-[#E8501C]"
      >
        <option value="">{labels.noCompany}</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
