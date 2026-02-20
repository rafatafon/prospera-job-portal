import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ShieldCheck, Briefcase, Building2 } from 'lucide-react';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin');

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Moderation and management tools for the Prospera portal.
        </p>
      </div>

      {/* Placeholder cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Companies card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#FFF4F0' }}
          >
            <Building2 className="h-5 w-5" style={{ color: '#E8501C' }} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Companies
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Moderation tools coming soon.
          </p>
        </div>

        {/* Jobs card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#FFF4F0' }}
          >
            <Briefcase className="h-5 w-5" style={{ color: '#E8501C' }} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Jobs
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Moderation tools coming soon.
          </p>
        </div>

        {/* Access card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#FFF4F0' }}
          >
            <ShieldCheck className="h-5 w-5" style={{ color: '#E8501C' }} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Access
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            User role management coming soon.
          </p>
        </div>
      </div>

      {/* Admin only notice */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5">
        <p className="text-sm text-slate-500">
          You are signed in as an administrator. This area is restricted to
          admin accounts only.
        </p>
      </div>
    </div>
  );
}
