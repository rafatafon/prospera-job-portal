'use server';

import { createClient } from '@/lib/supabase/server';

export async function requestPasswordReset(
  _locale: string,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const email = (formData.get('email') as string)?.trim();

  if (!email) {
    return { error: 'email_required' };
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
