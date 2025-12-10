# Product Requirements Document v1.0.0 (Unified Architecture)

## Ceremonia Multi-Page Landing System (Tenant #1) - Payload CMS Implementation

**Created**: 2025-12-10
**Status**: Ready for Implementation
**Owner**: Austin Mao
**Version**: 1.0.0-unified
**Base Document**: product-requirements-v1.0.0.md (modified for compatibility with existing Payload CMS infrastructure)

---

## Changelog from Original PRD

**Key Changes**:

1. ✅ **Content Storage**: Changed from static TypeScript files to **Payload CMS** (aligns with existing system)
2. ✅ **Route Pattern**: Changed from `(tenants)/lp/[slug]` to **middleware rewrite** → existing `/page/[tenantId]/[slug]` route
3. ✅ **TenantId**: Added explicit `tenantId: "ceremonia"` (database-driven multi-tenancy)
4. ✅ **Component System**: Uses existing `PageRenderer` and `DESIGN_SYSTEM_COMPONENTS` from PRD v1.2.0
5. ✅ **Editing**: Changed from code changes to **Payload admin UI** (dynamic, no-code editing)
6. ⚠️ **Middleware**: Still implements custom domain routing via `src/middleware.ts` (NEW FILE)

---

## Overview

### Problem Statement

The Myxelium multi-tenant SaaS platform needs to serve tenant-specific landing pages under custom domains. The first tenant (Ceremonia) requires a dynamic landing page system that can host multiple marketing/event pages under `live.ceremoniacircle.org`.

### Solution Overview

Deploy a multi-page landing system using the **existing Payload CMS infrastructure** with custom domain routing:

- **Content Storage**: Payload CMS (PostgreSQL) with `tenantId: "ceremonia"`
- **Routing**: Next.js middleware rewrites `live.ceremoniacircle.org/lp/{slug}` → `/page/ceremonia/{slug}`
- **Rendering**: Existing `PageRenderer` component with Untitled UI design system
- **Editing**: Payload admin UI for dynamic content editing

### First Landing Page

```
External URL: https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos
Internal Route: /page/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos
```

---

## Goals & Objectives

### Primary Goal

Serve unlimited landing pages for Ceremonia at `live.ceremoniacircle.org/lp/{slug}` using the existing Payload CMS infrastructure, with custom domain routing and zero impact on LobeChat functionality.

### Success Criteria

| Criteria              | Target                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------- |
| First page accessible | live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos |
| Page load time        | < 3 seconds                                                                                  |
| Existing app impact   | Zero functional changes                                                                      |
| Architecture          | Leverages existing Payload CMS system                                                        |
| Adding new pages      | < 5 minutes per page (via Payload admin)                                                     |
| Content editing       | No deployments required (edit in CMS)                                                        |

---

## Features & Requirements

### Critical Features (MVP)

#### 1. Payload CMS Tenant Setup

**TenantId**: `ceremonia`

**User Creation**:

```json
{
  "email": "admin@ceremoniacircle.org",
  "role": "user",
  "tenantId": "ceremonia"
}
```

**Access Control**: Payload multi-tenant plugin ensures user only sees `tenantId: ceremonia` pages.

#### 2. Custom Domain Routing (Middleware)

**File**: `src/middleware.ts` (NEW)

**Functionality**:

- Intercept requests to `live.ceremoniacircle.org`
- Rewrite `/lp/{slug}` → `/page/ceremonia/{slug}` (internal route)
- Block non-allowed paths on custom domain (security)
- Preserve existing LobeChat routes on main domain

**Routing Matrix**:

| Domain                   | Path                    | Middleware Action | Final Route              |
| ------------------------ | ----------------------- | ----------------- | ------------------------ |
| live.ceremoniacircle.org | /lp/any-slug            | Rewrite           | /page/ceremonia/any-slug |
| live.ceremoniacircle.org | /                       | Redirect or 404   | /lp/home OR 404          |
| live.ceremoniacircle.org | /chat                   | Block (404)       | 404                      |
| lobe-builder.vercel.app  | /lp/any-slug            | Block (404)       | 404                      |
| lobe-builder.vercel.app  | /page/ceremonia/slug    | Allow             | /page/ceremonia/slug     |
| lobe-builder.vercel.app  | /preview/ceremonia/slug | Allow             | /preview/ceremonia/slug  |

#### 3. Payload CMS Page Creation

**Collection**: `pages` (existing)

**Page Schema** (from PRD v1.2.0):

```typescript
{
  tenantId: "ceremonia",           // Required: tenant identifier
  userId: "user_ceremonia_admin",  // Required: user within tenant
  slug: "softening-the-season-3-simple-skills-for-connection-in-the-chaos",
  title: "Softening the Season: 3 Simple Skills for Connection in the Chaos",
  designSystem: "untitledui",      // Default design system
  _status: "draft" | "published",  // Payload drafts workflow
  sections: [
    {
      blockType: "hero",
      title: "Softening the Season",
      subtitle: "3 Simple Skills for Connection in the Chaos",
      ctaLabel: "Join Us",
      ctaHref: "#register"
    },
    {
      blockType: "features",
      heading: "What You'll Learn",
      items: [
        {
          icon: "heart",
          title: "Emotional Regulation",
          description: "Tools to manage stress during the holidays"
        },
        {
          icon: "users",
          title: "Connection Skills",
          description: "Deepen relationships with loved ones"
        },
        {
          icon: "brain",
          title: "Mindfulness Practices",
          description: "Stay present amidst the chaos"
        }
      ]
    },
    {
      blockType: "cta",
      heading: "Ready to Transform Your Holidays?",
      description: "Join us for this transformative workshop",
      primaryButton: {
        label: "Register Now",
        href: "#register"
      }
    }
  ]
}
```

**Creation Methods**:

1. **Via Payload Admin UI**: Manual creation by Ceremonia team
2. **Via API**: `POST /api/pages/create` (for AI-generated pages)

#### 4. Existing PageRenderer Integration

**Component**: `/src/components/PageRenderer/index.tsx` (EXISTING)

**No Changes Required**: The existing PageRenderer already supports:

- Multi-design system rendering (`designSystem` field)
- Untitled UI components (default)
- Block-to-component mapping
- Type-safe rendering

**Rendering Flow**:

```typescript
// Middleware rewrites URL
live.ceremoniacircle.org/lp/slug → /page/ceremonia/slug

// Next.js route handler
app/page/[tenantId]/[slug]/page.tsx

// Fetch from Payload
const page = await payload.find({
  collection: 'pages',
  where: {
    tenantId: { equals: 'ceremonia' },
    slug: { equals: slug },
    _status: { equals: 'published' }
  }
});

// Render with PageRenderer
<PageRenderer page={page.docs[0]} />
```

#### 5. Preview and Published Routes

**Routes** (EXISTING - no changes):

- **Preview** (draft + published): `/preview/ceremonia/{slug}`
- **Published** (published only): `/page/ceremonia/{slug}`

**Custom Domain Access**:

- **Published pages**: `live.ceremoniacircle.org/lp/{slug}` → rewrites to `/page/ceremonia/{slug}`
- **Draft pages**: Access via main domain `/preview/ceremonia/{slug}` (requires authentication)

#### 6. First Landing Page Implementation

**Page Details**:

- **Title**: "Softening the Season: 3 Simple Skills for Connection in the Chaos"
- **Slug**: `softening-the-season-3-simple-skills-for-connection-in-the-chaos`
- **Design System**: `untitledui`
- **Sections**: Hero, Features, CTA

**Content Creation Workflow**:

1. Login to Payload admin: `https://lobe-builder.vercel.app/admin`
2. Navigate to Pages collection
3. Click "Create New"
4. Fill in:
   - Title
   - Slug
   - Design System: `untitledui`
5. Add sections (Hero, Features, CTA)
6. Save as draft
7. Preview at: `/preview/ceremonia/{slug}`
8. Publish
9. Access at: `live.ceremoniacircle.org/lp/{slug}`

---

## Technical Architecture

### File Structure

```
src/
├── middleware.ts                           # NEW: Custom domain routing
├── app/
│   ├── (backend)/                          # Existing: API routes
│   ├── [variants]/                         # Existing: LobeChat main app
│   ├── preview/                            # Existing: Preview route
│   │   └── [tenantId]/
│   │       └── [slug]/
│   │           └── page.tsx                # Existing: Fetches draft + published
│   └── page/                               # Existing: Published route
│       └── [tenantId]/
│           └── [slug]/
│               └── page.tsx                # Existing: Fetches published only
├── components/
│   └── PageRenderer/                       # Existing: Multi-design system renderer
│       ├── index.tsx
│       ├── types.ts
│       └── sections/
│           ├── HeroSection.tsx
│           ├── FeaturesSection.tsx
│           ├── CTASection.tsx
│           └── TextSection.tsx
└── libs/
    └── payload/                            # Existing: Payload CMS config
        ├── client.ts
        ├── schemas.ts
        └── config.ts
```

**Note**: The `(tenants)` route group and `_pages/` directory from the original PRD are **NOT CREATED**. We use the existing Payload CMS infrastructure.

### Middleware Implementation

**File**: `src/middleware.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Tenant domain configuration
 * Maps custom domains to tenantIds and allowed path prefixes
 */
const TENANT_DOMAINS: Record<string, { tenantId: string; allowedPaths: string[] }> = {
  'live.ceremoniacircle.org': {
    tenantId: 'ceremonia',
    allowedPaths: ['/lp'],
  },
  // Future tenants can be added here:
  // 'custom-domain.com': { tenantId: 'other-tenant', allowedPaths: ['/pages'] },
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const pathname = request.nextUrl.pathname;

  const tenantConfig = TENANT_DOMAINS[host];

  if (tenantConfig) {
    // Custom domain detected

    // Rewrite /lp/{slug} → /page/{tenantId}/{slug}
    if (pathname.startsWith('/lp/')) {
      const slug = pathname.replace('/lp/', '');
      const rewriteUrl = new URL(`/page/${tenantConfig.tenantId}/${slug}`, request.url);
      console.log(`[Middleware] Rewriting ${pathname} → /page/${tenantConfig.tenantId}/${slug}`);
      return NextResponse.rewrite(rewriteUrl);
    }

    // Handle root path (optional: redirect to default page)
    if (pathname === '/') {
      // Option A: Redirect to default landing page
      const redirectUrl = new URL('/lp/home', request.url);
      return NextResponse.redirect(redirectUrl);

      // Option B: Return 404
      // return NextResponse.rewrite(new URL('/404', request.url));
    }

    // Block non-allowed paths on custom domains
    const isAllowed = tenantConfig.allowedPaths.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      console.log(`[Middleware] Blocking ${pathname} on custom domain ${host}`);
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  } else {
    // Main domain: block /lp/* paths (reserved for custom domains)
    if (pathname.startsWith('/lp/')) {
      console.log(`[Middleware] Blocking /lp/* path on main domain`);
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Payload CMS Configuration

**No Changes Required** - Ceremonia uses existing configuration:

**Collection**: `pages` (existing)
**Multi-Tenant Plugin**: Already configured
**Access Control**: Enforces `tenantId` filtering

**New Tenant Setup** (one-time):

```typescript
// Create Ceremonia user in Payload
await payload.create({
  collection: 'users',
  data: {
    email: 'admin@ceremoniacircle.org',
    password: 'secure-password',
    tenantId: 'ceremonia',
    role: 'user',
  },
});
```

---

## Implementation Plan

### Phase 1: Infrastructure Setup (Day 1)

**Tasks**:

1. ✅ **Verify Existing System**:
   - Confirm Payload CMS collections exist
   - Confirm multi-tenant plugin configured
   - Confirm PageRenderer and components exist

2. ✅ **Create Ceremonia Tenant**:
   - Create user: `admin@ceremoniacircle.org`, `tenantId: ceremonia`
   - Test Payload admin access
   - Verify user only sees `tenantId: ceremonia` pages

3. ✅ **Create Test Page**:
   - Create page via Payload admin: `tenantId: ceremonia`, `slug: test-page`
   - Verify preview: `/preview/ceremonia/test-page`
   - Publish page
   - Verify published: `/page/ceremonia/test-page`

**Success Criteria**:

- [ ] Ceremonia tenant created in Payload
- [ ] Test page renders at `/preview/ceremonia/test-page`
- [ ] Test page renders at `/page/ceremonia/test-page` after publishing

### Phase 2: Middleware Implementation (Day 2)

**Tasks**:

1. ✅ **Create Middleware File**:
   - Create `src/middleware.ts`
   - Implement TENANT_DOMAINS configuration
   - Implement URL rewriting logic
   - Implement path blocking logic

2. ✅ **Local Testing**:
   - Add `127.0.0.1 live.ceremoniacircle.org` to `/etc/hosts`
   - Run Next.js dev server
   - Test URL: `http://live.ceremoniacircle.org:3000/lp/test-page`
   - Verify rewrite to `/page/ceremonia/test-page`

3. ✅ **Add Tests**:
   - Unit tests for middleware logic
   - Integration tests for URL rewriting
   - Security tests (path blocking)

**Success Criteria**:

- [ ] Middleware file created
- [ ] Custom domain requests rewrite correctly
- [ ] Non-allowed paths blocked on custom domain
- [ ] All tests passing

### Phase 3: First Landing Page (Day 3)

**Tasks**:

1. ✅ **Create Page in Payload**:
   - Login to Payload admin
   - Create new page:
     - Title: "Softening the Season: 3 Simple Skills for Connection in the Chaos"
     - Slug: `softening-the-season-3-simple-skills-for-connection-in-the-chaos`
     - TenantId: `ceremonia`
     - Design System: `untitledui`

2. ✅ **Add Sections**:
   - Hero section: Title, subtitle, CTA
   - Features section: 3 key benefits
   - CTA section: Registration prompt

3. ✅ **Content Population**:
   - Work with Ceremonia team to finalize copy
   - Add images (if applicable)
   - Test mobile responsiveness

4. ✅ **Publish Workflow**:
   - Save as draft
   - Preview at `/preview/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos`
   - Review and iterate
   - Publish via Payload admin
   - Verify at `/page/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos`

**Success Criteria**:

- [ ] Page created in Payload
- [ ] All sections populated with content
- [ ] Page published successfully

### Phase 4: Domain Configuration (Day 4)

**Tasks**:

1. ✅ **DNS Configuration**:
   - Ceremonia team creates CNAME: `live.ceremoniacircle.org` → `cname.vercel-dns.com`
   - Verify DNS propagation: `dig live.ceremoniacircle.org`

2. ✅ **Vercel Configuration**:
   - Add domain in Vercel project settings
   - Verify SSL certificate issued
   - Deploy middleware to production

3. ✅ **Production Verification**:
   - Test URL: `https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos`
   - Verify page renders correctly
   - Verify HTTPS works
   - Test mobile responsiveness
   - Run Lighthouse audit (target: > 90 performance score)

**Success Criteria**:

- [ ] DNS configured and propagated
- [ ] Vercel domain added and SSL active
- [ ] Production page accessible at custom domain
- [ ] Page load time < 3 seconds

### Phase 5: Documentation & Handoff (Day 5)

**Tasks**:

1. ✅ **Create User Guides**:
   - "Adding New Landing Pages" guide
   - "Editing Existing Pages" guide
   - "Publishing Workflow" guide
   - "Custom Domain Setup" guide (for future tenants)

2. ✅ **Ceremonia Team Training**:
   - Payload admin walkthrough
   - Create test page together
   - Explain sections (Hero, Features, CTA)
   - Demonstrate publish workflow
   - Provide credentials securely (1Password or similar)

3. ✅ **Update Documentation**:
   - Update architectural compatibility analysis
   - Update this PRD with final implementation notes
   - Create runbook for adding future tenants

**Success Criteria**:

- [ ] All documentation complete
- [ ] Ceremonia team trained and confident
- [ ] Credentials provided securely

---

## Adding New Landing Pages (User Guide)

### For Ceremonia Team (Payload Admin)

**Step 1: Login to Payload**

- URL: `https://lobe-builder.vercel.app/admin`
- Email: `admin@ceremoniacircle.org`
- Password: (provided securely)

**Step 2: Navigate to Pages**

- Click "Pages" in the left sidebar

**Step 3: Create New Page**

- Click "Create New" button
- Fill in:
  - **Title**: Full page title (e.g., "Spring Meditation Retreat 2025")
  - **Slug**: URL-friendly version (e.g., `spring-meditation-retreat-2025`)
    - Use lowercase letters, numbers, and hyphens only
    - No spaces or special characters
  - **Design System**: Select `untitledui` (default)

**Step 4: Add Sections**

- Click "Add Block" to add sections
- Available section types:
  - **Hero**: Main headline, subtitle, CTA button
  - **Features**: List of key benefits with icons
  - **Text**: Body content paragraph
  - **CTA**: Call-to-action with buttons

**Step 5: Populate Content**

- Fill in all required fields for each section
- Use the rich text editor for formatted content
- Add images via the media library (if applicable)

**Step 6: Save as Draft**

- Click "Save Draft" button
- Page is now saved but not publicly visible

**Step 7: Preview**

- Click "Preview" button OR
- Navigate to: `https://lobe-builder.vercel.app/preview/ceremonia/{your-slug}`
- Review content and layout
- Check mobile responsiveness

**Step 8: Publish**

- Return to Payload admin
- Click "Publish" button
- Page is now live at: `https://live.ceremoniacircle.org/lp/{your-slug}`

**Step 9: Edit Existing Pages**

- Navigate to Pages → Select page
- Make changes
- Save as draft (to preview) OR Publish (to update live)

---

## Implementation Considerations

### Risks & Mitigations

| Risk                               | Likelihood | Impact | Mitigation                                                               |
| ---------------------------------- | ---------- | ------ | ------------------------------------------------------------------------ |
| Middleware breaks existing routes  | Medium     | High   | Comprehensive matcher config; extensive testing; deploy to staging first |
| DNS misconfiguration               | Medium     | High   | Clear DNS documentation; validation script; Vercel domain verification   |
| Performance impact from middleware | Low        | Medium | Lightweight middleware logic (< 10ms overhead); monitoring               |
| Payload CMS learning curve         | Medium     | Medium | Comprehensive training; user guides; ongoing support                     |

### Complexity Notes

- **Middleware is new**: LobeChat doesn't currently have middleware.ts. Careful testing required.
- **Custom domain routing**: URL rewrites can be confusing. Clear documentation is critical.
- **Payload admin access**: Requires secure credential management and user training.

---

## Success Metrics

### Functional Metrics

- [ ] First page renders at full URL without errors
- [ ] Middleware correctly rewrites custom domain requests
- [ ] Main domain `/lp/*` routes return 404
- [ ] Page loads in < 3 seconds (Lighthouse)
- [ ] Mobile responsive (passes viewport test)
- [ ] HTTPS active on custom domain

### Deployment Metrics

- [ ] Vercel build succeeds with middleware
- [ ] Domain configured and valid in Vercel
- [ ] HTTPS active on custom domain
- [ ] No errors in Vercel logs
- [ ] Middleware execution time < 10ms (P95)

### Architecture Metrics

- [ ] Adding new page requires only Payload admin (no code changes)
- [ ] No modifications to existing LobeChat code (except middleware)
- [ ] Middleware matcher is minimal scope
- [ ] Cross-tenant isolation verified (security tests passing)

---

## Acceptance Checklist

### Landing Page System

- [ ] Ceremonia tenant created in Payload with `tenantId: ceremonia`
- [ ] Test page accessible at `/preview/ceremonia/test-page`
- [ ] Test page accessible at `/page/ceremonia/test-page` after publishing
- [ ] PageRenderer renders Payload data correctly

### Custom Domain Routing

- [ ] Middleware file created at `src/middleware.ts`
- [ ] `live.ceremoniacircle.org/lp/*` rewrites to `/page/ceremonia/*`
- [ ] `live.ceremoniacircle.org/` redirects or returns 404
- [ ] `live.ceremoniacircle.org/chat` returns 404 (blocked)
- [ ] `lobe-builder.vercel.app/lp/*` returns 404 (blocked)
- [ ] `lobe-builder.vercel.app/page/ceremonia/*` works normally
- [ ] `lobe-builder.vercel.app/preview/ceremonia/*` works normally

### First Page

- [ ] Full URL accessible: `https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos`
- [ ] Page renders with complete content (Hero, Features, CTA)
- [ ] Mobile responsive (tested on multiple devices)
- [ ] No console errors
- [ ] Page load time < 3 seconds

### Architecture

- [ ] New pages added via Payload admin (no code changes)
- [ ] No changes to existing LobeChat routing
- [ ] No changes to existing PageRenderer component
- [ ] Middleware matcher is minimal scope
- [ ] Cross-tenant isolation verified (Ceremonia can't access other tenants' pages)

---

## Appendix A: DNS Configuration

**Ceremonia Domain**: ceremoniacircle.org

**CNAME Record**:

```
Type: CNAME
Name: live
Value: cname.vercel-dns.com
TTL: Auto (or 3600)
```

**Verification**:

```bash
dig live.ceremoniacircle.org
# Expected: CNAME to cname.vercel-dns.com
```

---

## Appendix B: Environment Variables

**No New Environment Variables Required**

Existing variables (from Payload CMS setup):

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PAYLOAD_SECRET=your-secret-key
```

Domain mapping is configured in code (`src/middleware.ts`), not environment variables.

---

## Appendix C: Comparison with Original PRD

| Feature          | Original PRD v1.0.0                 | Unified PRD v1.0.0-unified                     |
| ---------------- | ----------------------------------- | ---------------------------------------------- |
| Content Storage  | Static TypeScript files (`_pages/`) | Payload CMS (PostgreSQL)                       |
| Route Pattern    | `(tenants)/lp/[slug]/page.tsx`      | Middleware rewrite → `/page/[tenantId]/[slug]` |
| TenantId         | Implicit (domain-based)             | Explicit (`tenantId: ceremonia`)               |
| Editing          | Code changes + deployment           | Payload admin (no deployment)                  |
| Component System | Custom implementation               | Existing PageRenderer                          |
| Multi-tenancy    | File-based isolation                | Database-level ACL                             |
| Scalability      | Manual file creation                | CMS-driven (AI + human editable)               |
| Middleware       | NEW (custom domain routing)         | NEW (custom domain routing) - SAME             |
| DNS              | Custom domain (Vercel)              | Custom domain (Vercel) - SAME                  |

---

## Appendix D: Related Documents

- **Architectural Compatibility Analysis**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/architectural-compatibility-analysis.md`
- **PRD v1.2.0 (Myxelium Page Builder)**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
- **Multi-Design System Architecture**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/multi-design-system-architecture.md`
- **Existing PageRenderer**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/src/components/PageRenderer/`
- **Original PRD v1.0.0**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0.md`

---

**Document Status**: READY FOR IMPLEMENTATION
**Architecture Alignment**: VERIFIED - Compatible with existing Payload CMS infrastructure
**Next Action**: Phase 1 - Infrastructure Setup
**Owner**: Austin Mao
**Review Date**: 2025-12-10
