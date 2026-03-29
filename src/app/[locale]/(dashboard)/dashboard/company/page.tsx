import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { CompanyProfileForm } from '@/components/dashboard/CompanyProfileForm';

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('companyProfile');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t('noCompany')}</p>
      </div>
    );
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, slug, website, description, logo_url')
    .eq('id', profile.company_id)
    .single();

  if (!company) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t('noCompany')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
      </div>
      <CompanyProfileForm
        locale={locale}
        initialData={{
          id: company.id,
          name: company.name,
          slug: company.slug,
          website: company.website,
          description: company.description,
          logo_url: company.logo_url,
        }}
      />
    </div>
  );
}
