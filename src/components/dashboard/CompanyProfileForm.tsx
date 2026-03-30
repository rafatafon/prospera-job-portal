'use client';

import { useState, useTransition, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateCompanyProfile } from '@/app/[locale]/(dashboard)/dashboard/company/actions';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  ImageIcon,
} from 'lucide-react';
import { toSlug } from '@/lib/utils';

interface CompanyProfileFormProps {
  locale: string;
  initialData: {
    id: string;
    name: string;
    slug: string;
    website: string | null;
    description: string | null;
    logo_url: string | null;
  };
}

export function CompanyProfileForm({
  locale,
  initialData,
}: CompanyProfileFormProps) {
  const t = useTranslations('companyProfile');

  const [name, setName] = useState(initialData.name);
  const [slug, setSlug] = useState(initialData.slug);
  // Start with auto-slug disabled since we're always editing an existing company
  const [autoSlug, setAutoSlug] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Logo state
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoFilename, setLogoFilename] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData.logo_url ?? null,
  );
  const [removeLogo, setRemoveLogo] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (autoSlug) {
      setSlug(toSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setAutoSlug(false);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFilename(file.name);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogo(false);
    }
  }

  function handleRemoveLogo() {
    setLogoFilename(null);
    setLogoPreview(null);
    setRemoveLogo(true);
    if (logoInputRef.current) logoInputRef.current.value = '';
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set('name', name);
    formData.set('slug', slug);
    if (removeLogo) {
      formData.set('remove_logo', 'true');
    }

    startTransition(async () => {
      const result = await updateCompanyProfile(
        locale,
        initialData.id,
        formData,
      );

      if (result && 'error' in result) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {t('title')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                {t('name')}
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t('namePlaceholder')}
                disabled={isPending}
                className="h-10 border-slate-200 bg-white focus-visible:ring-1"
                style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label
                htmlFor="slug"
                className="text-sm font-medium text-slate-700"
              >
                {t('slug')}
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder={t('slugPlaceholder')}
                disabled={isPending}
                className="h-10 border-slate-200 bg-white font-mono text-sm focus-visible:ring-1"
                style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
              />
              <p className="text-xs text-slate-400">{t('slugHint')}</p>
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <Label
                htmlFor="website"
                className="text-sm font-medium text-slate-700"
              >
                {t('website')}
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={initialData.website ?? ''}
                placeholder={t('websitePlaceholder')}
                disabled={isPending}
                className="h-10 border-slate-200 bg-white focus-visible:ring-1"
                style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-slate-700"
              >
                {t('description')}
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={initialData.description ?? ''}
                placeholder={t('descriptionPlaceholder')}
                disabled={isPending}
                rows={3}
                className="[field-sizing:fixed] border-slate-200 bg-white focus-visible:ring-1"
                style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
              />
            </div>

            {/* Logo upload */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                {t('logo')}
              </Label>

              <input
                ref={logoInputRef}
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                className="sr-only"
                onChange={handleLogoChange}
              />

              {logoPreview ? (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-12 w-12 rounded-lg border border-slate-100 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    {logoFilename ? (
                      <p className="truncate text-sm font-medium text-slate-700">
                        {logoFilename}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">Current logo</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => logoInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-left transition-colors hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ImageIcon className="h-5 w-5 shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    {t('uploadLogo')}
                  </span>
                </button>
              )}
              <p className="text-xs text-slate-400">{t('logoHint')}</p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-6 mb-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="mx-6 mb-4 flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{t('saved')}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4">
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
          </div>
        </form>
      </div>
    </div>
  );
}
