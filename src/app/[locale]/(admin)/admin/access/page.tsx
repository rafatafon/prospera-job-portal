import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Users } from 'lucide-react';

type UserRole = 'user' | 'company' | 'admin';

const ROLE_STYLE: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: '#f5f3ff', text: '#7c3aed' },
  company: { bg: '#FFF5F0', text: '#C2410C' },
  user: { bg: '#f1f5f9', text: '#475569' },
};

export default async function AdminAccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('adminAccess');

  const supabase = await createClient();

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*, companies(id, name, slug)')
    .order('created_at', { ascending: false });

  const profiles = (profilesData ?? []) as Array<{
    id: string;
    email: string | null;
    full_name: string | null;
    role: UserRole;
    company_id: string | null;
    created_at: string;
    companies: { id: string; name: string; slug: string } | null;
  }>;

  const roleLabels: Record<UserRole, string> = {
    user: t('roleUser'),
    company: t('roleCompany'),
    admin: t('roleAdmin'),
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
        <p className="mt-2 text-xs text-slate-400">
          {t(profiles.length === 1 ? 'userCount' : 'userCountPlural', {
            count: profiles.length,
          })}
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: '#FFF5F0' }}
          >
            <Users className="h-6 w-6" style={{ color: '#E8501C' }} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-700">
            {t('noUsers')}
          </h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Table header (desktop) */}
          <div className="hidden border-b border-slate-100 px-5 py-3 sm:grid sm:grid-cols-[1fr_auto_auto]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('email')}
            </span>
            <span className="w-48 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('role')}
            </span>
            <span className="w-64 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('company')}
            </span>
          </div>

          {/* User rows */}
          <div className="divide-y divide-slate-100">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col gap-3 px-5 py-4 sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4"
              >
                {/* User info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {profile.email ?? '—'}
                    </p>
                    <span
                      className="hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex"
                      style={{
                        backgroundColor: ROLE_STYLE[profile.role].bg,
                        color: ROLE_STYLE[profile.role].text,
                      }}
                    >
                      {roleLabels[profile.role]}
                    </span>
                  </div>
                  {profile.full_name && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {profile.full_name}
                    </p>
                  )}
                  {profile.companies && (
                    <p className="mt-0.5 text-xs text-slate-400 sm:hidden">
                      {profile.companies.name}
                    </p>
                  )}
                </div>

                {/* Role badge (mobile) */}
                <div className="sm:w-48">
                  <span
                    className="mb-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium sm:hidden"
                    style={{
                      backgroundColor: ROLE_STYLE[profile.role].bg,
                      color: ROLE_STYLE[profile.role].text,
                    }}
                  >
                    {roleLabels[profile.role]}
                  </span>
                </div>

                {/* Company name */}
                <div className="sm:w-64">
                  <span className="text-sm text-slate-600">
                    {profile.companies?.name ?? '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
