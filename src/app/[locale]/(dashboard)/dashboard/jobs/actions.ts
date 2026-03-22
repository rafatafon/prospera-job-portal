'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { safeErrorMessage } from '@/lib/security/validation';

const jobIdSchema = z.string().uuid('Invalid job ID');

const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(50000),
  location: z.string().max(200).optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contract'] as const),
  work_mode: z.enum(['on_site', 'remote', 'hybrid'] as const),
});

// ---------------------------------------------------------------------------
// Shared helper: verify authenticated user owns a company
// ---------------------------------------------------------------------------

async function getAuthenticatedCompanyId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ companyId: string } | { error: string }> {
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
  return { companyId: profile.company_id };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function createJob(
  locale: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const auth = await getAuthenticatedCompanyId(supabase);
  if ('error' in auth) return { error: auth.error };

  const parsed = createJobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location') || undefined,
    employment_type: formData.get('employment_type'),
    work_mode: formData.get('work_mode'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const { error } = await supabase.from('jobs').insert({
    ...parsed.data,
    company_id: auth.companyId,
    status: 'draft',
  });

  if (error) return { error: safeErrorMessage(error) };

  revalidatePath(`/${locale}/dashboard/jobs`);
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard/jobs`);
}

export async function publishJob(
  locale: string,
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  if (!jobIdSchema.safeParse(jobId).success) return { error: 'Invalid job ID' };

  const supabase = await createClient();
  // Defense-in-depth: verify user owns this job's company (RLS also enforces this)
  const auth = await getAuthenticatedCompanyId(supabase);
  if ('error' in auth) return { error: auth.error };

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('company_id', auth.companyId)
    .eq('status', 'draft');

  if (error) return { error: safeErrorMessage(error) };

  revalidatePath(`/${locale}/dashboard/jobs`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/jobs`);
  return { success: true };
}

export async function archiveJob(
  locale: string,
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  if (!jobIdSchema.safeParse(jobId).success) return { error: 'Invalid job ID' };

  const supabase = await createClient();
  // Defense-in-depth: verify user owns this job's company (RLS also enforces this)
  const auth = await getAuthenticatedCompanyId(supabase);
  if ('error' in auth) return { error: auth.error };

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'archived' })
    .eq('id', jobId)
    .eq('company_id', auth.companyId)
    .eq('status', 'published');

  if (error) return { error: safeErrorMessage(error) };

  revalidatePath(`/${locale}/dashboard/jobs`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/jobs`);
  return { success: true };
}

export async function deleteJob(
  locale: string,
  jobId: string,
): Promise<{ error: string } | { success: true }> {
  if (!jobIdSchema.safeParse(jobId).success) return { error: 'Invalid job ID' };

  const supabase = await createClient();
  // Defense-in-depth: verify user owns this job's company (RLS also enforces this)
  const auth = await getAuthenticatedCompanyId(supabase);
  if ('error' in auth) return { error: auth.error };

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
    .eq('company_id', auth.companyId);

  if (error) return { error: safeErrorMessage(error) };

  revalidatePath(`/${locale}/dashboard/jobs`);
  revalidatePath(`/${locale}/dashboard`);
  return { success: true };
}
