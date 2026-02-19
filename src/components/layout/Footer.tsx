import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function Footer() {
  const tCommon = await getTranslations('common');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="inline-flex items-center">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Prospera
                <span
                  className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: '#0057FF' }}
                  aria-hidden="true"
                />
              </span>
            </Link>
            <p className="mt-2 text-sm text-slate-500">
              Honduras
            </p>
          </div>

          {/* Nav links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Portal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/jobs"
                  className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                >
                  {tCommon('jobs')}
                </Link>
              </li>
              <li>
                <span className="cursor-not-allowed text-sm text-slate-400 select-none">
                  {tCommon('companies')}
                </span>
              </li>
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {tCommon('dashboard')}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                >
                  {tCommon('login')}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                >
                  {tCommon('dashboard')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <p className="text-center text-xs text-slate-400">
            &copy; {currentYear} Prospera. Honduras.
          </p>
        </div>
      </div>
    </footer>
  );
}
