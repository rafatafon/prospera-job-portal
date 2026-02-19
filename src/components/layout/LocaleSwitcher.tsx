'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

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
      variant="ghost"
      size="sm"
      onClick={handleSwitch}
      className="h-8 px-2.5 text-xs font-semibold tracking-widest text-slate-500 hover:text-slate-900"
      aria-label={`Switch to ${locale === 'es' ? 'English' : 'Español'}`}
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </Button>
  );
}
