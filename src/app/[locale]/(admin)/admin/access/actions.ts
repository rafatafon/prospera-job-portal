'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'company', 'admin']),
  company_id: z.string().uuid().optional().or(z.literal('')),
});

export async function createUser(
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  // Verify the caller is an admin
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();
  if (!caller) return { error: 'Not authenticated' };

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single();
  if (callerProfile?.role !== 'admin') return { error: 'Access denied' };

  // Validate input
  const parsed = createUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
    company_id: formData.get('company_id'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { email, password, role, company_id } = parsed.data;

  // Create user via admin API (requires service role key)
  const adminClient = createAdminClient();
  const { data: newUser, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) return { error: authError.message };
  if (!newUser.user) return { error: 'Failed to create user' };

  // Update the auto-created profile with role and company
  const companyId = company_id && company_id !== '' ? company_id : null;
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      role,
      company_id: companyId,
    })
    .eq('id', newUser.user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath('/admin/access');
  return { success: true };
}

export async function changeUserRole(
  userId: string,
  newRole: 'user' | 'company' | 'admin',
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  // If changing to 'user', also remove company association
  const { error } = await supabase
    .from('profiles')
    .update(
      newRole === 'user'
        ? { role: newRole, company_id: null }
        : { role: newRole },
    )
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/access');
  return { success: true };
}

export async function assignUserCompany(
  userId: string,
  companyId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ company_id: companyId, role: 'company' })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/access');
  return { success: true };
}

export async function removeUserCompany(
  userId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ company_id: null })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/access');
  return { success: true };
}
