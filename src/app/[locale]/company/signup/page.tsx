import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { CompanySignupForm } from '@/components/auth/CompanySignupForm';

export default async function CompanySignupPage({
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
      {/* Left — hero image panel (same structure as candidate signup) */}
      <div className="relative hidden h-48 shrink-0 overflow-hidden sm:block sm:h-56 lg:h-auto lg:w-1/2">
        <Image
          src="/login-image/duna-tower.avif"
          alt=""
          fill
          priority
          className="object-cover"
        />

        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex flex-col items-center lg:items-start justify-between p-6 lg:p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Image
                src="/prospera-logo/prospera-icon.svg"
                alt="Prospera"
                width={20}
                height={20}
                className="h-5 w-5 brightness-0 invert"
              />
            </div>
            <span className="text-sm font-semibold text-white">Prospera</span>
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

      {/* Right — form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2.5 sm:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/prospera-logo/prospera-icon.svg"
                alt="Prospera"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-sm font-semibold text-slate-900">
                Prospera
              </span>
            </Link>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('signupTitle')}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t('signupSubtitle')}</p>

          {/* Form */}
          <div className="mt-8">
            <CompanySignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
