import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { parseDefaultThemeFromCountry } from '@lobechat/utils/server';
import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';
import urlJoin from 'url-join';

// NOTE: Do NOT import @/auth statically - it requires Node.js runtime (database)
// Better Auth handler is dynamically imported only when enabled
import { OAUTH_AUTHORIZED } from '@/const/auth';
import { LOBE_LOCALE_COOKIE } from '@/const/locale';
import { LOBE_THEME_APPEARANCE } from '@/const/theme';
import { appEnv } from '@/envs/app';
import { authEnv } from '@/envs/auth';
import NextAuth from '@/libs/next-auth';
import { Locales } from '@/locales/resources';
import { getTenantDomains } from '@/server/services/tenant';

import { oidcEnv } from './envs/oidc';
import { parseBrowserLanguage } from './utils/locale';
import { RouteVariants } from './utils/server/routeVariants';

// Create debug logger instances
const logDefault = debug('middleware:default');
const logNextAuth = debug('middleware:next-auth');
const logClerk = debug('middleware:clerk');
const logBetterAuth = debug('middleware:better-auth');
const logTenant = debug('middleware:tenant');

/**
 * FALLBACK_TENANT_DOMAINS Configuration
 *
 * Hardcoded fallback domains for development and testing.
 * These are merged with database-loaded domains.
 *
 * @see TASK-007: Create middleware with TENANT_DOMAINS config
 * @see TASK-024: Dynamic domain loading from database
 */
const FALLBACK_TENANT_DOMAINS: Record<string, string> = {
  'live.ceremoniacircle.org': 'ceremonia',
};

/**
 * ALLOWED_PATHS Configuration
 *
 * Paths allowed on custom tenant domains (deny by default for security).
 *
 * @see TASK-009: Implement path blocking for non-allowed routes
 */
const TENANT_ALLOWED_PATHS = ['/', '/lp'];

/**
 * Enable x-tenant-id header for debugging (disabled in production)
 */
const ENABLE_TENANT_HEADER = process.env.NODE_ENV !== 'production';

/**
 * Adds x-tenant-id header to response for debugging
 */
function addTenantHeader(response: NextResponse, tenantId: string): NextResponse {
  if (ENABLE_TENANT_HEADER) {
    response.headers.set('x-tenant-id', tenantId);
  }
  return response;
}

// OIDC session pre-sync constant
const OIDC_SESSION_HEADER = 'x-oidc-session-sync';

export const config = {
  matcher: [
    // include any files in the api or trpc folders that might have an extension
    '/(api|trpc|webapi)(.*)',
    // include the /
    '/',
    '/discover',
    '/discover(.*)',
    '/labs',
    '/chat',
    '/chat(.*)',
    '/changelog(.*)',
    '/settings(.*)',
    '/image',
    '/knowledge',
    '/knowledge(.*)',
    '/profile(.*)',
    '/me',
    '/me(.*)',

    '/login(.*)',
    '/signup(.*)',
    '/signin(.*)',
    '/verify-email(.*)',
    '/reset-password(.*)',
    '/next-auth/(.*)',
    '/oauth(.*)',
    '/oidc(.*)',

    // Tenant landing page routes (Ceremonia)
    '/lp',
    '/lp/(.*)',
    '/page/(.*)',
    '/preview/(.*)',
  ],
};

const backendApiEndpoints = ['/api', '/trpc', '/webapi', '/oidc'];

const defaultMiddleware = async (request: NextRequest) => {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  logDefault('Processing request: %s %s', request.method, request.url);

  // ============================================================
  // TENANT DOMAIN HANDLING (Ceremonia Landing Pages)
  // @see TASK-007 through TASK-012
  // @see TASK-024: Dynamic domain loading from database
  // ============================================================

  // Load tenant domains from database (cached)
  const dbDomains = await getTenantDomains();

  // Merge database domains with fallback domains
  const TENANT_DOMAINS = { ...FALLBACK_TENANT_DOMAINS, ...dbDomains };

  logTenant('Loaded tenant domains: %O', {
    dbDomainCount: Object.keys(dbDomains).length,
    fallbackDomainCount: Object.keys(FALLBACK_TENANT_DOMAINS).length,
    totalDomains: Object.keys(TENANT_DOMAINS).length,
  });

  const tenantId = TENANT_DOMAINS[hostname];

  if (tenantId) {
    // Custom domain detected
    logTenant('Custom domain detected: %O', { hostname, pathname, tenantId });

    // SECURITY: Check if path is allowed on custom domain (deny by default)
    const isPathAllowed = TENANT_ALLOWED_PATHS.some((allowedPath) => {
      if (allowedPath === '/' && pathname === '/') return true;
      if (allowedPath !== '/' && pathname.startsWith(allowedPath)) return true;
      return false;
    });

    if (!isPathAllowed) {
      logTenant('BLOCKED: %O', { hostname, pathname, reason: 'Path not in allowlist' });
      return addTenantHeader(new NextResponse('Not Found', { status: 404 }), tenantId);
    }

    // Handle root path -> /page/{tenantId}/home
    if (pathname === '/') {
      const rewriteUrl = new URL(`/page/${tenantId}/home`, request.url);
      logTenant('Root path rewrite: %O', { from: pathname, to: rewriteUrl.pathname });
      return addTenantHeader(NextResponse.rewrite(rewriteUrl), tenantId);
    }

    // Handle /lp/{slug} -> /page/{tenantId}/{slug}
    if (pathname.startsWith('/lp/')) {
      const slug = pathname.slice(4); // Remove '/lp/' prefix
      const rewriteUrl = new URL(`/page/${tenantId}${slug}`, request.url);
      logTenant('URL rewrite: %O', { from: pathname, slug, tenantId, to: rewriteUrl.pathname });
      return addTenantHeader(NextResponse.rewrite(rewriteUrl), tenantId);
    }

    // Handle /lp without trailing path -> /page/{tenantId}/home
    if (pathname === '/lp') {
      const rewriteUrl = new URL(`/page/${tenantId}/home`, request.url);
      logTenant('/lp rewrite: %O', { from: pathname, to: rewriteUrl.pathname });
      return addTenantHeader(NextResponse.rewrite(rewriteUrl), tenantId);
    }
  }

  // SECURITY: Block /lp/* paths on main domain (only accessible via custom domains)
  if (!tenantId && pathname.startsWith('/lp')) {
    logTenant('BLOCKED (main domain): %O', {
      hostname,
      pathname,
      reason: '/lp/* paths only accessible via custom domains',
    });
    return new NextResponse('Not Found', { status: 404 });
  }

  // ============================================================
  // LANDING PAGE ROUTES - Skip variant prefixing
  // These routes render standalone pages without auth/i18n handling
  // @see TASK-004 through TASK-006
  // ============================================================
  if (pathname.startsWith('/page/') || pathname.startsWith('/preview/')) {
    logTenant('Landing page route detected, bypassing variant prefix: %s', pathname);
    return NextResponse.next();
  }

  // ============================================================
  // ORIGINAL LOBECHAT MIDDLEWARE LOGIC
  // ============================================================

  // skip all api requests
  if (backendApiEndpoints.some((path) => url.pathname.startsWith(path))) {
    logDefault('Skipping API request: %s', url.pathname);
    return NextResponse.next();
  }

  // 1. Read user preferences from cookies
  const theme =
    request.cookies.get(LOBE_THEME_APPEARANCE)?.value || parseDefaultThemeFromCountry(request);

  // locale has three levels
  // 1. search params
  // 2. cookie
  // 3. browser

  // highest priority is explicitly in search params, like ?hl=zh-CN
  const explicitlyLocale = (url.searchParams.get('hl') || undefined) as Locales | undefined;

  // if it's a new user, there's no cookie, So we need to use the fallback language parsed by accept-language
  const browserLanguage = parseBrowserLanguage(request.headers);

  const locale =
    explicitlyLocale ||
    ((request.cookies.get(LOBE_LOCALE_COOKIE)?.value || browserLanguage) as Locales);

  const ua = request.headers.get('user-agent');

  const device = new UAParser(ua || '').getDevice();

  logDefault('User preferences: %O', {
    browserLanguage,
    deviceType: device.type,
    hasCookies: {
      locale: !!request.cookies.get(LOBE_LOCALE_COOKIE)?.value,
      theme: !!request.cookies.get(LOBE_THEME_APPEARANCE)?.value,
    },
    locale,
    theme,
  });

  // 2. Create normalized preference values
  const route = RouteVariants.serializeVariants({
    isMobile: device.type === 'mobile',
    locale,
    theme,
  });

  logDefault('Serialized route variant: %s', route);

  // if app is in docker, rewrite to self container
  // https://github.com/lobehub/lobe-chat/issues/5876
  if (appEnv.MIDDLEWARE_REWRITE_THROUGH_LOCAL) {
    logDefault('Local container rewrite enabled: %O', {
      host: '127.0.0.1',
      original: url.toString(),
      port: process.env.PORT || '3210',
      protocol: 'http',
    });

    url.protocol = 'http';
    url.host = '127.0.0.1';
    url.port = process.env.PORT || '3210';
  }

  // refs: https://github.com/lobehub/lobe-chat/pull/5866
  // new handle segment rewrite: /${route}${originalPathname}
  // / -> /zh-CN__0__dark
  // /discover -> /zh-CN__0__dark/discover
  // All SPA routes that use react-router-dom should be rewritten to just /${route}
  const spaRoutes = [
    '/chat',
    '/discover',
    '/knowledge',
    '/settings',
    '/image',
    '/labs',
    '/changelog',
    '/profile',
    '/me',
  ];
  const isSpaRoute = spaRoutes.some((route) => url.pathname.startsWith(route));

  let nextPathname: string;
  if (isSpaRoute) {
    nextPathname = `/${route}`;
  } else {
    nextPathname = `/${route}` + (url.pathname === '/' ? '' : url.pathname);
  }
  const nextURL = appEnv.MIDDLEWARE_REWRITE_THROUGH_LOCAL
    ? urlJoin(url.origin, nextPathname)
    : nextPathname;

  console.log('nextURL', nextURL);

  logDefault('URL rewrite: %O', {
    isLocalRewrite: appEnv.MIDDLEWARE_REWRITE_THROUGH_LOCAL,
    nextPathname: nextPathname,
    nextURL: nextURL,
    originalPathname: url.pathname,
  });

  url.pathname = nextPathname;

  logDefault('nextURL after rewrite: %s', url.toString());
  // build rewrite response first
  const rewrite = NextResponse.rewrite(url, { status: 200 });

  // If locale explicitly provided via query (?hl=), persist it in cookie when user has no prior preference
  if (explicitlyLocale) {
    const existingLocale = request.cookies.get(LOBE_LOCALE_COOKIE)?.value as Locales | undefined;
    if (!existingLocale) {
      rewrite.cookies.set(LOBE_LOCALE_COOKIE, explicitlyLocale, {
        // 90 days is a balanced persistence for locale preference
        maxAge: 60 * 60 * 24 * 90,

        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      logDefault('Persisted explicit locale to cookie (no prior cookie): %s', explicitlyLocale);
    } else {
      logDefault(
        'Locale cookie exists (%s), skip overwrite with %s',
        existingLocale,
        explicitlyLocale,
      );
    }
  }

  return rewrite;
};

const isPublicRoute = createRouteMatcher([
  // backend api
  '/api/auth(.*)',
  '/api/webhooks(.*)',
  '/webapi(.*)',
  '/trpc(.*)',
  // next auth
  '/next-auth/(.*)',
  // clerk
  '/login',
  '/signup',
  // better auth
  '/signin',
  '/verify-email',
  '/reset-password',
  // oauth
  // Make only the consent view public (GET page), not other oauth paths
  '/oauth/consent/(.*)',
  '/oidc/handoff',
  '/oidc/token',
  // Landing pages - must be public for multi-tenant sites
  // @see TASK-004 through TASK-006
  '/page/(.*)',
  '/preview/(.*)',
  '/lp',
  '/lp/(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/settings(.*)',
  '/knowledge(.*)',
  '/onboard(.*)',
  '/oauth(.*)',
  // ↓ cloud ↓
]);

// Initialize an Edge compatible NextAuth middleware
const nextAuthMiddleware = NextAuth.auth(async (req) => {
  logNextAuth('NextAuth middleware processing request: %s %s', req.method, req.url);

  const response = await defaultMiddleware(req);

  // when enable auth protection, only public route is not protected, others are all protected
  const isProtected = appEnv.ENABLE_AUTH_PROTECTION ? !isPublicRoute(req) : isProtectedRoute(req);

  logNextAuth('Route protection status: %s, %s', req.url, isProtected ? 'protected' : 'public');

  // Just check if session exists
  const session = req.auth;

  // Check if next-auth throws errors
  // refs: https://github.com/lobehub/lobe-chat/pull/1323
  const isLoggedIn = !!session?.expires;

  logNextAuth('NextAuth session status: %O', {
    expires: session?.expires,
    isLoggedIn,
    userId: session?.user?.id,
  });

  // Remove & amend OAuth authorized header
  response.headers.delete(OAUTH_AUTHORIZED);
  if (isLoggedIn) {
    logNextAuth('Setting auth header: %s = %s', OAUTH_AUTHORIZED, 'true');
    response.headers.set(OAUTH_AUTHORIZED, 'true');

    // If OIDC is enabled and user is logged in, add OIDC session pre-sync header
    if (oidcEnv.ENABLE_OIDC && session?.user?.id) {
      logNextAuth('OIDC session pre-sync: Setting %s = %s', OIDC_SESSION_HEADER, session.user.id);
      response.headers.set(OIDC_SESSION_HEADER, session.user.id);
    }
  } else {
    // If request a protected route, redirect to sign-in page
    // ref: https://authjs.dev/getting-started/session-management/protecting
    if (isProtected) {
      logNextAuth('Request a protected route, redirecting to sign-in page');
      const nextLoginUrl = new URL('/next-auth/signin', req.nextUrl.origin);
      nextLoginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
      const hl = req.nextUrl.searchParams.get('hl');
      if (hl) {
        nextLoginUrl.searchParams.set('hl', hl);
        logNextAuth('Preserving locale to sign-in: hl=%s', hl);
      }
      return Response.redirect(nextLoginUrl);
    }
    logNextAuth('Request a free route but not login, allow visit without auth header');
  }

  return response;
});

const clerkAuthMiddleware = clerkMiddleware(
  async (auth, req) => {
    logClerk('Clerk middleware processing request: %s %s', req.method, req.url);

    // when enable auth protection, only public route is not protected, others are all protected
    const isProtected = appEnv.ENABLE_AUTH_PROTECTION ? !isPublicRoute(req) : isProtectedRoute(req);

    logClerk('Route protection status: %s, %s', req.url, isProtected ? 'protected' : 'public');

    if (isProtected) {
      logClerk('Protecting route: %s', req.url);
      await auth.protect();
    }

    const response = await defaultMiddleware(req);

    const data = await auth();
    logClerk('Clerk auth status: %O', {
      isSignedIn: !!data.userId,
      userId: data.userId,
    });

    // If OIDC is enabled and Clerk user is logged in, add OIDC session pre-sync header
    if (oidcEnv.ENABLE_OIDC && data.userId) {
      logClerk('OIDC session pre-sync: Setting %s = %s', OIDC_SESSION_HEADER, data.userId);
      response.headers.set(OIDC_SESSION_HEADER, data.userId);
    } else if (oidcEnv.ENABLE_OIDC) {
      logClerk('No Clerk user detected, not setting OIDC session sync header');
    }

    return response;
  },
  {
    // https://github.com/lobehub/lobe-chat/pull/3084
    clockSkewInMs: 60 * 60 * 1000,
    signInUrl: '/login',
    signUpUrl: '/signup',
  },
);

const betterAuthMiddleware = async (req: NextRequest) => {
  logBetterAuth('BetterAuth middleware processing request: %s %s', req.method, req.url);

  const response = await defaultMiddleware(req);

  // when enable auth protection, only public route is not protected, others are all protected
  const isProtected = appEnv.ENABLE_AUTH_PROTECTION ? !isPublicRoute(req) : isProtectedRoute(req);

  logBetterAuth('Route protection status: %s, %s', req.url, isProtected ? 'protected' : 'public');

  // Skip session lookup for public routes to reduce latency
  if (!isProtected) return response;

  // Dynamic import: @/auth requires Node.js runtime (database access)
  // This import is only executed when Better Auth is enabled
  const { auth } = await import('@/auth');

  // Get full session with user data (Next.js 15.2.0+ feature)
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const isLoggedIn = !!session?.user;

  logBetterAuth('BetterAuth session status: %O', {
    isLoggedIn,
    userId: session?.user?.id,
  });

  if (!isLoggedIn) {
    // If request a protected route, redirect to sign-in page
    if (isProtected) {
      logBetterAuth('Request a protected route, redirecting to sign-in page');
      const signInUrl = new URL('/signin', req.nextUrl.origin);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.href);
      const hl = req.nextUrl.searchParams.get('hl');
      if (hl) {
        signInUrl.searchParams.set('hl', hl);
        logBetterAuth('Preserving locale to sign-in: hl=%s', hl);
      }
      return Response.redirect(signInUrl);
    }
    logBetterAuth('Request a free route but not login, allow visit without auth header');
  }

  return response;
};

logDefault('Middleware configuration: %O', {
  enableAuthProtection: appEnv.ENABLE_AUTH_PROTECTION,
  enableBetterAuth: authEnv.NEXT_PUBLIC_ENABLE_BETTER_AUTH,
  enableClerk: authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH,
  enableNextAuth: authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH,
  enableOIDC: oidcEnv.ENABLE_OIDC,
});

export default authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH
  ? clerkAuthMiddleware
  : authEnv.NEXT_PUBLIC_ENABLE_BETTER_AUTH
    ? betterAuthMiddleware
    : authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
      ? nextAuthMiddleware
      : defaultMiddleware;
