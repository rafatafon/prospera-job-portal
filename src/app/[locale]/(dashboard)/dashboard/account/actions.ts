'use server';

import { createClient } from '@/lib/supabase/server';
import { safeErrorMessage, passwordSchema, emailSchema } from '@/lib/security/validation';
import { rateLimit } from '@/lib/security/rate-limit';

export async function changePassword(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const rateLimited = await rateLimit('passwordReset');
  if (rateLimited) return { error: 'too_many_requests' };

  const supabase = await createClient();
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return { error: 'min_length' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'mismatch' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'not_authenticated' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: safeErrorMessage(error) };
  }

  return { success: true };
}

export async function changeEmail(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const rateLimited = await rateLimit('passwordReset');
  if (rateLimited) return { error: 'too_many_requests' };

  const supabase = await createClient();
  const newEmail = (formData.get('newEmail') as string)?.trim();

  const parsedEmail = emailSchema.safeParse(newEmail);
  if (!parsedEmail.success) {
    return { error: 'email_required' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'not_authenticated' };
  }

  if (newEmail === user.email) {
    return { error: 'same_email' };
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    return { error: safeErrorMessage(error) };
  }

  // Supabase automatically sends confirmation to new email
  // and notification to old email
  return { success: true };
}
