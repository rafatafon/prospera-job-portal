import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/LoginForm';

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin');

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background:
          'linear-gradient(135deg, #0A1628 0%, #0f2040 50%, #0A1628 100%)',
      }}
    >
      {/* Decorative orange blob — subtle on dark */}
      <div
        className="pointer-events-none fixed -right-48 -top-48 h-[600px] w-[600px] rounded-full opacity-5 blur-3xl"
        style={{ backgroundColor: '#E8501C' }}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 px-8 py-10 shadow-2xl backdrop-blur-sm">
        {/* Logo header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <Image
              src="/prospera-icon.svg"
              alt="Prospera"
              width={28}
              height={28}
              className="h-7 w-7 brightness-0 invert"
            />
          </div>
          <span className="mt-3 text-2xl font-bold tracking-tight text-white">
            {t('loginTitle')}
          </span>
          <p className="mt-1.5 text-sm text-white/60">{t('loginSubtitle')}</p>
        </div>

        <LoginForm variant="admin" />
      </div>
    </div>
  );
}
