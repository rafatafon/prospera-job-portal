'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function candidateLogin(
  locale: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'authentication_failed' };
  }

  // Only allow users with role='user' (candidates)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'user') {
    await supabase.auth.signOut();
    return { error: 'candidate_only' };
  }

  revalidatePath('/', 'layout');
  redirect(`/${locale}/candidate/profile`);
}
