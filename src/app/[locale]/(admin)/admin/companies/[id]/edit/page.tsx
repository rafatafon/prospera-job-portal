import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CompanyForm } from '@/components/admin/CompanyForm';

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: company } = await supabase
    .from('companies')
    .select('id, name, slug, website, description, logo_url')
    .eq('id', id)
    .single();

  if (!company) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8">
      <CompanyForm locale={locale} initialData={company} />
    </div>
  );
}
