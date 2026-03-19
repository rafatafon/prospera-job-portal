'use server';

import { createClient, getUser } from '@/lib/supabase/server';

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

  // Parse form fields
  const fullName = formData.get('full_name') as string;
  const headline = (formData.get('headline') as string) || null;
  const bio = (formData.get('bio') as string) || null;
  const location = (formData.get('location') as string) || null;
  const skillsRaw = formData.get('skills') as string;
  const skills = skillsRaw ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const yearsStr = formData.get('years_of_experience') as string;
  const yearsOfExperience = yearsStr ? parseInt(yearsStr, 10) : null;
  const availability = (formData.get('availability') as string) || 'actively_looking';
  const linkedinUrl = (formData.get('linkedin_url') as string) || null;
  const isVisible = formData.get('is_visible') === 'true';

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
    const ext = photoFile.type === 'image/png' ? 'png' : 'jpg';
    const path = `${user.id}/photo.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('candidate-photos')
      .upload(path, photoFile, { upsert: true });
    if (uploadErr) {
      return { error: `Photo upload failed: ${uploadErr.message}` };
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
    const path = `${user.id}/cv.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('candidate-cvs')
      .upload(path, cvFile, { upsert: true });
    if (uploadErr) {
      return { error: `CV upload failed: ${uploadErr.message}` };
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
    headline,
    bio,
    location,
    skills,
    years_of_experience: yearsOfExperience,
    availability: availability as 'actively_looking' | 'open_to_offers' | 'not_available',
    linkedin_url: linkedinUrl,
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
      return { error: updateErr.message };
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
      return { error: insertErr.message };
    }
  }

  return { success: true };
}
