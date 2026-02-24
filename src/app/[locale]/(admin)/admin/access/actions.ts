'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
