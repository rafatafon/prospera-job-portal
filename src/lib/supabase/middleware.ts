import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request so that downstream handlers see them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // Recreate the response to include the updated request cookies.
          supabaseResponse = NextResponse.next({ request });

          // Mirror cookies onto the response so they are sent to the browser.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session. This call is critical -- it ensures the auth token
  // is valid and refreshes it when needed. Do not remove this line.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check absolute session timeout (24h)
  const sessionStarted = request.cookies.get('session_started_at')?.value;
  let sessionExpired = false;
  if (user && sessionStarted) {
    const elapsed = Date.now() - parseInt(sessionStarted, 10);
    if (elapsed > 24 * 60 * 60 * 1000) {
      sessionExpired = true;
    }
  }

  return { supabaseResponse, user: sessionExpired ? null : user, sessionExpired };
}
