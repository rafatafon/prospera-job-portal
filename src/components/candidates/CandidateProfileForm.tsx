'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import parsePhoneNumber from 'libphonenumber-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { upsertCandidateProfile, deleteExperience } from '@/app/[locale]/candidate/profile/actions';
import { AlertCircle, AlertTriangle, CheckCircle, Loader2, Upload, Plus, Briefcase } from 'lucide-react';

import type { Database } from '@/types/database.types';
import { PhotoCropDialog } from '@/components/candidates/PhotoCropDialog';
import { SkillsAutocomplete } from '@/components/candidates/SkillsAutocomplete';
import { ExperienceForm } from '@/components/candidates/ExperienceForm';
import { ExperienceCard } from '@/components/candidates/ExperienceCard';
import { createBrowserClient } from '@supabase/ssr';

type CandidateRow = Database['public']['Tables']['candidates']['Row'];
type ExperienceRow = Database['public']['Tables']['candidate_experiences']['Row'];

interface CandidateProfileFormProps {
  candidate: CandidateRow | null;
  experiences?: ExperienceRow[];
}

export function CandidateProfileForm({ candidate, experiences: initialExperiences = [] }: CandidateProfileFormProps) {
  const t = useTranslations('candidateProfile');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [skills, setSkills] = useState<string[]>(candidate?.skills ?? []);
  const [photoPreview, setPhotoPreview] = useState<string | null>(candidate?.photo_url ?? null);
  const [isVisible, setIsVisible] = useState(candidate?.is_visible ?? true);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [phone, setPhone] = useState(() => {
    if (candidate?.phone_country_code && candidate?.phone_number) {
      return `${candidate.phone_country_code}${candidate.phone_number}`;
    }
    return '';
  });
  const [experiences, setExperiences] = useState<ExperienceRow[]>(initialExperiences);
  const [expFormOpen, setExpFormOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceRow | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  async function refreshExperiences() {
    if (!candidate) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase
      .from('candidate_experiences')
      .select('*')
      .eq('candidate_id', candidate.id)
      .order('start_date', { ascending: false });
    if (data) setExperiences(data);
  }

  async function handleDeleteExperience(experienceId: string) {
    if (!confirm(t('deleteExperienceConfirm'))) return;
    const result = await deleteExperience(experienceId);
    if (!result.error) {
      await refreshExperiences();
    }
  }

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleCropConfirm(file: File) {
    setCroppedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setCropDialogOpen(false);
    setIsDirty(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    formData.set('skills', skills.join(','));
    formData.set('is_visible', isVisible ? 'true' : 'false');
    if (croppedFile) {
      formData.set('photo', croppedFile);
    }

    // Parse phone into country code + national number
    if (phone) {
      const parsed = parsePhoneNumber(phone);
      if (parsed) {
        formData.set('phone_country_code', `+${parsed.countryCallingCode}`);
        formData.set('phone_number', parsed.nationalNumber);
      } else {
        formData.set('phone_country_code', '+');
        formData.set('phone_number', phone.replace(/^\+/, ''));
      }
    }

    startTransition(async () => {
      const result = await upsertCandidateProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setIsDirty(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  const inputClasses = 'h-10 rounded-lg border-slate-200 bg-white focus-visible:ring-1';
  const ringStyle = { '--tw-ring-color': '#ff2c02' } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} onInput={() => setIsDirty(true)} className="space-y-6 px-6 py-6">
      {/* Unsaved changes banner */}
      {isDirty && (
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{t('unsavedChanges')}</span>
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            {t('save')}
          </Button>
        </div>
      )}

      {/* Photo */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t('photo')}</Label>
        <div className="flex items-center gap-4">
          {photoPreview ? (
            <button
              type="button"
              onClick={() => {
                if (rawImageSrc) setCropDialogOpen(true);
              }}
              className={rawImageSrc ? 'cursor-pointer' : ''}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            </button>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Upload className="h-6 w-6" />
            </div>
          )}
          <div>
            <Input
              name="photo"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhotoChange}
              className="h-auto border-0 p-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              disabled={isPending}
            />
            <p className="mt-1 text-xs text-slate-400">{t('photoHint')}</p>
          </div>
        </div>
        {rawImageSrc && (
          <PhotoCropDialog
            open={cropDialogOpen}
            onOpenChange={setCropDialogOpen}
            imageSrc={rawImageSrc}
            onCropComplete={handleCropConfirm}
          />
        )}
      </div>

      {/* Full name */}
      <div className="space-y-1.5">
        <Label htmlFor="full_name" className="text-sm font-medium text-slate-700">
          {t('fullName')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={candidate?.full_name ?? ''}
          className={inputClasses}
          style={ringStyle}
          disabled={isPending}
        />
      </div>

      {/* Headline */}
      <div className="space-y-1.5">
        <Label htmlFor="headline" className="text-sm font-medium text-slate-700">
          {t('headline')}
        </Label>
        <Input
          id="headline"
          name="headline"
          type="text"
          defaultValue={candidate?.headline ?? ''}
          placeholder={t('headlinePlaceholder')}
          className={inputClasses}
          style={ringStyle}
          disabled={isPending}
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-sm font-medium text-slate-700">
          {t('bio')}
        </Label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={candidate?.bio ?? ''}
          placeholder={t('bioPlaceholder')}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1"
          style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
          disabled={isPending}
        />
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label htmlFor="location" className="text-sm font-medium text-slate-700">
          {t('location')}
        </Label>
        <Input
          id="location"
          name="location"
          type="text"
          defaultValue={candidate?.location ?? ''}
          placeholder={t('locationPlaceholder')}
          className={inputClasses}
          style={ringStyle}
          disabled={isPending}
        />
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">{t('skills')}</Label>
        <SkillsAutocomplete
          skills={skills}
          onSkillsChange={(newSkills) => { setSkills(newSkills); setIsDirty(true); }}
          disabled={isPending}
        />
      </div>

      {/* Experience */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-700">{t('experience')}</Label>
          {experiences.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => { setEditingExp(undefined); setExpFormOpen(true); }}
              disabled={isPending}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('addExperience')}
            </Button>
          )}
        </div>

        {experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-center">
            <Briefcase className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">{t('noExperience')}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5 text-xs"
              onClick={() => { setEditingExp(undefined); setExpFormOpen(true); }}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('addExperience')}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                locale={locale}
                showActions
                onEdit={() => { setEditingExp(exp); setExpFormOpen(true); }}
                onDelete={() => handleDeleteExperience(exp.id)}
              />
            ))}
          </div>
        )}

        <ExperienceForm
          open={expFormOpen}
          onOpenChange={setExpFormOpen}
          experience={editingExp}
          onSaved={refreshExperiences}
        />
      </div>

      {/* Availability */}
      <div className="space-y-1.5">
        <Label htmlFor="availability" className="text-sm font-medium text-slate-700">
          {t('availability')}
        </Label>
        <select
          id="availability"
          name="availability"
          defaultValue={candidate?.availability ?? 'actively_looking'}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
          style={ringStyle}
          disabled={isPending}
        >
          <option value="actively_looking">{t('activelyLooking')}</option>
          <option value="open_to_offers">{t('openToOffers')}</option>
          <option value="not_available">{t('notAvailable')}</option>
        </select>
      </div>

      {/* LinkedIn */}
      <div className="space-y-1.5">
        <Label htmlFor="linkedin_url" className="text-sm font-medium text-slate-700">
          {t('linkedin')}
        </Label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            https://
          </span>
          <Input
            id="linkedin_url"
            name="linkedin_url"
            type="text"
            defaultValue={candidate?.linkedin_url?.replace('https://', '') ?? ''}
            placeholder={t('linkedinPlaceholder')}
            className="rounded-l-none h-10 border-slate-200 bg-white focus-visible:ring-1"
            style={ringStyle}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Contact Email */}
      <div className="space-y-1.5">
        <Label htmlFor="contact_email" className="text-sm font-medium text-slate-700">
          {t('contactEmail')}
        </Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          defaultValue={candidate?.contact_email ?? ''}
          placeholder={t('contactEmailPlaceholder')}
          className={inputClasses}
          style={ringStyle}
          disabled={isPending}
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">
          {t('phoneNumber')}
        </Label>
        <PhoneInput
          defaultCountry="HN"
          locale={locale}
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setIsDirty(true); }}
          disabled={isPending}
        />
      </div>

      {/* CV */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">{t('cv')}</Label>
        {candidate?.cv_path && (
          <p className="text-xs text-green-600">CV uploaded</p>
        )}
        <Input
          name="cv"
          type="file"
          accept="application/pdf"
          className="h-auto border-slate-200 p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          disabled={isPending}
        />
        <p className="text-xs text-slate-400">{t('cvHint')}</p>
      </div>

      {/* Visibility toggle */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700">{t('isVisible')}</p>
          <p className="text-xs text-slate-400">{t('isVisibleHint')}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isVisible}
          onClick={() => { setIsVisible(!isVisible); setIsDirty(true); }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            isVisible ? 'bg-green-500' : 'bg-slate-200'
          }`}
          disabled={isPending}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
              isVisible ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{t('saved')}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full gap-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#ff2c02' }}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('saving')}
          </>
        ) : (
          t('save')
        )}
      </Button>
    </form>
  );
}
