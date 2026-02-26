import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { CompanyActionButtons } from '@/components/admin/CompanyActionButtons';
import { CompanyLogo } from '@/components/ui/company-logo';
import {
  Building2,
  Plus,
  Pencil,
  Globe,
  Briefcase,
} from 'lucide-react';

export default async function AdminCompaniesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('adminCompanies');
  const tCommon = await getTranslations('common');

  const supabase = await createClient();

  const { data: companies } = await supabase
    .from('companies')
    .select('*, jobs(count)')
    .order('name');

  const companyList = (companies ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    website: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    jobs: { count: number }[];
  }>;

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t(
              companyList.length === 1
                ? 'companyCount'
                : 'companyCountPlural',
              { count: companyList.length },
            )}
          </p>
        </div>
        <Button
          asChild
          className="gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#E8501C' }}
        >
          <Link href="/admin/companies/new">
            <Plus className="h-4 w-4" />
            {t('createCompany')}
          </Link>
        </Button>
      </div>

      {/* Companies list */}
      <div className="mt-6">
        {companyList.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFF5F0' }}
            >
              <Building2 className="h-6 w-6" style={{ color: '#E8501C' }} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              {t('noCompanies')}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{t('getStarted')}</p>
            <Button
              asChild
              size="sm"
              className="mt-4 text-white"
              style={{ backgroundColor: '#E8501C' }}
            >
              <Link href="/admin/companies/new">{t('createCompany')}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {companyList.map((company) => {
              const jobCount = company.jobs?.[0]?.count ?? 0;

              return (
                <div
                  key={company.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Left accent bar — active=green, inactive=slate */}
                  <div
                    className="absolute left-0 top-0 h-full w-1"
                    style={{
                      backgroundColor: company.is_active
                        ? '#16a34a'
                        : '#94a3b8',
                    }}
                    aria-hidden="true"
                  />

                  <div className="flex flex-col gap-3 px-5 py-4 pl-6 sm:flex-row sm:items-center sm:justify-between">
                    {/* Company info */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {/* Logo */}
                      <CompanyLogo
                        name={company.name}
                        logoUrl={company.logo_url}
                        size="sm"
                        className="h-10 w-10 sm:h-10 sm:w-10"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-sm font-semibold text-slate-900">
                            {company.name}
                          </h2>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: company.is_active
                                ? '#f0fdf4'
                                : '#f8fafc',
                              color: company.is_active
                                ? '#166534'
                                : '#475569',
                            }}
                          >
                            {company.is_active ? t('active') : t('inactive')}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                          <span className="font-mono">{company.slug}</span>
                          {company.website && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {company.website.replace(/^https?:\/\//, '')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {t(jobCount === 1 ? 'jobCount' : 'jobCountPlural', {
                              count: jobCount,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Link href={`/admin/companies/${company.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          {tCommon('edit')}
                        </Link>
                      </Button>
                      <CompanyActionButtons
                        companyId={company.id}
                        isActive={company.is_active}
                        labelActive={t('active')}
                        labelInactive={t('inactive')}
                        labelDelete={tCommon('delete')}
                        confirmDelete={t('confirmDelete')}
                        confirmToggleInactive={t('confirmToggleInactive')}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
