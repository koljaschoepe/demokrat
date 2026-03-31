import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

/** Routen, die ohne Authentifizierung zugaenglich sind */
const PUBLIC_ROUTES = [
  '/',
  '/anmelden',
  '/registrieren',
  '/passwort-vergessen',
  '/passwort-zuruecksetzen',
  '/impressum',
  '/datenschutz',
  '/nutzungsbedingungen',
  '/community-regeln',
  '/transparenz',
  '/dsfa',
  '/bundestag',
  '/offline',
];

/** Prefixes die immer oeffentlich sind */
const PUBLIC_PREFIXES = ['/api/', '/auth/', '/transparenz/'];

export async function middleware(request: NextRequest) {
  // 1. Session auffrischen
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // 2. Oeffentliche Routen, API-Routen, Auth-Callback und statische Assets ueberspringen
  if (
    PUBLIC_ROUTES.some((route) => pathname === route) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return response;
  }

  // 3. Rate-Limiting Header setzen (actual rate limiting happens in tRPC middleware)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  response.headers.set('X-RateLimit-Policy', 'sliding-window');

  // 4. Auth-Check fuer geschuetzte Routen
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/anmelden';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
