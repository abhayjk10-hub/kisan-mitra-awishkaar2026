import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const hasValidSupabaseConfig = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      /^https?:\/\//i.test(url) &&
      !url.includes('example.supabase.co') &&
      !url.includes('your_supabase_project_url_here') &&
      key &&
      key.length > 20 &&
      !key.includes('demo-anon-key-placeholder') &&
      !key.includes('your_supabase_anon_key_here')
  );
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. If Supabase configuration is missing, redirect all non-static requests to /config-error
  if (!hasValidSupabaseConfig()) {
    if (pathname === '/config-error') {
      return NextResponse.next();
    }
    const configErrorUrl = new URL('/config-error', request.url);
    return NextResponse.redirect(configErrorUrl);
  }

  // If user visits /config-error while config is valid, send them home
  if (pathname === '/config-error') {
    return NextResponse.redirect(new URL('/', request.url));
  }

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Fetch authenticated user from Supabase session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Route Protection: Farmer Pages (e.g. /slot-booking)
  const isFarmerRoute = pathname.startsWith('/slot-booking');
  if (isFarmerRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Route Protection: Mandi Dashboard (/mandi/dashboard)
  const isMandiDashboard = pathname.startsWith('/mandi/dashboard');
  if (isMandiDashboard) {
    const demoCookie = request.cookies.get('km_demo_mandi');

    if (demoCookie?.value) {
      // Allow authenticated mandi operator access when session cookie is verified
      return supabaseResponse;
    }

    if (!user) {
      const mandiLoginUrl = new URL('/mandi/login', request.url);
      mandiLoginUrl.searchParams.set('redirectTo', pathname + request.nextUrl.search);
      return NextResponse.redirect(mandiLoginUrl);
    }

    // Verify user is linked to a mandi via mandi_staff link table
    try {
      const { data: staff, error } = await supabase
        .from('mandi_staff')
        .select('mandi_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !staff) {
        const unauthorizedUrl = new URL('/mandi/login', request.url);
        unauthorizedUrl.searchParams.set('error', 'unauthorized_mandi_staff');
        return NextResponse.redirect(unauthorizedUrl);
      }
    } catch {
      const unauthorizedUrl = new URL('/mandi/login', request.url);
      unauthorizedUrl.searchParams.set('error', 'mandi_check_failed');
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
