'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { z } from 'zod';
import { nameSchema, availabilitySchema } from '@/lib/security/validation';
import { validateFileMagicBytes, scanPdfContent, scanImageContent } from '@/lib/security/file-validation';
import { rateLimit } from '@/lib/security/rate-limit';

const candidateProfileSchema = z.object({
  full_name: nameSchema,
  headline: z.string().max(200).optional().default(''),
  bio: z.string().max(5000).optional().default(''),
  location: z.string().max(200).optional().default(''),
  skills: z.string().max(2000).optional().default(''),
  availability: availabilitySchema.default('actively_looking'),
  linkedin_url: z.string().url().max(500).optional().or(z.literal('')).default(''),
  contact_email: z.string().email().max(254).optional().or(z.literal('')).default(''),
  phone_country_code: z.string().max(5).optional().or(z.literal('')).default(''),
  phone_number: z.string().max(20).optional().or(z.literal('')).default(''),
  is_visible: z.enum(['true', 'false']).default('false'),
});

export async function upsertCandidateProfile(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const rateLimited = await rateLimit('profileUpdate');
  if (rateLimited) return { error: 'too_many_requests' };

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

  if (profile?.role !== 'user' && profile?.role !== 'company') {
    return { error: 'Only candidates can create profiles' };
  }

  // Parse and validate text fields via Zod schema
  const parsed = candidateProfileSchema.safeParse({
    full_name: formData.get('full_name'),
    headline: formData.get('headline') || '',
    bio: formData.get('bio') || '',
    location: formData.get('location') || '',
    skills: formData.get('skills') || '',
    availability: formData.get('availability') || 'actively_looking',
    linkedin_url: (() => {
      const raw = (formData.get('linkedin_url') as string) || '';
      if (!raw) return '';
      // Strip any protocol the user may have pasted, then always prepend https://
      const stripped = raw.replace(/^https?:\/\//, '');
      return `https://${stripped}`;
    })(),
    contact_email: formData.get('contact_email') || '',
    phone_country_code: formData.get('phone_country_code') || '',
    phone_number: formData.get('phone_number') || '',
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
    availability,
    linkedin_url: linkedinUrl,
    contact_email: contactEmail,
    phone_country_code: phoneCountryCode,
    phone_number: phoneNumber,
    is_visible: isVisibleStr,
  } = parsed.data;

  const skills = skillsRaw ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
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
    const imageScan = await scanImageContent(photoFile);
    if (!imageScan.safe) {
      return { error: 'Photo contains content that is not allowed' };
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
    const cvScan = await scanPdfContent(cvFile);
    if (!cvScan.safe) {
      return { error: 'CV contains content that is not allowed' };
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
    availability: availability as 'actively_looking' | 'open_to_offers' | 'not_available',
    linkedin_url: linkedinUrl || null,
    contact_email: contactEmail || null,
    phone_country_code: phoneCountryCode || null,
    phone_number: phoneNumber || null,
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

// ---------------------------------------------------------------------------
// Experience CRUD
// ---------------------------------------------------------------------------

const experienceSchema = z.object({
  job_title: z.string().min(1).max(200),
  company_name: z.string().min(1).max(200),
  location: z.string().max(200).optional().or(z.literal('')),
  start_date: z.string().min(1),
  end_date: z.string().optional().or(z.literal('')),
  is_current: z.enum(['true', 'false']).default('false'),
  description: z.string().max(5000).optional().or(z.literal('')),
  employment_type: z.enum(['full_time', 'part_time', 'contract', '']).optional().default(''),
});

const uuidSchema = z.string().uuid();

async function resolveCandidate(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('candidates')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function addExperience(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const rateLimited = await rateLimit('profileUpdate');
  if (rateLimited) return { error: 'too_many_requests' };

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return { error: 'Not authenticated' };

  const candidate = await resolveCandidate(supabase, user.id);
  if (!candidate) return { error: 'No candidate profile found' };

  const parsed = experienceSchema.safeParse({
    job_title: formData.get('job_title'),
    company_name: formData.get('company_name'),
    location: formData.get('location') || '',
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date') || '',
    is_current: formData.get('is_current') === 'true' ? 'true' : 'false',
    description: formData.get('description') || '',
    employment_type: formData.get('employment_type') || '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const { error } = await supabase.from('candidate_experiences').insert({
    candidate_id: candidate.id,
    job_title: parsed.data.job_title,
    company_name: parsed.data.company_name,
    location: parsed.data.location || null,
    start_date: parsed.data.start_date,
    end_date: parsed.data.is_current === 'true' ? null : (parsed.data.end_date || null),
    is_current: parsed.data.is_current === 'true',
    description: parsed.data.description || null,
    employment_type: parsed.data.employment_type || null,
  });

  if (error) return { error: 'Failed to add experience. Please try again.' };
  return { success: true };
}

export async function updateExperience(
  experienceId: string,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  if (!uuidSchema.safeParse(experienceId).success) return { error: 'Invalid ID' };

  const rateLimited = await rateLimit('profileUpdate');
  if (rateLimited) return { error: 'too_many_requests' };

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return { error: 'Not authenticated' };

  const candidate = await resolveCandidate(supabase, user.id);
  if (!candidate) return { error: 'No candidate profile found' };

  const parsed = experienceSchema.safeParse({
    job_title: formData.get('job_title'),
    company_name: formData.get('company_name'),
    location: formData.get('location') || '',
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date') || '',
    is_current: formData.get('is_current') === 'true' ? 'true' : 'false',
    description: formData.get('description') || '',
    employment_type: formData.get('employment_type') || '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const { error } = await supabase
    .from('candidate_experiences')
    .update({
      job_title: parsed.data.job_title,
      company_name: parsed.data.company_name,
      location: parsed.data.location || null,
      start_date: parsed.data.start_date,
      end_date: parsed.data.is_current === 'true' ? null : (parsed.data.end_date || null),
      is_current: parsed.data.is_current === 'true',
      description: parsed.data.description || null,
      employment_type: parsed.data.employment_type || null,
    })
    .eq('id', experienceId)
    .eq('candidate_id', candidate.id);

  if (error) return { error: 'Failed to update experience. Please try again.' };
  return { success: true };
}

export async function deleteExperience(
  experienceId: string,
): Promise<{ error?: string; success?: boolean }> {
  if (!uuidSchema.safeParse(experienceId).success) return { error: 'Invalid ID' };

  const rateLimited = await rateLimit('profileUpdate');
  if (rateLimited) return { error: 'too_many_requests' };

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return { error: 'Not authenticated' };

  const candidate = await resolveCandidate(supabase, user.id);
  if (!candidate) return { error: 'No candidate profile found' };

  const { error } = await supabase
    .from('candidate_experiences')
    .delete()
    .eq('id', experienceId)
    .eq('candidate_id', candidate.id);

  if (error) return { error: 'Failed to delete experience. Please try again.' };
  return { success: true };
}
