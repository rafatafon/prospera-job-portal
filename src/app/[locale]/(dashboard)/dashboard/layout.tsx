import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopBar } from '@/components/layout/DashboardTopBar';
import { IdleTimeoutProvider } from '@/components/session/IdleTimeoutProvider';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch profile and company
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(id, name)')
    .eq('id', user.id)
    .single();

  // Only company and admin users can access the dashboard.
  // Users with role 'user' (or no profile) are redirected to the public home page.
  if (profile?.role !== 'company' && profile?.role !== 'admin') {
    redirect(`/${locale}/`);
  }

  const companyName =
    (profile?.companies as { id: string; name: string } | null)?.name ?? null;

  return (
    <IdleTimeoutProvider locale={locale} loginPath="/login">
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar — desktop */}
        <div className="hidden w-56 shrink-0 md:flex md:flex-col">
          <DashboardSidebar />
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopBar
            companyName={companyName}
            userEmail={user.email ?? null}
            locale={locale}
          />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </IdleTimeoutProvider>
  );
}
