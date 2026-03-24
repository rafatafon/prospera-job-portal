'use client';

import { useState } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTranslations } from 'next-intl';
import type { User } from '@supabase/supabase-js';

interface MobileMenuProps {
  user: User | null;
  userRole?: 'user' | 'company' | 'admin' | null;
}

export function MobileMenu({ user, userRole }: MobileMenuProps) {
  const dashboardHref = userRole === 'admin' ? '/admin' : '/dashboard';
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const t = useTranslations('common');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 shadow-sm backdrop-blur-md transition-colors hover:opacity-90"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[85vw] flex-col sm:w-96"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        {/* Top bar — Close pill button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t('close')}
          </button>
        </div>

        {/* Nav links — right-aligned, large text */}
        <nav
          className="flex flex-col items-end gap-2 px-6 pt-4"
          aria-label="Mobile navigation"
        >
          <Link
            href="/jobs"
            onClick={() => setOpen(false)}
            className="text-2xl font-semibold text-slate-900 transition-colors hover:text-slate-600"
          >
            {t('jobs')}
          </Link>
          <Link
            href="/talent"
            onClick={() => setOpen(false)}
            className="text-2xl font-semibold text-slate-900 transition-colors hover:text-slate-600"
          >
            {t('openTalent')}
          </Link>
          <a
            href="https://www.prospera.co/en/business"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-semibold text-slate-900 transition-colors hover:text-slate-600"
          >
            {t('business')}
          </a>

          {/* Show more toggle */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="mt-2 flex items-center gap-1 text-lg font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            {t('showMore')}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`}
            />
          </button>

          {showMore && (
            <a
              href="https://www.prospera.co/en/marketplace"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="text-xl font-medium text-slate-700 transition-colors hover:text-slate-500"
            >
              {t('companyDirectory')}
            </a>
          )}
        </nav>

        {/* Bottom — Sign In / Dashboard */}
        <div className="mt-auto border-t border-slate-200 px-6 py-6">
          <div className="flex flex-col items-end gap-3">
            {user ? (
              userRole === 'user' ? (
                <Link
                  href="/candidate/profile"
                  onClick={() => setOpen(false)}
                  className="text-2xl font-semibold text-slate-900 transition-colors hover:text-slate-600"
                >
                  {t('myProfile')}
                </Link>
              ) : (
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="text-2xl font-semibold text-slate-900 transition-colors hover:text-slate-600"
                >
                  {t('dashboard')}
                </Link>
              )
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-2xl font-semibold text-slate-900 transition-colors hover:text-slate-600"
                >
                  {t('companyLogin')}
                </Link>
                <Link
                  href="/candidate/login"
                  onClick={() => setOpen(false)}
                  className="text-xl font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {t('candidateLogin')}
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
