import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CandidateProfileForm } from '@/components/candidates/CandidateProfileForm';
import type { Database } from '@/types/database.types';

type CandidateRow = Database['public']['Tables']['candidates']['Row'];

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect(`/${locale}/candidate/login`);
  }

  // Verify role is 'user'
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'user') {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch existing candidate record
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const t = await getTranslations('candidateProfile');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div
            className="h-1.5 w-full rounded-t-xl"
            style={{ backgroundColor: '#E8501C' }}
            aria-hidden="true"
          />
          <div className="border-b border-slate-100 px-6 py-5">
            <h1 className="text-lg font-bold text-slate-900">{t('title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
          </div>
          <CandidateProfileForm candidate={candidate as CandidateRow | null} />
        </div>
      </div>
    </div>
  );
}
