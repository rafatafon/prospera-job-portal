import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { LoginForm } from '@/components/auth/LoginForm';

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin');
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

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Logo + tagline overlay */}
        <div className="absolute inset-0 flex flex-col items-center lg:items-start justify-between p-6 lg:p-10">
          {/* Top — logo */}
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

          {/* Bottom — tagline (lg only) */}
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

      {/* Right — dark form panel */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16"
        style={{
          background:
            'linear-gradient(135deg, #0A1628 0%, #0f2040 50%, #0A1628 100%)',
        }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo (visible when image is hidden on xs) */}
          <div className="mb-8 flex items-center justify-center gap-2.5 sm:hidden">
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

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {t('loginTitle')}
          </h1>
          <p className="mt-2 text-sm text-white/60">{t('loginSubtitle')}</p>

          {/* Form */}
          <div className="mt-8">
            <LoginForm variant="admin" dark />
          </div>
        </div>
      </div>
    </div>
  );
}
