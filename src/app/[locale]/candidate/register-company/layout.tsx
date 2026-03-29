import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { CandidateSidebar } from '@/components/layout/CandidateSidebar';
import { CandidateTopBar } from '@/components/layout/CandidateTopBar';
import { IdleTimeoutProvider } from '@/components/session/IdleTimeoutProvider';

export default async function RegisterCompanyLayout({
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
    redirect(`/${locale}/candidate/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Already a company user — redirect to dashboard
  if (profile?.role === 'company' || profile?.role === 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <IdleTimeoutProvider locale={locale} loginPath="/candidate/login">
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar — desktop */}
        <div className="hidden w-56 shrink-0 md:flex md:flex-col">
          <CandidateSidebar role={profile?.role ?? undefined} />
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <CandidateTopBar userEmail={user.email ?? null} locale={locale} role={profile?.role ?? undefined} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </IdleTimeoutProvider>
  );
}
