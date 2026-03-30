'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { verifyAndLookupRpn } from '@/lib/prospera/client';
import { toSlug } from '@/lib/utils';
import { rateLimit } from '@/lib/security/rate-limit';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const rpnSchema = z.string().min(1, 'RPN is required');

const registerSchema = z.object({
  rpn: z.string().min(1),
  entityId: z.string().min(1),
  companyName: z.string().min(2).max(200),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

type VerifyRpnSuccess = {
  success: true;
  companyName: string;
  companyExtension: string;
  entityId: string;
  rpn: string;
};

type ActionError = {
  error: string;
  code: string;
};

// ---------------------------------------------------------------------------
// Action 1: Verify RPN
// ---------------------------------------------------------------------------

export async function verifyRpn(
  rpn: string,
): Promise<VerifyRpnSuccess | ActionError> {
  const rateLimited = await rateLimit('signup');
  if (rateLimited) return { error: rateLimited.error, code: 'rate_limited' };

  // Validate input
  const parsed = rpnSchema.safeParse(rpn);
  if (!parsed.success) {
    return { error: 'RPN is required.', code: 'validation_error' };
  }

  const cleanRpn = parsed.data.trim();

  // Check for existing company with same RPN
  const admin = createAdminClient();
  const { data: existing, error: dbError } = await admin
    .from('companies')
    .select('id')
    .eq('rpn', cleanRpn)
    .maybeSingle();

  if (dbError) {
    return { error: 'Unable to verify RPN. Please try again.', code: 'api_error' };
  }

  if (existing) {
    return {
      error: 'A company with this RPN is already registered.',
      code: 'duplicate_rpn',
    };
  }

  // Verify against Prospera registry
  const result = await verifyAndLookupRpn(cleanRpn);

  switch (result.status) {
    case 'valid':
      return {
        success: true,
        companyName: result.entity.name,
        companyExtension: result.entity.extension,
        entityId: result.entity.id,
        rpn: result.entity.residentPermitNumber,
      };

    case 'not_found':
      return {
        error: 'No entity found with this RPN.',
        code: 'not_found',
      };

    case 'inactive':
      return {
        error: 'This entity is inactive in the Próspera registry.',
        code: 'inactive',
      };

    case 'natural_person':
      return {
        error: 'This RPN belongs to a natural person, not a legal entity.',
        code: 'natural_person',
      };

    case 'rate_limited':
      return {
        error: 'Too many verification requests. Please try again later.',
        code: 'rate_limited',
      };

    case 'api_error':
      return {
        error: 'Unable to verify RPN at this time. Please try again later.',
        code: 'api_error',
      };
  }
}

// ---------------------------------------------------------------------------
// Action 2: Register Company
// ---------------------------------------------------------------------------

export async function registerCompany(
  locale: string,
  formData: FormData,
): Promise<ActionError | void> {
  const rateLimited = await rateLimit('signup');
  if (rateLimited) return { error: rateLimited.error, code: 'rate_limited' };

  // Extract and validate fields
  const raw = {
    rpn: formData.get('rpn') as string,
    entityId: formData.get('entityId') as string,
    companyName: formData.get('companyName') as string,
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: firstIssue?.message ?? 'Invalid input.',
      code: 'validation_error',
    };
  }

  const { rpn, entityId, companyName, fullName, email, password } = parsed.data;

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

  // Create auth user via regular signUp (sends confirmation email automatically)
  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUpError) {
    if (signUpError.message.includes('already been registered')) {
      return {
        error: 'An account with this email already exists.',
        code: 'email_exists',
      };
    }
    return {
      error: 'Unable to create account. Please try again.',
      code: 'auth_error',
    };
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    return {
      error: 'Unable to create account. Please try again.',
      code: 'auth_error',
    };
  }

  // Generate slug and register company via RPC
  const slug = toSlug(companyName);

  const { error: rpcError } = await admin.rpc('register_company', {
    p_user_id: userId,
    p_name: companyName,
    p_slug: slug,
    p_rpn: rpn,
    p_entity_id: entityId,
  });

  if (rpcError) {
    // Cleanup: remove the auth user we just created
    await admin.auth.admin.deleteUser(userId);

    // Check for unique violation (Postgres error code 23505)
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
  redirect(`/${locale}/company/verify-email`);
}
