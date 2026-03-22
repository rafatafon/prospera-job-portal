'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { z } from 'zod';
import { nameSchema, availabilitySchema } from '@/lib/security/validation';
import { validateFileMagicBytes } from '@/lib/security/file-validation';

const candidateProfileSchema = z.object({
  full_name: nameSchema,
  headline: z.string().max(200).optional().default(''),
  bio: z.string().max(5000).optional().default(''),
  location: z.string().max(200).optional().default(''),
  skills: z.string().max(2000).optional().default(''),
  years_of_experience: z.string().optional().default(''),
  availability: availabilitySchema.default('actively_looking'),
  linkedin_url: z.string().url().max(500).optional().or(z.literal('')).default(''),
  is_visible: z.enum(['true', 'false']).default('false'),
});

export async function upsertCandidateProfile(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'user') {
    return { error: 'Only candidates can create profiles' };
  }

  // Parse and validate text fields via Zod schema
  const parsed = candidateProfileSchema.safeParse({
    full_name: formData.get('full_name'),
    headline: formData.get('headline') || '',
    bio: formData.get('bio') || '',
    location: formData.get('location') || '',
    skills: formData.get('skills') || '',
    years_of_experience: formData.get('years_of_experience') || '',
    availability: formData.get('availability') || 'actively_looking',
    linkedin_url: formData.get('linkedin_url') || '',
    is_visible: formData.get('is_visible') === 'true' ? 'true' : 'false',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const {
    full_name: fullName,
    headline,
    bio,
    location,
    skills: skillsRaw,
    years_of_experience: yearsStr,
    availability,
    linkedin_url: linkedinUrl,
    is_visible: isVisibleStr,
  } = parsed.data;

  const skills = skillsRaw ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const yearsOfExperience = yearsStr ? parseInt(yearsStr, 10) : null;
  const isVisible = isVisibleStr === 'true';

  let photoUrl: string | null = null;
  let cvPath: string | null = null;

  // Upload photo if provided
  const photoFile = formData.get('photo') as File | null;
  if (photoFile && photoFile.size > 0) {
    if (!['image/jpeg', 'image/png'].includes(photoFile.type)) {
      return { error: 'Only JPG or PNG images are allowed' };
    }
    if (photoFile.size > 2 * 1024 * 1024) {
      return { error: 'Image must be less than 2 MB' };
    }
    // Verify actual file content via magic bytes
    const expectedType = photoFile.type === 'image/png' ? 'png' as const : 'jpeg' as const;
    const validBytes = await validateFileMagicBytes(photoFile, expectedType);
    if (!validBytes) {
      return { error: 'Photo does not appear to be a valid image file' };
    }
    const ext = photoFile.type === 'image/png' ? 'png' : 'jpg';
    const path = `${user.id}/photo.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('candidate-photos')
      .upload(path, photoFile, { upsert: true });
    if (uploadErr) {
      return { error: 'Photo upload failed. Please try again.' };
    }
    photoUrl = supabase.storage.from('candidate-photos').getPublicUrl(path).data.publicUrl;
  }

  // Upload CV if provided
  const cvFile = formData.get('cv') as File | null;
  if (cvFile && cvFile.size > 0) {
    if (cvFile.type !== 'application/pdf') {
      return { error: 'Only PDF files are allowed' };
    }
    if (cvFile.size > 5 * 1024 * 1024) {
      return { error: 'CV must be less than 5 MB' };
    }
    // Verify actual file content via magic bytes
    const validBytes = await validateFileMagicBytes(cvFile, 'pdf');
    if (!validBytes) {
      return { error: 'CV does not appear to be a valid PDF file' };
    }
    const path = `${user.id}/cv.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('candidate-cvs')
      .upload(path, cvFile, { upsert: true });
    if (uploadErr) {
      return { error: 'CV upload failed. Please try again.' };
    }
    cvPath = path;
  }

  // Check if candidate record already exists
  const { data: existing } = await supabase
    .from('candidates')
    .select('id, photo_url, cv_path')
    .eq('user_id', user.id)
    .single();

  const candidateData = {
    user_id: user.id,
    full_name: fullName,
    headline: headline || null,
    bio: bio || null,
    location: location || null,
    skills,
    years_of_experience: yearsOfExperience,
    availability: availability as 'actively_looking' | 'open_to_offers' | 'not_available',
    linkedin_url: linkedinUrl || null,
    is_visible: isVisible,
    ...(photoUrl ? { photo_url: photoUrl } : {}),
    ...(cvPath ? { cv_path: cvPath } : {}),
  };

  if (existing) {
    // Update
    const { error: updateErr } = await supabase
      .from('candidates')
      .update(candidateData)
      .eq('user_id', user.id);
    if (updateErr) {
      return { error: 'Failed to update profile. Please try again.' };
    }
  } else {
    // Insert
    if (!photoUrl) {
      candidateData.photo_url = null as unknown as string;
    }
    if (!cvPath) {
      candidateData.cv_path = null as unknown as string;
    }
    const { error: insertErr } = await supabase
      .from('candidates')
      .insert(candidateData);
    if (insertErr) {
      return { error: 'Failed to create profile. Please try again.' };
    }
  }

  return { success: true };
}
