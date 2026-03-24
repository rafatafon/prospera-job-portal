'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { safeErrorMessage } from '@/lib/security/validation';
import { validateFileMagicBytes } from '@/lib/security/file-validation';

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
];

const companyProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers, and hyphens',
    ),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

async function uploadLogo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
  file: File,
): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${companyId}/logo.${ext}`;

  const { error } = await supabase.storage
    .from('company-logos')
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) return null;

  const {
    data: { publicUrl },
  } = supabase.storage.from('company-logos').getPublicUrl(path);
  return publicUrl;
}

async function deleteLogo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  logoUrl: string,
) {
  const match = logoUrl.match(/company-logos\/(.+)$/);
  if (match) {
    await supabase.storage.from('company-logos').remove([match[1]]);
  }
}

export async function updateCompanyProfile(
  locale: string,
  companyId: string,
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const parsed = companyProfileSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    website: formData.get('website') || '',
    description: formData.get('description') || '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const supabase = await createClient();

  // Verify the user owns this company
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (profile?.company_id !== companyId) {
    return { error: 'Access denied' };
  }

  // Check slug uniqueness (excluding own company)
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', parsed.data.slug)
    .neq('id', companyId)
    .single();

  if (existing) {
    return { error: 'A company with this slug already exists' };
  }

  // Handle logo
  const removeLogo = formData.get('remove_logo') === 'true';
  const logoFile = formData.get('logo');
  let logoUrl: string | null | undefined;

  const { data: currentCompany } = await supabase
    .from('companies')
    .select('logo_url')
    .eq('id', companyId)
    .single();

  if (removeLogo && currentCompany?.logo_url) {
    await deleteLogo(supabase, currentCompany.logo_url);
    logoUrl = null;
  } else if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    if (!ACCEPTED_IMAGE_TYPES.includes(logoFile.type)) {
      return { error: 'Logo must be PNG, JPG, or SVG' };
    }
    if (logoFile.size > MAX_LOGO_SIZE) {
      return { error: 'Logo must be less than 2MB' };
    }
    // Validate magic bytes for raster images (SVG is text-based, skip)
    if (logoFile.type === 'image/png' || logoFile.type === 'image/jpeg' || logoFile.type === 'image/jpg') {
      const expectedType = logoFile.type === 'image/png' ? 'png' as const : 'jpeg' as const;
      const validBytes = await validateFileMagicBytes(logoFile, expectedType);
      if (!validBytes) {
        return { error: 'Logo does not appear to be a valid image file' };
      }
    }
    if (currentCompany?.logo_url) {
      await deleteLogo(supabase, currentCompany.logo_url);
    }
    logoUrl = await uploadLogo(supabase, companyId, logoFile);
  }

  const updateData: Record<string, unknown> = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    website: parsed.data.website || null,
    description: parsed.data.description || null,
  };

  if (logoUrl !== undefined) {
    updateData.logo_url = logoUrl;
  }

  const { error: updateError } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyId);

  if (updateError) {
    return { error: safeErrorMessage(updateError) };
  }

  revalidatePath(`/${locale}/dashboard/company`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath('/');
  return { success: true };
}
