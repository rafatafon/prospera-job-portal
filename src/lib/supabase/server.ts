import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies cannot be set. This can be safely ignored when the
            // middleware is correctly refreshing user sessions.
          }
        },
      },
    },
  );
}

/**
 * Safe wrapper around supabase.auth.getUser() that catches stale-session
 * errors (e.g. "Refresh Token Not Found") and returns null instead of throwing.
 */
export async function getUser(supabase: SupabaseClient<Database>) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    // Stale refresh token in cookies — treat as unauthenticated
    return null;
  }
}
