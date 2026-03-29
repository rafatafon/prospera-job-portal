import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { AccountSettingsForm } from '@/components/dashboard/AccountSettingsForm';

export default async function AccountSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ emailChanged?: string }>;
}) {
  const { locale } = await params;
  const { emailChanged } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('accountSettings');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
      </div>

      <div>
        <AccountSettingsForm
          userEmail={user.email ?? null}
          emailChanged={emailChanged === 'true'}
        />
      </div>
    </div>
  );
}
