'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTranslations } from 'next-intl';
import type { User } from '@supabase/supabase-js';

interface MobileMenuProps {
  user: User | null;
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('common');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="text-slate-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left">
            <span className="flex items-center gap-2">
              <Image
                src="/prospera-icon.png"
                alt="Prospera"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="text-lg font-bold text-slate-900">
                Prospera
              </span>
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile navigation">
          <Link
            href="/jobs"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            {t('jobs')}
          </Link>
          <span className="cursor-not-allowed rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 select-none">
            {t('companies')}
          </span>
        </nav>
        <div className="mt-6 border-t border-slate-100 pt-6">
          {user ? (
            <Button
              asChild
              className="w-full rounded-full text-white"
              style={{ backgroundColor: '#E8501C' }}
              onClick={() => setOpen(false)}
            >
              <Link href="/dashboard">{t('dashboard')}</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="w-full rounded-full text-white"
              style={{ backgroundColor: '#E8501C' }}
              onClick={() => setOpen(false)}
            >
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
