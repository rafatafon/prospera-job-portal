import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { ChevronDown } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
  userRole?: 'user' | 'company' | 'admin' | null;
  showLogin?: boolean;
}

export async function Header({ user, userRole, showLogin = true }: HeaderProps) {
  const dashboardHref = userRole === 'admin' ? '/admin' : '/dashboard';
  const t = await getTranslations('common');

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent py-3 px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between md:justify-center">
        {/* Center group: Logo icon + Glass pill */}
        <div className="flex items-center gap-4">
          {/* Logo icon — circular button */}
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 shadow-sm backdrop-blur-md transition-colors hover:opacity-90"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}
          >
            <Image
              src="/prospera-icon.svg"
              alt="Prospera"
              width={22}
              height={22}
              className="h-[22px] w-[22px]"
            />
          </Link>

          {/* Glass pill nav bar */}
          <nav
            className="hidden items-center gap-1 rounded-full border border-white/60 px-2 py-1.5 shadow-sm backdrop-blur-md md:flex"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}
            aria-label="Main navigation"
          >
            <Link
              href="/jobs"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/60 hover:text-slate-900"
            >
              {t('jobs')}
            </Link>

            {/* Business dropdown — CSS hover */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/60 hover:text-slate-900"
              >
                {t('business')}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:rotate-180" />
              </button>

              {/* Dropdown panel */}
              <div className="pointer-events-none absolute left-0 top-full z-50 w-64 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <a
                    href="https://www.prospera.co/en/business"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border-b border-slate-100 px-5 py-3.5 text-sm font-medium transition-colors hover:bg-slate-50"
                  >
                    {t('growYourBusiness')}
                  </a>
                  <a
                    href="https://www.prospera.co/en/marketplace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-5 py-3.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                  >
                    {t('companyDirectory')}
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Desktop CTA — orange pill, pinned right */}
        {(user || showLogin) && (
          <div className="absolute right-0 hidden md:flex">
            <Button
              asChild
              size="sm"
              style={{ backgroundColor: '#E8501C' }}
              className="rounded-full px-6 text-white hover:opacity-90"
            >
              <Link href={user ? dashboardHref : '/login'}>
                {user ? t('dashboard') : t('companyLogin')}
              </Link>
            </Button>
          </div>
        )}

        {/* Mobile right section — burger menu only (Company Login lives inside the menu) */}
        <div className="flex items-center md:hidden">
          <MobileMenu user={user} userRole={userRole} />
        </div>
      </div>
    </header>
  );
}
