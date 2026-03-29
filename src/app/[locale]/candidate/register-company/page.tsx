import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CandidateUpgradeForm } from '@/components/auth/CandidateUpgradeForm';

export default async function RegisterCompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect(`/${locale}/candidate/login`);
  }

  if (!user.email_confirmed_at) {
    redirect(`/${locale}/candidate/verify-email`);
  }

  const t = await getTranslations('candidateUpgrade');

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('pageTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('pageSubtitle')}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <CandidateUpgradeForm userEmail={user.email ?? null} />
      </div>
    </div>
  );
}
