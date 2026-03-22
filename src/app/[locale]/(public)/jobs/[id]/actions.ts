'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rate-limit';
import { validateFileMagicBytes } from '@/lib/security/file-validation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const applicationSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(254),
  phone_country_code: z.string().min(1, 'Phone country code is required').max(5),
  phone_number: z.string().min(6, 'Phone number must be at least 6 characters').max(20),
  country: z.string().min(1, 'Country is required').max(5),
  job_id: z.string().uuid('Invalid job ID'),
  linkedin_url: z
    .string()
    .url('Invalid LinkedIn URL')
    .max(500)
    .optional()
    .or(z.literal('')),
});

async function validatePdfFile(
  file: FormDataEntryValue | null,
  fieldName: string,
  required: boolean,
): Promise<{ error?: string; file?: File }> {
  if (!file || !(file instanceof File) || file.size === 0) {
    if (required) return { error: `${fieldName} is required` };
    return {};
  }

  if (file.type !== 'application/pdf') {
    return { error: `${fieldName} must be a PDF file` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: `${fieldName} must be less than 5MB` };
  }

  // Verify actual file content matches PDF magic bytes
  const validBytes = await validateFileMagicBytes(file, 'pdf');
  if (!validBytes) {
    return { error: `${fieldName} does not appear to be a valid PDF file` };
  }

  return { file };
}

export async function submitApplication(
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const rateLimited = await rateLimit('application');
  if (rateLimited) return { error: rateLimited.error };
  // Normalize LinkedIn URL: prepend https:// if missing
  const linkedinRaw = formData.get('linkedin_url') as string;
  if (linkedinRaw && !linkedinRaw.startsWith('http')) {
    formData.set('linkedin_url', `https://${linkedinRaw}`);
  }

  // 1. Parse and validate text fields
  const parsed = applicationSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone_country_code: formData.get('phone_country_code'),
    phone_number: formData.get('phone_number'),
    country: formData.get('country'),
    job_id: formData.get('job_id'),
    linkedin_url: formData.get('linkedin_url') || '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  // 2. Validate resume file (required)
  const resumeResult = await validatePdfFile(formData.get('resume'), 'Resume', true);
  if (resumeResult.error) return { error: resumeResult.error };
  const resumeFile = resumeResult.file!;

  // 3. Validate cover letter file (optional)
  const coverLetterResult = await validatePdfFile(
    formData.get('cover_letter'),
    'Cover letter',
    false,
  );
  if (coverLetterResult.error) return { error: coverLetterResult.error };
  const coverLetterFile = coverLetterResult.file;

  // 4. Create Supabase client
  const supabase = await createClient();

  // 5. Verify the job exists and is published
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', parsed.data.job_id)
    .eq('status', 'published')
    .single();

  if (jobError || !job) {
    return { error: 'Job not found or is no longer accepting applications' };
  }

  // 6. Generate application ID
  const applicationId = crypto.randomUUID();
  const jobId = parsed.data.job_id;

  // 7. Upload resume
  const resumePath = `${jobId}/${applicationId}/resume.pdf`;
  const { error: resumeUploadError } = await supabase.storage
    .from('applications')
    .upload(resumePath, resumeFile, { contentType: 'application/pdf' });

  if (resumeUploadError) {
    return { error: 'Failed to upload resume. Please try again.' };
  }

  // 8. Upload cover letter if provided
  let coverLetterPath: string | null = null;
  if (coverLetterFile) {
    coverLetterPath = `${jobId}/${applicationId}/cover_letter.pdf`;
    const { error: coverLetterUploadError } = await supabase.storage
      .from('applications')
      .upload(coverLetterPath, coverLetterFile, {
        contentType: 'application/pdf',
      });

    if (coverLetterUploadError) {
      // Clean up the already-uploaded resume
      await supabase.storage.from('applications').remove([resumePath]);
      return { error: 'Failed to upload cover letter. Please try again.' };
    }
  }

  // 9. Insert application row
  const { error: insertError } = await supabase.from('applications').insert({
    id: applicationId,
    job_id: jobId,
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone_country_code: parsed.data.phone_country_code,
    phone_number: parsed.data.phone_number,
    country: parsed.data.country,
    linkedin_url: parsed.data.linkedin_url || null,
    resume_path: resumePath,
    cover_letter_path: coverLetterPath,
  });

  // 10. On failure after file upload: clean up uploaded files
  if (insertError) {
    const pathsToRemove = [resumePath];
    if (coverLetterPath) pathsToRemove.push(coverLetterPath);
    await supabase.storage.from('applications').remove(pathsToRemove);
    return { error: 'Failed to submit application. Please try again.' };
  }

  // 11. Return success
  return { success: true };
}
