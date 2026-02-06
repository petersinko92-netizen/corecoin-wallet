import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Create an initial response
  // We need this to be a "let" because supabase might modify it to set cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Sync the request cookies so the current request sees them
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Sync the response cookies so the browser sees them
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 2. Refresh the Session (Wrapped in Try/Catch to prevent crashes)
  let user = null;
  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    if (error) throw error; // Throw to catch block if Supabase returns an error
    user = supabaseUser;
  } catch (e) {
    // 🛑 CRITICAL FIX: If the cookie is corrupted (Zombie Session),
    // we catch the error here instead of letting the server crash.
    // We simply treat the user as "Logged Out".
    // console.error("Middleware Auth Warning:", e); // Optional: Uncomment for debugging
    user = null;
  }

  // 3. Protect Dashboard Routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 4. Redirect Logged-In Users away from Auth Pages
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth routes - let Supabase handle these directly)
     * - api/diagnose (let our diagnostic tool run freely)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/diagnose).*)',
  ],
};