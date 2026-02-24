import { setRequestLocale } from 'next-intl/server';
import { CompanyForm } from '@/components/admin/CompanyForm';

export default async function NewCompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="p-6 lg:p-8">
      <CompanyForm locale={locale} />
    </div>
  );
}
