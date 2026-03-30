import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default async function EmailConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('candidateAuth');
  const tLanding = await getTranslations('landing');

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left — hero image panel */}
      <div className="relative hidden h-48 shrink-0 overflow-hidden sm:block sm:h-56 lg:h-auto lg:w-1/2">
        <Image
          src="/open-application-login/bitcoin-center-1.avif"
          alt=""
          fill
          priority
          className="object-cover object-center"
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

      {/* Right — dark content panel */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16"
        style={{
          background:
            'linear-gradient(135deg, #0A2818 0%, #0f3520 50%, #0A2818 100%)',
        }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 sm:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/prospera-logo/prospera-icon.svg"
                alt="Próspera"
                width={28}
                height={28}
                className="h-7 w-7 brightness-0 invert"
              />
              <span className="text-sm font-semibold text-white">
                Próspera
              </span>
            </Link>
          </div>

          {/* Checkmark icon with scale-in animation */}
          <div className="mb-6 flex items-center justify-center">
            <div
              style={{
                animation: 'scaleIn 0.4s ease-out forwards',
              }}
            >
              <CheckCircle2 className="h-16 w-16 text-emerald-400" />
            </div>
          </div>

          <style>{`
            @keyframes scaleIn {
              from { transform: scale(0.5); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold tracking-tight text-white">
            {t('emailConfirmedTitle')}
          </h1>
          <p className="mt-2 text-center text-sm text-white/60">
            {t('emailConfirmedMessage')}
          </p>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="/candidate/login"
              className="flex w-full items-center justify-center rounded-md bg-[#ff2c02] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#e02700]"
            >
              {t('goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
