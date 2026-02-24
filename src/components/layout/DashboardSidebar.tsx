'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Briefcase, PlusCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'title',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    labelKey: 'managejobs',
    href: '/dashboard/jobs',
    icon: Briefcase,
  },
  {
    labelKey: 'applications',
    href: '/dashboard/applications',
    icon: FileText,
  },
  {
    labelKey: 'newjob',
    href: '/dashboard/jobs/new',
    icon: PlusCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const tDashboard = useTranslations('dashboard');
  const tDashboardJobs = useTranslations('dashboardJobs');
  const tApplications = useTranslations('dashboardApplications');

  function getLabel(key: string) {
    if (key === 'title') return tDashboard('title');
    if (key === 'managejobs') return tDashboardJobs('title');
    if (key === 'applications') return tApplications('title');
    if (key === 'newjob') return tDashboardJobs('newJob');
    return key;
  }

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
            src="/prospera-icon.svg"
            alt="Prospera"
            width={20}
            height={20}
            className="h-5 w-5 brightness-0 invert"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            Prospera
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-1 px-3 py-4"
        aria-label="Dashboard navigation"
      >
        {NAV_ITEMS.map((item) => {
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
              {getLabel(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom divider */}
      <div className="border-t border-white/10 p-4">
        <p className="text-center text-xs text-white/30">Prospera</p>
      </div>
    </aside>
  );
}
