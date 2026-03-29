'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/security/rate-limit';
import { emailSchema } from '@/lib/security/validation';

export async function requestPasswordReset(
  locale: string,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const rateLimited = await rateLimit('passwordReset');
  if (rateLimited) return { error: rateLimited.error };

  const supabase = await createClient();
  const rawEmail = (formData.get('email') as string)?.trim();

  if (!rawEmail) {
    return { error: 'email_required' };
  }

  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return { error: 'invalid_email' };
  }
  const email = parsed.data;

  // Save the user's locale and flow origin so /auth/confirm can redirect correctly
  const cookieStore = await cookies();
  cookieStore.set('reset_locale', locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 3600, // 1 hour
  });

  const from = formData.get('from') as string | null;
  if (from) {
    cookieStore.set('reset_from', from, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600,
    });
  }

  // No redirectTo needed — the email template uses a custom link
  // that routes through /auth/confirm with token_hash + type=recovery.
  // The auth/confirm route verifies the OTP server-side and redirects
  // to /reset-password with an active session.
  await supabase.auth.resetPasswordForEmail(email);

  // Always return success to prevent email enumeration attacks.
  // Even if the email doesn't exist, we don't reveal that.
  return { success: true };
}
