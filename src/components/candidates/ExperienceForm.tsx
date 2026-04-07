'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { addExperience, updateExperience } from '@/app/[locale]/candidate/profile/actions';

interface ExperienceData {
  id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean | null;
  description: string | null;
  employment_type: string | null;
}

interface ExperienceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience?: ExperienceData;
  onSaved: () => void;
}

function parseDateParts(dateStr: string | null | undefined): { month: string; year: string } {
  if (!dateStr) return { month: '', year: '' };
  const d = new Date(dateStr + 'T00:00:00');
  return {
    month: String(d.getMonth() + 1),
    year: String(d.getFullYear()),
  };
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function ExperienceForm({ open, onOpenChange, experience, onSaved }: ExperienceFormProps) {
  const t = useTranslations('candidateProfile');
  const tCommon = useTranslations('common');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isCurrent, setIsCurrent] = useState(experience?.is_current ?? false);

  const startParts = parseDateParts(experience?.start_date);
  const endParts = parseDateParts(experience?.end_date);

  const [startMonth, setStartMonth] = useState(startParts.month);
  const [startYear, setStartYear] = useState(startParts.year);
  const [endMonth, setEndMonth] = useState(endParts.month);
  const [endYear, setEndYear] = useState(endParts.year);

  const inputClasses = 'h-10 rounded-lg border-slate-200 bg-white focus-visible:ring-1';
  const ringStyle = { '--tw-ring-color': '#ff2c02' } as React.CSSProperties;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Build date strings
    if (startMonth && startYear) {
      formData.set('start_date', `${startYear}-${startMonth.padStart(2, '0')}-01`);
    }
    if (!isCurrent && endMonth && endYear) {
      formData.set('end_date', `${endYear}-${endMonth.padStart(2, '0')}-01`);
    } else {
      formData.set('end_date', '');
    }
    formData.set('is_current', isCurrent ? 'true' : 'false');

    startTransition(async () => {
      const result = experience
        ? await updateExperience(experience.id, formData)
        : await addExperience(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {experience ? t('editExperience') : t('addExperience')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job title */}
          <div className="space-y-1.5">
            <Label htmlFor="exp_job_title" className="text-sm font-medium text-slate-700">
              {t('jobTitle')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="exp_job_title"
              name="job_title"
              required
              defaultValue={experience?.job_title ?? ''}
              className={inputClasses}
              style={ringStyle}
              disabled={isPending}
            />
          </div>

          {/* Company name */}
          <div className="space-y-1.5">
            <Label htmlFor="exp_company" className="text-sm font-medium text-slate-700">
              {t('companyName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="exp_company"
              name="company_name"
              required
              defaultValue={experience?.company_name ?? ''}
              className={inputClasses}
              style={ringStyle}
              disabled={isPending}
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="exp_location" className="text-sm font-medium text-slate-700">
              {t('expLocation')}
            </Label>
            <Input
              id="exp_location"
              name="location"
              defaultValue={experience?.location ?? ''}
              className={inputClasses}
              style={ringStyle}
              disabled={isPending}
            />
          </div>

          {/* Employment type */}
          <div className="space-y-1.5">
            <Label htmlFor="exp_type" className="text-sm font-medium text-slate-700">
              {t('employmentType')}
            </Label>
            <select
              id="exp_type"
              name="employment_type"
              defaultValue={experience?.employment_type ?? ''}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
              style={ringStyle}
              disabled={isPending}
            >
              <option value="">—</option>
              <option value="full_time">{t('expFullTime')}</option>
              <option value="part_time">{t('expPartTime')}</option>
              <option value="contract">{t('expContract')}</option>
            </select>
          </div>

          {/* Start date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              {t('startDate')} <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                required
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                style={ringStyle}
                disabled={isPending}
              >
                <option value="">{t('startDate')}</option>
                {MONTHS.map((m) => (
                  <option key={m} value={String(m)}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                required
                className="h-10 w-28 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                style={ringStyle}
                disabled={isPending}
              >
                <option value="">{t('startDate')}</option>
                {YEARS.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current job toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => {
                setIsCurrent(e.target.checked);
                if (e.target.checked) {
                  setEndMonth('');
                  setEndYear('');
                }
              }}
              className="h-4 w-4 rounded border-slate-300"
              disabled={isPending}
            />
            {t('currentJob')}
          </label>

          {/* End date */}
          {!isCurrent && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                {t('endDate')}
              </Label>
              <div className="flex gap-2">
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                  style={ringStyle}
                  disabled={isPending}
                >
                  <option value="">{t('endDate')}</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={String(m)}>
                      {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="h-10 w-28 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                  style={ringStyle}
                  disabled={isPending}
                >
                  <option value="">{t('endDate')}</option>
                  {YEARS.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="exp_description" className="text-sm font-medium text-slate-700">
              {t('duties')}
            </Label>
            <textarea
              id="exp_description"
              name="description"
              rows={4}
              defaultValue={experience?.description ?? ''}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1"
              style={ringStyle}
              disabled={isPending}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 text-white hover:opacity-90"
              style={{ backgroundColor: '#ff2c02' }}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('saveExperience')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
