import { getTranslations, setRequestLocale } from 'next-intl/server';
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
          'linear-gradient(135deg, #f0f5ff 0%, #ffffff 60%, #f8faff 100%)',
      }}
    >
      {/* Decorative blob */}
      <div
        className="pointer-events-none fixed -right-48 -top-48 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: '#0057FF' }}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Prospera
            <span
              className="ml-0.5 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: '#0057FF' }}
              aria-hidden="true"
            />
          </span>
          <p className="mt-2 text-sm text-slate-500">{t('title')}</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
