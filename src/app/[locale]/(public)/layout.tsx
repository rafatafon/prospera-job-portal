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
  let hasCandidateProfile = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role ?? null;

    if (userRole === 'company') {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', user.id)
        .single();
      hasCandidateProfile = !!candidate;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} userRole={userRole} hasCandidateProfile={hasCandidateProfile} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
