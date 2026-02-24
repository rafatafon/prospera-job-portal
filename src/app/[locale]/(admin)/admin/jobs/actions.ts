'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function adminPublishJob(
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('status', 'draft');

  if (error) return { error: error.message };

  revalidatePath('/admin/jobs');
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}

export async function adminArchiveJob(
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'archived' })
    .eq('id', jobId)
    .eq('status', 'published');

  if (error) return { error: error.message };

  revalidatePath('/admin/jobs');
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}

export async function adminDeleteJob(
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase.from('jobs').delete().eq('id', jobId);

  if (error) return { error: error.message };

  revalidatePath('/admin/jobs');
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}
