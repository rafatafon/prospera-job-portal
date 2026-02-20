import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/LoginForm';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('login');

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background:
          'linear-gradient(135deg, #FFF8F5 0%, #ffffff 60%, #FFFBF8 100%)',
      }}
    >
      {/* Decorative blob */}
      <div
        className="pointer-events-none fixed -right-48 -top-48 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: '#E8501C' }}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/prospera-icon.svg"
            alt="Prospera"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {t('title')}
          </span>
          <p className="mt-1.5 text-sm text-slate-500">{t('subtitle')}</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
