'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createJob } from '@/app/[locale]/(dashboard)/dashboard/jobs/actions';
import { AlertCircle, Loader2 } from 'lucide-react';

export function JobForm() {
  const t = useTranslations('jobForm');
  const tJobs = useTranslations('jobs');
  const locale = useLocale();

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Track selected values for the hidden input pattern with Select
  const [employmentType, setEmploymentType] = useState<string>('full_time');
  const [workMode, setWorkMode] = useState<string>('on_site');
  const [description, setDescription] = useState<string>('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    // Inject employment type from controlled state since shadcn Select doesn't
    // natively submit as a form field
    formData.set('employment_type', employmentType);
    formData.set('work_mode', workMode);
    formData.set('description', description);

    startTransition(async () => {
      const result = await createJob(locale, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('saveDraft')} &mdash; {t('saveDraftHelper')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-6 p-6">
            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-slate-700"
              >
                {t('titleField')}
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                minLength={3}
                placeholder={t('titlePlaceholder')}
                disabled={isPending}
                className="h-10 border-slate-200 bg-white focus-visible:ring-1"
                style={
                  { '--tw-ring-color': '#E8501C' } as React.CSSProperties
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                {t('descriptionField')}
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </Label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder={t('descriptionPlaceholder')}
                disabled={isPending}
              />
            </div>

            {/* Location + Work Mode + Employment Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
              <div className="space-y-1.5">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-slate-700"
                >
                  {t('locationField')}
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder={t('locationPlaceholder')}
                  disabled={isPending}
                  className="h-10 border-slate-200 bg-white focus-visible:ring-1"
                  style={
                    { '--tw-ring-color': '#E8501C' } as React.CSSProperties
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="work_mode"
                  className="text-sm font-medium text-slate-700"
                >
                  {t('workMode')}
                  <span className="ml-1 text-red-500" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Select
                  value={workMode}
                  onValueChange={setWorkMode}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="work_mode"
                    className="h-10 border-slate-200 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_site">
                      {tJobs('onSite')}
                    </SelectItem>
                    <SelectItem value="remote">
                      {tJobs('remote')}
                    </SelectItem>
                    <SelectItem value="hybrid">
                      {tJobs('hybrid')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="employment_type"
                  className="text-sm font-medium text-slate-700"
                >
                  {t('employmentType')}
                  <span className="ml-1 text-red-500" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Select
                  value={employmentType}
                  onValueChange={setEmploymentType}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="employment_type"
                    className="h-10 border-slate-200 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">
                      {tJobs('fullTime')}
                    </SelectItem>
                    <SelectItem value="part_time">
                      {tJobs('partTime')}
                    </SelectItem>
                    <SelectItem value="contract">
                      {tJobs('contract')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          {/* Error banner */}
          {error && (
            <div className="border-t border-red-100 bg-red-50 px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#E8501C' }}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('creating')}
                </>
              ) : (
                t('saveDraft')
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
