'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createUser } from '@/app/[locale]/(admin)/admin/access/actions';

interface CreateUserFormProps {
  companies: { id: string; name: string }[];
}

export function CreateUserForm({ companies }: CreateUserFormProps) {
  const t = useTranslations('adminAccess');
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createUser(formData);
      if ('error' in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1200);
      }
    });
  }

  function handleOpenChange(next: boolean) {
    if (!isPending) {
      setOpen(next);
      if (!next) {
        setError(null);
        setSuccess(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#E8501C' }}
        >
          <Plus className="h-4 w-4" />
          {t('createUser')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('createUserTitle')}</DialogTitle>
          <DialogDescription>{t('createUserDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {t('userCreated')}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="create-email">{t('email')}</Label>
            <Input
              id="create-email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              required
              disabled={isPending}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="create-password">{t('password')}</Label>
            <Input
              id="create-password"
              name="password"
              type="password"
              minLength={8}
              required
              disabled={isPending}
            />
            <p className="text-xs text-slate-500">{t('passwordHint')}</p>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="create-role">{t('role')}</Label>
            <select
              id="create-role"
              name="role"
              defaultValue="user"
              disabled={isPending}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-[#E8501C] focus:outline-none focus:ring-2 focus:ring-[#E8501C]/20"
            >
              <option value="user">{t('roleUser')}</option>
              <option value="company">{t('roleCompany')}</option>
              <option value="admin">{t('roleAdmin')}</option>
            </select>
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <Label htmlFor="create-company">{t('company')}</Label>
            <select
              id="create-company"
              name="company_id"
              defaultValue=""
              disabled={isPending}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-[#E8501C] focus:outline-none focus:ring-2 focus:ring-[#E8501C]/20"
            >
              <option value="">{t('noCompany')}</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || success}
              className="w-full text-white sm:w-auto"
              style={{ backgroundColor: '#E8501C' }}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  {t('creating')}
                </>
              ) : (
                t('createUser')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
