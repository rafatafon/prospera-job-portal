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
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
      </div>

      <div className="max-w-xl">
        <AccountSettingsForm
          userEmail={user.email ?? null}
          emailChanged={emailChanged === 'true'}
        />
      </div>
    </div>
  );
}
