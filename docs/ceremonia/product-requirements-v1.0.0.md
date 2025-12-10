# Product Requirements Document v1.0.0

## Ceremonia Multi-Page Landing System (Tenant #1)

**Created**: 2025-12-10
**Status**: Draft
**Owner**: Austin Mao

---

## Overview

### Problem Statement

The Myxelium multi-tenant SaaS platform needs to serve tenant-specific landing pages under custom domains. The first tenant (Ceremonia) requires a dynamic landing page system that can host multiple marketing/event pages under a single subdomain.

### Solution Overview

Deploy a multi-page landing system at `live.ceremoniacircle.org/lp/{page-slug}` within the existing LobeChat (lobe-builder) codebase using:

- Next.js dynamic routing with `[slug]` pattern
- Middleware-based tenant domain isolation
- Dedicated `(tenants)` route group separated from main LobeChat app
- Static page definitions with future CMS extensibility

### First Landing Page

```
URL: https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos
```

---

## Goals & Objectives

### Primary Goal

Serve unlimited landing pages for Ceremonia at `live.ceremoniacircle.org/lp/{slug}` without impacting existing LobeChat functionality.

### Success Criteria

| Criteria              | Target                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------- |
| First page accessible | live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos |
| Page load time        | < 3 seconds                                                                                  |
| Existing app impact   | Zero functional changes                                                                      |
| Architecture          | Supports future tenant expansion                                                             |
| Adding new pages      | < 5 minutes per page                                                                         |

---

## Features & Requirements

### Critical Features (MVP)

#### 1. Dynamic Landing Page Route

**Route**: `app/(tenants)/lp/[slug]/page.tsx`

- Dynamic `[slug]` parameter matches any page slug
- Slug validation against allowed page definitions
- 404 handling for undefined slugs
- SEO metadata per page (title, description, OG tags)

**Page Slug Format**:

- Lowercase alphanumeric with hyphens
- No special characters or spaces
- Example: `softening-the-season-3-simple-skills-for-connection-in-the-chaos`

#### 2. Tenant Domain Routing (Middleware)

**File**: `src/middleware.ts`

- Intercept requests to `live.ceremoniacircle.org`
- Allow `/lp/*` routes to render from `(tenants)` route group
- Block other paths on tenant domains (security)
- Preserve LobeChat routes on main domain

**Routing Matrix**:

| Domain                   | Path         | Result                          |
| ------------------------ | ------------ | ------------------------------- |
| live.ceremoniacircle.org | /lp/any-slug | → Tenant landing page           |
| live.ceremoniacircle.org | /            | → 404 or redirect to default LP |
| live.ceremoniacircle.org | /chat        | → 404 (blocked)                 |
| lobe-builder.vercel.app  | /lp/any-slug | → 404 (blocked on main domain)  |
| lobe-builder.vercel.app  | /chat        | → LobeChat (normal)             |

#### 3. Page Content System

**Directory**: `src/app/(tenants)/lp/_pages/`

Static page definitions as TypeScript modules:

```typescript
// _pages/softening-the-season.ts
export const page = {
  slug: 'softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  title: 'Softening the Season: 3 Simple Skills for Connection in the Chaos',
  description: 'Join us for...',
  hero: {
    headline: '...',
    subheadline: '...',
    ctaText: '...',
    ctaUrl: '...',
  },
  sections: [...],
};
```

#### 4. Landing Page Layout

**File**: `src/app/(tenants)/lp/layout.tsx`

- Clean HTML wrapper (no LobeChat chrome)
- Global styles for landing pages
- Font loading (Inter or brand font)
- Analytics integration point (future)

#### 5. First Landing Page Implementation

**Slug**: `softening-the-season-3-simple-skills-for-connection-in-the-chaos`

Minimal placeholder content:

- Hero section with headline
- Branding placeholder (logo, colors)
- CTA button placeholder
- Mobile responsive

---

### Standard Features (Post-MVP)

#### 6. Page Registry

Central registry for all landing pages:

```typescript
// _pages/index.ts
export const LANDING_PAGES = {
  'softening-the-season-3-simple-skills-for-connection-in-the-chaos': () =>
    import('./softening-the-season'),
  // Add more pages here
};
```

#### 7. Shared Components Library

**Directory**: `src/app/(tenants)/lp/_components/`

- Hero component
- CTA button component
- Section wrapper
- Footer component
- Social proof component

#### 8. Environment-Aware Rendering

- `NEXT_PUBLIC_TENANT_ENV` for dev/staging/prod differentiation
- Preview mode for unpublished pages
- Draft watermark on staging

---

### Future Considerations (Out of Scope)

- **Payload CMS Integration**: Dynamic page creation via CMS
- **A/B Testing**: Multiple page variants with analytics
- **Form Submissions**: Lead capture forms
- **Integrations**: HubSpot, Airtable, Zoom
- **Multi-Tenant Expansion**: Additional tenant domains
- **Page Builder UI**: Self-service page creation
- **Authentication**: Gated content pages

---

## Technical Architecture

### File Structure

```
src/
├── middleware.ts                           # NEW: Tenant domain routing
├── app/
│   ├── (backend)/                          # Existing: API routes
│   ├── [variants]/                         # Existing: LobeChat main app
│   └── (tenants)/                          # NEW: Tenant route group
│       └── lp/
│           ├── layout.tsx                  # Landing page layout
│           ├── [slug]/
│           │   └── page.tsx                # Dynamic page renderer
│           ├── _pages/                     # Page content definitions
│           │   ├── index.ts                # Page registry
│           │   └── softening-the-season.ts # First page content
│           └── _components/                # Shared LP components
│               ├── Hero.tsx
│               ├── CTAButton.tsx
│               └── Section.tsx
```

### Middleware Logic

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TENANT_DOMAINS: Record<string, { allowedPaths: string[] }> = {
  'live.ceremoniacircle.org': {
    allowedPaths: ['/lp'],
  },
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const pathname = request.nextUrl.pathname;

  const tenant = TENANT_DOMAINS[host];

  if (tenant) {
    // Tenant domain: only allow specific paths
    const isAllowed = tenant.allowedPaths.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  } else {
    // Main domain: block tenant-only paths
    if (pathname.startsWith('/lp')) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Dynamic Page Component

```typescript
// src/app/(tenants)/lp/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { LANDING_PAGES } from '../_pages';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageLoader = LANDING_PAGES[slug];
  if (!pageLoader) return { title: 'Not Found' };

  const { page } = await pageLoader();
  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const pageLoader = LANDING_PAGES[slug];

  if (!pageLoader) {
    notFound();
  }

  const { page } = await pageLoader();

  return (
    <main>
      {/* Render page content based on page definition */}
      <HeroSection {...page.hero} />
      {page.sections.map((section, i) => (
        <Section key={i} {...section} />
      ))}
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(LANDING_PAGES).map(slug => ({ slug }));
}
```

---

## Implementation Considerations

### Risks & Mitigations

| Risk                              | Likelihood | Impact | Mitigation                                      |
| --------------------------------- | ---------- | ------ | ----------------------------------------------- |
| Middleware breaks existing routes | Medium     | High   | Comprehensive matcher config; extensive testing |
| Slug collision with future routes | Low        | Medium | Reserved slug prefix system                     |
| Performance impact                | Low        | Medium | Static generation via generateStaticParams      |
| DNS misconfiguration              | Medium     | High   | Clear DNS documentation; validation script      |

### Complexity Notes

- **Middleware is new**: LobeChat doesn't currently have middleware.ts. Careful testing required.
- **Route group isolation**: (tenants) group must not import LobeChat providers/layouts
- **No Tailwind**: LobeChat uses antd-style. Landing pages should use inline styles or separate CSS.

---

## Success Metrics

### Functional Metrics

- [ ] First page renders at full URL without errors
- [ ] Middleware correctly routes tenant domain
- [ ] Main domain /lp routes return 404
- [ ] Page loads in < 3 seconds (Lighthouse)
- [ ] Mobile responsive (passes viewport test)

### Deployment Metrics

- [ ] Vercel build succeeds
- [ ] Domain configured and valid in Vercel
- [ ] HTTPS active on custom domain
- [ ] No errors in Vercel logs

### Architecture Metrics

- [ ] Adding new page requires only adding to \_pages/
- [ ] No modifications to existing LobeChat code
- [ ] Middleware matcher is minimal scope

---

## Timeline

### Phase 1: Infrastructure (Day 1)

- Create middleware.ts with tenant routing
- Create (tenants) route group structure
- Create lp/\[slug] dynamic route
- Create layout.tsx

### Phase 2: First Page (Day 1-2)

- Create page content definition for first page
- Create minimal Hero component
- Implement page renderer
- Local testing

### Phase 3: Deployment (Day 2)

- Create PR and merge to next branch
- Configure custom domain in Vercel
- DNS configuration (CNAME)
- Production verification

### Phase 4: Polish (Day 3)

- Add remaining components
- Improve placeholder content
- Documentation

---

## Notes & Clarifications

### Decisions Made

1. **Route Pattern**: `(tenants)/lp/[slug]` - Dynamic slugs for unlimited pages
2. **Domain Routing**: Next.js middleware - Better control than Vercel rewrites
3. **Content System**: Static TypeScript modules - Simple, type-safe, version controlled
4. **Design**: Custom (not @lobehub/ui) - Clean separation from main app

### Open Questions

1. Should `/` on tenant domain redirect to a default LP or show 404?
2. Exact branding assets for Ceremonia (logo, colors, fonts)?
3. Content for "softening-the-season" page?

### Out of Scope Clarifications

- No form submissions or data capture
- No CMS integration (content is code-defined)
- No authentication or gated content
- No dev/staging environments (single production deploy)

---

## Acceptance Checklist

### Landing Page System

- [ ] `/lp/[slug]` route exists and handles dynamic slugs
- [ ] Unknown slugs return 404
- [ ] Page metadata (title, description, OG) renders correctly
- [ ] Layout provides clean HTML without LobeChat chrome

### Domain Routing

- [ ] live.ceremoniacircle.org/lp/\* renders landing pages
- [ ] live.ceremoniacircle.org/ returns 404 or redirect
- [ ] live.ceremoniacircle.org/chat returns 404
- [ ] lobe-builder.vercel.app/lp/\* returns 404
- [ ] lobe-builder.vercel.app/\* works normally

### First Page

- [ ] Full URL accessible: live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos
- [ ] Page renders with placeholder content
- [ ] Mobile responsive
- [ ] No console errors

### Architecture

- [ ] New pages added by creating file in \_pages/ + registry entry
- [ ] No changes to \[variants] routing
- [ ] No changes to existing LobeChat functionality
- [ ] Middleware matcher is minimal scope

---

## Appendix

### DNS Configuration

```
Type: CNAME
Name: live
Value: cname.vercel-dns.com
TTL: Auto
```

### Environment Variables

```bash
# Optional: Tenant environment differentiation
NEXT_PUBLIC_TENANT_ENV=prod # dev | staging | prod
```

### Adding a New Landing Page

1. Create page definition in `src/app/(tenants)/lp/_pages/my-new-page.ts`
2. Add to registry in `src/app/(tenants)/lp/_pages/index.ts`
3. Commit and deploy
4. Access at: `live.ceremoniacircle.org/lp/my-new-page`
