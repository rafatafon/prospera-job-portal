'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/database.types';

type ApplicationStatus = Database['public']['Enums']['application_status'];

export async function updateApplicationStatus(
  locale: string,
  applicationId: string,
  status: ApplicationStatus,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return { error: 'No company associated' };

  // Verify application belongs to a job owned by the user's company
  const { data: application } = await supabase
    .from('applications')
    .select('id, jobs!inner(company_id)')
    .eq('id', applicationId)
    .eq('jobs.company_id', profile.company_id)
    .single();

  if (!application) return { error: 'Application not found' };

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId);

  if (error) return { error: error.message };

  revalidatePath(`/${locale}/dashboard/applications`);
  return { success: true };
}
