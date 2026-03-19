import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminTopBar } from '@/components/layout/AdminTopBar';
import { IdleTimeoutProvider } from '@/components/session/IdleTimeoutProvider';

export default async function AdminLayout({
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
    redirect(`/${locale}/admin/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect(`/${locale}/`);
  }

  return (
    <IdleTimeoutProvider locale={locale} loginPath="/admin/login">
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar — desktop */}
        <div className="hidden w-56 shrink-0 md:flex md:flex-col">
          <AdminSidebar />
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <AdminTopBar userEmail={user.email ?? null} locale={locale} />

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </IdleTimeoutProvider>
  );
}
