import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { AdminMobileSidebarTrigger } from '@/components/layout/AdminMobileSidebarTrigger';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown } from 'lucide-react';

interface AdminTopBarProps {
  userEmail: string | null;
  locale: string;
}

export async function AdminTopBar({ userEmail, locale }: AdminTopBarProps) {
  const tCommon = await getTranslations('common');

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'A';

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Mobile sidebar trigger */}
      <div className="md:hidden">
        <AdminMobileSidebarTrigger />
      </div>

      {/* Spacer */}
      <div className="ml-3 flex-1 md:ml-0" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        <LocaleSwitcher />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100">
            <Avatar className="h-7 w-7">
              <AvatarFallback
                className="text-xs font-semibold text-white"
                style={{ backgroundColor: '#E8501C' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-sm font-medium sm:block">
              {userEmail}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={`/${locale}/auth/signout`} method="POST">
                <button
                  type="submit"
                  className="w-full cursor-pointer text-left text-sm text-red-600 hover:text-red-700"
                >
                  {tCommon('logout')}
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
