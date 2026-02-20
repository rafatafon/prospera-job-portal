import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { MobileMenu } from '@/components/layout/MobileMenu';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
}

export async function Header({ user }: HeaderProps) {
  const t = await getTranslations('common');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/prospera-icon.png"
            alt="Prospera"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Prospera
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link
            href="/jobs"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            {t('jobs')}
          </Link>
          <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-slate-400 select-none">
            {t('companies')}
          </span>
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          {user ? (
            <Button
              asChild
              size="sm"
              style={{ backgroundColor: '#E8501C' }}
              className="rounded-full text-white hover:opacity-90"
            >
              <Link href="/dashboard">{t('dashboard')}</Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              style={{ backgroundColor: '#E8501C' }}
              className="rounded-full text-white hover:opacity-90"
            >
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <MobileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
