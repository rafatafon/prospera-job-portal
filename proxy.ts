import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

/** Routes that require an authenticated user (checked after stripping locale prefix). */
const PROTECTED_PATHS = ['/dashboard', '/admin'];

function isProtectedRoute(pathname: string): boolean {
  // Strip the locale prefix (e.g. /es/dashboard -> /dashboard)
  const pathWithoutLocale = pathname.replace(
    /^\/(es|en)(\/|$)/,
    '/',
  );
  return PROTECTED_PATHS.some(
    (prefix) =>
      pathWithoutLocale === prefix ||
      pathWithoutLocale.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase auth tokens (must run on every request).
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Protect authenticated routes.
  if (isProtectedRoute(request.nextUrl.pathname) && !user) {
    // Determine the locale from the URL (default to 'es').
    const localeMatch = request.nextUrl.pathname.match(/^\/(es|en)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    return Response.redirect(loginUrl);
  }

  // 3. Delegate to next-intl for locale negotiation / prefix handling.
  const intlResponse = intlMiddleware(request);

  // 4. Merge Supabase cookies into the next-intl response so auth tokens
  //    reach the browser.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - common static file extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
