'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rate-limit';
import { passwordSchema, emailSchema, nameSchema } from '@/lib/security/validation';

const candidateSignupSchema = z.object({
  full_name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export async function candidateSignup(
  locale: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const rateLimited = await rateLimit('signup');
  if (rateLimited) return { error: rateLimited.error };

  const parsed = candidateSignupSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(`/${locale}/candidate/profile`);
}
