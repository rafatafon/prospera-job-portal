import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

/** Company dashboard routes — require authenticated company/admin user. */
const COMPANY_PATHS = ['/dashboard'];

/** Admin routes — require authenticated admin user. */
const ADMIN_PATHS = ['/admin'];

/** Admin sub-paths that are publicly accessible (no auth required). */
const ADMIN_PUBLIC_PATHS = ['/admin/login'];

/**
 * Extract the path without the locale prefix.
 * e.g. /es/dashboard -> /dashboard, /en/admin/login -> /admin/login
 */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(es|en)(\/|$)/, '/');
}

/** Extract the locale from the URL path, falling back to the default locale. */
function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/(es|en)(\/|$)/);
  return match ? match[1] : routing.defaultLocale;
}

function matchesAny(path: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function isCompanyRoute(pathname: string): boolean {
  const path = stripLocale(pathname);
  return matchesAny(path, COMPANY_PATHS);
}

function isAdminRoute(pathname: string): boolean {
  const path = stripLocale(pathname);
  // Exclude admin public paths (e.g. /admin/login) from protection
  if (matchesAny(path, ADMIN_PUBLIC_PATHS)) {
    return false;
  }
  return matchesAny(path, ADMIN_PATHS);
}

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase auth tokens (must run on every request).
  const { supabaseResponse, user, sessionExpired } =
    await updateSession(request);

  // Handle absolute session timeout (24h)
  if (sessionExpired) {
    const locale = extractLocale(request.nextUrl.pathname);
    const path = stripLocale(request.nextUrl.pathname);
    const loginUrl = request.nextUrl.clone();

    if (matchesAny(path, ADMIN_PATHS)) {
      loginUrl.pathname = `/${locale}/admin/login`;
    } else if (path.startsWith('/candidate')) {
      loginUrl.pathname = `/${locale}/candidate/login`;
    } else {
      loginUrl.pathname = `/${locale}/login`;
    }
    loginUrl.searchParams.set('reason', 'session_expired');

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session_started_at');
    return response;
  }

  // 2. Protect company dashboard routes — redirect to company login.
  if (isCompanyRoute(request.nextUrl.pathname) && !user) {
    const locale = extractLocale(request.nextUrl.pathname);
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    return Response.redirect(loginUrl);
  }

  // 3. Protect admin routes — redirect to admin login.
  if (isAdminRoute(request.nextUrl.pathname) && !user) {
    const locale = extractLocale(request.nextUrl.pathname);
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/admin/login`;
    return Response.redirect(loginUrl);
  }

  // 4. Delegate to next-intl for locale negotiation / prefix handling.
  const intlResponse = intlMiddleware(request);

  // 5. Merge Supabase cookies into the next-intl response so auth tokens
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
