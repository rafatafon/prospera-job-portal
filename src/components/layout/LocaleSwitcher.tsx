'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleSwitch() {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSwitch}
      className="h-8 gap-1.5 rounded-full border-slate-200 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
      aria-label={`Switch to ${locale === 'es' ? 'English' : 'Español'}`}
    >
      <Globe className="h-3.5 w-3.5" />
      {locale === 'es' ? 'English' : 'Español'}
    </Button>
  );
}
