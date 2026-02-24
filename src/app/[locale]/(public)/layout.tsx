import { createClient, getUser } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  let userRole: 'user' | 'company' | 'admin' | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} userRole={userRole} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
