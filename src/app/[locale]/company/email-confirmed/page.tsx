import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default async function CompanyEmailConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('companyAuth');
  const tLanding = await getTranslations('landing');

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left — hero image panel */}
      <div className="relative hidden h-48 shrink-0 overflow-hidden sm:block sm:h-56 lg:h-auto lg:w-1/2">
        <Image
          src="/login-image/duna-tower.avif"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Image
                src="/prospera-logo/prospera-icon.svg"
                alt="Próspera"
                width={20}
                height={20}
                className="h-5 w-5 brightness-0 invert"
              />
            </div>
            <span className="text-sm font-semibold text-white">Próspera</span>
          </Link>
          <div className="hidden lg:block">
            <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
              {tLanding('heroTitle')}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              {tLanding('heroSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Right — white content panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 sm:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/prospera-logo/prospera-icon.svg"
                alt="Próspera"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-sm font-semibold text-slate-900">
                Próspera
              </span>
            </Link>
          </div>

          {/* Checkmark icon with animation */}
          <div className="mb-6 flex items-center justify-center">
            <div
              style={{
                animation: 'scaleIn 0.4s ease-out forwards',
              }}
            >
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            </div>
          </div>

          <style>{`
            @keyframes scaleIn {
              from { transform: scale(0.5); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            {t('emailConfirmedTitle')}
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            {t('emailConfirmedMessage')}
          </p>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#ff2c02' }}
            >
              {t('goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
