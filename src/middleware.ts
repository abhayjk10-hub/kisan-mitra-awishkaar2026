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

  // 3. Detect active role sessions
  const hasMandiSession = Boolean(request.cookies.get('km_demo_mandi')?.value);
  const hasGovtSession = Boolean(request.cookies.get('km_govt_session')?.value);
  const hasFarmerSession = Boolean(user);

  // Skip route gating for API endpoints and public auth/registration pages
  const isApiRoute = pathname.startsWith('/api');
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/mandi/login') ||
    pathname.startsWith('/mandi/register') ||
    pathname.startsWith('/government/register') ||
    pathname.startsWith('/officers/login');

  if (isApiRoute || isAuthRoute) {
    return supabaseResponse;
  }

  // Farmer specific operational and agricultural services pages
  const isFarmerSpecificPage =
    pathname.startsWith('/slot-booking') ||
    pathname.startsWith('/mandi-prices') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/cold-storage') ||
    pathname.startsWith('/crop-care') ||
    pathname.startsWith('/machinery-rental') ||
    pathname.startsWith('/schemes') ||
    pathname.startsWith('/vehicle-booking');

  // Agricultural services catalog and tools (require authenticated session)
  const isServicesPage =
    pathname === '/services' ||
    pathname.startsWith('/services/') ||
    pathname.startsWith('/procurement') ||
    pathname.startsWith('/cold-storage') ||
    pathname.startsWith('/crop-care') ||
    pathname.startsWith('/machinery-rental') ||
    pathname.startsWith('/schemes') ||
    pathname.startsWith('/vehicle-booking');

  // 4. Role Gating: MANDI OPERATOR BOUNDARIES
  // Mandi operators can only access: Home (/), Mandi Dashboard (/mandi/dashboard), Contact (/contact)
  if (hasMandiSession) {
    if (pathname.startsWith('/government/dashboard')) {
      return NextResponse.redirect(new URL('/mandi/dashboard', request.url));
    }
    if (isFarmerSpecificPage || pathname.startsWith('/procurement')) {
      return NextResponse.redirect(new URL('/mandi/dashboard', request.url));
    }
  }

  // 5. Role Gating: GOVERNMENT OFFICIAL BOUNDARIES
  // Government officials can only access: Home (/), MSP Procurement (/procurement), Procurement Dashboard (/government/dashboard), Contact (/contact)
  if (hasGovtSession) {
    if (pathname.startsWith('/mandi/dashboard') || pathname.startsWith('/mandi/warehouse-dashboard')) {
      return NextResponse.redirect(new URL('/government/dashboard', request.url));
    }
    if (isFarmerSpecificPage) {
      return NextResponse.redirect(new URL('/government/dashboard', request.url));
    }
  }

  // 6. Direct Access Protection for Mandi Dashboards
  if (pathname.startsWith('/mandi/dashboard') || pathname.startsWith('/mandi/warehouse-dashboard')) {
    if (hasMandiSession) {
      return supabaseResponse;
    }
    if (!user) {
      const mandiLoginUrl = new URL('/mandi/login', request.url);
      mandiLoginUrl.searchParams.set('redirectTo', pathname + request.nextUrl.search);
      return NextResponse.redirect(mandiLoginUrl);
    }

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

  // 7. Direct Access Protection for /government/dashboard
  if (pathname.startsWith('/government/dashboard')) {
    if (hasGovtSession) {
      return supabaseResponse;
    }
    const govtLoginUrl = new URL('/login', request.url);
    govtLoginUrl.searchParams.set('role', 'government');
    govtLoginUrl.searchParams.set('redirectTo', pathname + request.nextUrl.search);
    return NextResponse.redirect(govtLoginUrl);
  }

  // 8. Direct Access Protection for /slot-booking (Requires authenticated Farmer)
  if (pathname.startsWith('/slot-booking') && !hasFarmerSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('role', 'farmer');
    loginUrl.searchParams.set('redirectTo', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 9. Direct Access Protection for Agricultural Services (Requires signed-in user)
  if (isServicesPage) {
    // Government officials have access to /procurement
    if (hasGovtSession && pathname.startsWith('/procurement')) {
      return supabaseResponse;
    }

    if (!user && !hasFarmerSession && !hasGovtSession && !hasMandiSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
