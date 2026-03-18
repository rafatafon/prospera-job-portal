'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

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

  const cookieStore = await cookies();
  cookieStore.set('session_started_at', Date.now().toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  });

  redirect(`/${locale}/candidate/profile`);
}
