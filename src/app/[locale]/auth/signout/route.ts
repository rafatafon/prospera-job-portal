import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const supabase = await createClient();

  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL(`/${locale}`, request.url));
  response.cookies.delete('session_started_at');
  return response;
}
