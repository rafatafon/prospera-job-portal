import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? `/${locale}/dashboard`;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Recovery OTP: redirect to reset-password in the user's original locale
      if (type === 'recovery') {
        const savedLocale =
          request.cookies.get('reset_locale')?.value || locale;
        const response = NextResponse.redirect(
          new URL(`/${savedLocale}/reset-password`, request.url),
        );
        response.cookies.delete('reset_locale');
        return response;
      }
      // Email change verification: redirect to account settings with success flag
      if (type === 'email_change') {
        return NextResponse.redirect(
          new URL(
            `/${locale}/dashboard/account?emailChanged=true`,
            request.url,
          ),
        );
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Redirect to error page on failure
  return NextResponse.redirect(
    new URL(`/${locale}/login?error=confirmation_failed`, request.url),
  );
}
