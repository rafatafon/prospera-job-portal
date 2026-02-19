import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * Root page — redirects to the default locale.
 *
 * In practice, the proxy (middleware) handles locale redirection before this
 * page is reached. This exists as a safety fallback.
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
