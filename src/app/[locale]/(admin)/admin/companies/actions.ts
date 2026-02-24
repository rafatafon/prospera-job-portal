'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
];

const companySchema = z.object({
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
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

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
  // Extract path from public URL
  const match = logoUrl.match(/company-logos\/(.+)$/);
  if (match) {
    await supabase.storage.from('company-logos').remove([match[1]]);
  }
}

export async function createCompany(
  locale: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const parsed = companySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    website: formData.get('website') || '',
    description: formData.get('description') || '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const supabase = await createClient();

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', parsed.data.slug)
    .single();

  if (existing) {
    return { error: 'A company with this slug already exists' };
  }

  // Insert company
  const { data: company, error: insertError } = await supabase
    .from('companies')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      website: parsed.data.website || null,
      description: parsed.data.description || null,
    })
    .select('id')
    .single();

  if (insertError || !company) {
    return { error: insertError?.message ?? 'Failed to create company' };
  }

  // Handle logo upload
  const logoFile = formData.get('logo');
  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    if (!ACCEPTED_IMAGE_TYPES.includes(logoFile.type)) {
      return { error: 'Logo must be PNG, JPG, or SVG' };
    }
    if (logoFile.size > MAX_LOGO_SIZE) {
      return { error: 'Logo must be less than 2MB' };
    }

    const logoUrl = await uploadLogo(supabase, company.id, logoFile);
    if (logoUrl) {
      await supabase
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('id', company.id);
    }
  }

  revalidatePath(`/${locale}/admin/companies`);
  revalidatePath('/companies');
  redirect(`/${locale}/admin/companies`);
}

export async function updateCompany(
  locale: string,
  companyId: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const parsed = companySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    website: formData.get('website') || '',
    description: formData.get('description') || '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const supabase = await createClient();

  // Check slug uniqueness (exclude current company)
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

  // Fetch current logo to clean up if needed
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

    // Delete old logo if exists
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
    return { error: updateError.message };
  }

  revalidatePath(`/${locale}/admin/companies`);
  revalidatePath('/companies');
  redirect(`/${locale}/admin/companies`);
}

export async function toggleCompanyActive(
  companyId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  // Fetch current state
  const { data: company } = await supabase
    .from('companies')
    .select('is_active')
    .eq('id', companyId)
    .single();

  if (!company) return { error: 'Company not found' };

  const { error } = await supabase
    .from('companies')
    .update({ is_active: !company.is_active })
    .eq('id', companyId);

  if (error) return { error: error.message };

  revalidatePath('/admin/companies');
  revalidatePath('/companies');
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCompany(
  companyId: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  // Clean up logo from storage
  const { data: company } = await supabase
    .from('companies')
    .select('logo_url')
    .eq('id', companyId)
    .single();

  if (company?.logo_url) {
    await deleteLogo(supabase, company.logo_url);
  }

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) return { error: error.message };

  revalidatePath('/admin/companies');
  revalidatePath('/companies');
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}
