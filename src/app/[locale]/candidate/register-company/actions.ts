'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient, getUser } from '@/lib/supabase/server';
import { toSlug } from '@/lib/utils';
import { rateLimit } from '@/lib/security/rate-limit';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const upgradeSchema = z.object({
  rpn: z.string().min(1),
  entityId: z.string().min(1),
  companyName: z.string().min(2).max(200),
});

// ---------------------------------------------------------------------------
// Action: Upgrade candidate to company
// ---------------------------------------------------------------------------

type ActionError = { error: string; code: string };

export async function upgradeToCompany(
  locale: string,
  formData: FormData,
): Promise<ActionError | void> {
  const rateLimited = await rateLimit('signup');
  if (rateLimited) return { error: rateLimited.error, code: 'rate_limited' };

  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return { error: 'Not authenticated', code: 'not_authenticated' };
  }

  if (!user.email_confirmed_at) {
    return { error: 'Email not confirmed', code: 'email_not_confirmed' };
  }

  // Verify current role is 'user' (prevent double-upgrade)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'user') {
    return { error: 'Account is already a company', code: 'already_company' };
  }

  // Validate inputs
  const raw = {
    rpn: formData.get('rpn') as string,
    entityId: formData.get('entityId') as string,
    companyName: formData.get('companyName') as string,
  };

  const parsed = upgradeSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: firstIssue?.message ?? 'Invalid input.',
      code: 'validation_error',
    };
  }

  const { rpn, entityId, companyName } = parsed.data;

  const admin = createAdminClient();

  // Defense-in-depth: re-check RPN not already taken
  const { data: existing, error: checkError } = await admin
    .from('companies')
    .select('id')
    .eq('rpn', rpn)
    .maybeSingle();

  if (checkError) {
    return { error: 'Unable to complete registration. Please try again.', code: 'api_error' };
  }

  if (existing) {
    return {
      error: 'A company with this RPN is already registered.',
      code: 'duplicate_rpn',
    };
  }

  // Generate slug and register company via RPC (upgrades role to 'company')
  const slug = toSlug(companyName);

  const { error: rpcError } = await admin.rpc('register_company', {
    p_user_id: user.id,
    p_name: companyName,
    p_slug: slug,
    p_rpn: rpn,
    p_entity_id: entityId,
  });

  if (rpcError) {
    if (rpcError.code === '23505') {
      return {
        error: 'A company with this RPN is already registered.',
        code: 'duplicate_rpn',
      };
    }
    return {
      error: 'Unable to complete registration. Please try again.',
      code: 'registration_error',
    };
  }

  revalidatePath('/');
  redirect(`/${locale}/dashboard`);
}
