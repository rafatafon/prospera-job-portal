'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contract'] as const),
  apply_url: z.string().url().optional().or(z.literal('')),
});

export async function createJob(
  locale: string,
  formData: FormData,
): Promise<{ error: string } | void> {
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

  const parsed = createJobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location') || undefined,
    employment_type: formData.get('employment_type'),
    apply_url: formData.get('apply_url') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const { error } = await supabase.from('jobs').insert({
    ...parsed.data,
    apply_url: parsed.data.apply_url || null,
    company_id: profile.company_id,
    status: 'draft',
  });

  if (error) return { error: error.message };

  revalidatePath(`/${locale}/dashboard/jobs`);
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard/jobs`);
}

export async function publishJob(
  locale: string,
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('jobs')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('status', 'draft');

  if (error) return { error: error.message };

  revalidatePath(`/${locale}/dashboard/jobs`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/jobs`);
  return { success: true };
}

export async function archiveJob(
  locale: string,
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('jobs')
    .update({ status: 'archived' })
    .eq('id', jobId)
    .eq('status', 'published');

  if (error) return { error: error.message };

  revalidatePath(`/${locale}/dashboard/jobs`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/jobs`);
  return { success: true };
}

export async function deleteJob(
  locale: string,
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);

  if (error) return { error: error.message };

  revalidatePath(`/${locale}/dashboard/jobs`);
  revalidatePath(`/${locale}/dashboard`);
  return { success: true };
}
