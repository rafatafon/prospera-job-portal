'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'sidebarProfile',
    href: '/candidate/profile',
    icon: User,
    exact: true,
  },
  {
    labelKey: 'sidebarRegisterCompany',
    href: '/candidate/register-company',
    icon: Building2,
    exact: true,
  },
];

interface CandidateSidebarProps {
  role?: string;
}

export function CandidateSidebar({ role }: CandidateSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('candidateProfile');

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside
      className="flex h-full w-full flex-col"
      style={{ backgroundColor: '#0A1628' }}
    >
      {/* Logo area */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/prospera-logo/prospera-icon.svg"
            alt="Próspera"
            width={20}
            height={20}
            className="h-5 w-5 brightness-0 invert"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            Próspera
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-1 px-3 py-4"
        aria-label={t('sidebarTitle')}
      >
        {NAV_ITEMS.filter((item) => {
          // Hide "Register Company" for users who are already company/admin
          if (item.href === '/candidate/register-company' && role && role !== 'user') {
            return false;
          }
          return true;
        }).map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-white' : 'text-white/50',
                )}
              />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom divider */}
      <div className="border-t border-white/10 p-4">
        <p className="text-center text-xs text-white/30">Próspera</p>
      </div>
    </aside>
  );
}
