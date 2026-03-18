'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function adminLogin(
  locale: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  // Fetch the user's profile to verify admin role.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'authentication_failed' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    // Sign out non-admin users who attempted to use the admin login
    await supabase.auth.signOut();
    return { error: 'access_denied' };
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

  redirect(`/${locale}/admin`);
}
