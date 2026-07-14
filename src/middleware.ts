import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Protect ticket route - must be signed in
  if (path === '/ticket') {
    if (!user) {
      return NextResponse.redirect(new URL('/register', request.url));
    }
  }

  // Protect admin & auth/scanner routes - must be staff or admin
  if (path.startsWith('/admin') || path.startsWith('/authentication')) {
    if (!user) {
      return NextResponse.redirect(new URL('/register', request.url));
    }

    try {
      // Initialize server client inside middleware to query user role
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {
              // Read-only cookies access inside check is fine
            },
          },
        }
      );

      // Fetch user profile role from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
        // Not a staff or admin, redirect to homepage
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Middleware check error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
