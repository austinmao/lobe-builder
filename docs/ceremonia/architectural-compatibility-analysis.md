# Architectural Compatibility Analysis: Ceremonia Landing Pages + Myxelium Page Builder

**Date**: 2025-12-10
**Status**: Approved
**Version**: 1.0.0

---

## Executive Summary

This document analyzes the architectural conflicts between:

- **PRD 1**: Ceremonia Multi-Page Landing System (v1.0.0)
- **PRD 2**: Myxelium Multi-Tenant Page Builder (v1.2.0)

And proposes a **unified architecture** that leverages the existing Payload CMS infrastructure while adding custom domain routing for tenant-specific domains.

---

## Conflict Analysis

### 1. Route Pattern Conflict

| Aspect          | PRD 1 (Ceremonia)                  | PRD 2 (Myxelium Existing)                                  | Conflict Level |
| --------------- | ---------------------------------- | ---------------------------------------------------------- | -------------- |
| Route           | `app/(tenants)/lp/[slug]/page.tsx` | `/preview/[tenantId]/[slug]` and `/page/[tenantId]/[slug]` | **HIGH**       |
| TenantId        | Implicit (domain-based)            | Explicit (URL path)                                        | **HIGH**       |
| Slug uniqueness | Global (across all pages)          | Per-tenant (tenantId + slug)                               | **MEDIUM**     |

**Analysis**: PRD 1 assumes `/lp/{slug}` without tenantId, relying on domain routing to identify the tenant. PRD 2 explicitly includes tenantId in the URL path. These are incompatible without architectural changes.

### 2. Content Storage Conflict

| Aspect        | PRD 1 (Ceremonia)                    | PRD 2 (Myxelium Existing)        | Conflict Level |
| ------------- | ------------------------------------ | -------------------------------- | -------------- |
| Storage       | Static TypeScript files in `_pages/` | Payload CMS + PostgreSQL         | **CRITICAL**   |
| Editability   | Code changes + deployment            | Payload admin UI (live editing)  | **CRITICAL**   |
| Multi-tenancy | File-based isolation                 | Database-level with ACL          | **CRITICAL**   |
| Scalability   | Manual file creation                 | CMS-driven (AI + human editable) | **CRITICAL**   |

**Analysis**: PRD 1's static file approach contradicts the entire Payload CMS infrastructure already implemented in the codebase. The existing `PageRenderer` component expects Payload CMS data structures.

### 3. Custom Domain Strategy Conflict

| Aspect               | PRD 1 (Ceremonia)                                           | PRD 2 (Myxelium Existing) | Conflict Level |
| -------------------- | ----------------------------------------------------------- | ------------------------- | -------------- |
| Domain routing       | Middleware-based, maps `live.ceremoniacircle.org` to tenant | No custom domain support  | **HIGH**       |
| Domain configuration | `TENANT_DOMAINS` config in middleware                       | Not defined               | **HIGH**       |
| SSL/DNS              | Vercel custom domains                                       | Not defined               | **MEDIUM**     |

**Analysis**: PRD 2 does not address custom domain routing. This is a gap that needs to be filled, but it's not a conflict—it's an extension.

### 4. Middleware Logic Conflict

| Aspect                 | PRD 1 (Ceremonia)                                        | PRD 2 (Myxelium Existing) | Conflict Level |
| ---------------------- | -------------------------------------------------------- | ------------------------- | -------------- |
| Middleware             | New file: `src/middleware.ts` with tenant domain routing | No middleware defined     | **MEDIUM**     |
| Path blocking          | Blocks non-`/lp/*` paths on tenant domains               | Not applicable            | **LOW**        |
| Main domain protection | Blocks `/lp/*` on main domain                            | Not applicable            | **LOW**        |

**Analysis**: PRD 1 introduces middleware that doesn't exist in the codebase. This is additive but needs to integrate with existing routing.

---

## Unified Architecture Proposal

### Core Decision: Use Payload CMS + Add Custom Domain Routing

**Rationale**:

1. **Payload CMS infrastructure already implemented**: PageRenderer, components, types exist
2. **Dynamic content editing**: Payload admin provides superior UX vs. code changes
3. **Multi-tenant security**: Database-level isolation is more robust than file-based
4. **AI integration**: Existing LangGraph → Payload flow is production-ready
5. **Scalability**: CMS-driven approach supports unlimited tenants without code changes

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Domain Request                                   │
│                                                                          │
│  live.ceremoniacircle.org/lp/softening-the-season                      │
│  OR                                                                      │
│  myxelium.app/preview/ceremonia/softening-the-season                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Next.js Middleware                                  │
│                                                                          │
│  1. Extract host header                                                 │
│  2. Check TENANT_DOMAINS config                                         │
│  3. IF custom domain → Map to tenantId                                  │
│     - live.ceremoniacircle.org → tenantId: "ceremonia"                 │
│     - Rewrite: /lp/slug → /page/ceremonia/slug                         │
│  4. ELSE → Pass through (default routing)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Route Resolution                                      │
│                                                                          │
│  Custom Domain:                                                          │
│    /lp/slug → REWRITTEN TO → /page/ceremonia/slug                      │
│                                                                          │
│  Main Domain:                                                            │
│    /preview/ceremonia/slug → Direct route                              │
│    /page/ceremonia/slug → Direct route                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Next.js App Router (Existing Routes)                        │
│                                                                          │
│  app/preview/[tenantId]/[slug]/page.tsx  ← DRAFT PAGES                │
│  app/page/[tenantId]/[slug]/page.tsx     ← PUBLISHED PAGES            │
│                                                                          │
│  Both routes:                                                            │
│  1. Query Payload CMS: { tenantId, slug }                              │
│  2. Check _status (draft vs. published)                               │
│  3. Return PageData                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Payload CMS (PostgreSQL)                             │
│                                                                          │
│  Collection: pages                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ id: "page-ceremonia-001"                                        │   │
│  │ tenantId: "ceremonia"                                           │   │
│  │ slug: "softening-the-season"                                   │   │
│  │ title: "Softening the Season: 3 Simple Skills..."             │   │
│  │ designSystem: "untitledui"                                     │   │
│  │ _status: "published"                                           │   │
│  │ sections: [...]                                                │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       PageRenderer (Existing)                            │
│                                                                          │
│  const designSystem = page.designSystem || 'untitledui'                 │
│  const components = DESIGN_SYSTEM_COMPONENTS[designSystem]              │
│                                                                          │
│  Renders: <HeroSection>, <FeaturesSection>, <CTASection>, etc.         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### ADR-001: Use Payload CMS for Ceremonia Pages

**Context**: PRD 1 proposes static TypeScript files in `_pages/` directory. Payload CMS is already implemented and production-ready.

**Decision**: Ceremonia landing pages will be stored in Payload CMS with `tenantId: "ceremonia"`.

**Consequences**:

- ✅ **Positive**: Leverage existing infrastructure, no duplicate content systems
- ✅ **Positive**: Dynamic editing via Payload admin without deployments
- ✅ **Positive**: Multi-tenant security via database ACL
- ✅ **Positive**: AI-generated pages use same workflow as other tenants
- ❌ **Negative**: Requires Payload setup/credentials for Ceremonia team
- ⚠️ **Neutral**: Content is in database, not version-controlled as code

**Alternatives Considered**:

1. **Static TypeScript files** (PRD 1 proposal): Rejected—duplicates content system, no dynamic editing
2. **Hybrid approach** (files + CMS): Rejected—complexity, inconsistent editing UX
3. **Payload CMS** (PRD 2 existing): **SELECTED**—proven, scalable, maintainable

### ADR-002: Custom Domain Routing via Middleware

**Context**: Ceremonia requires `live.ceremoniacircle.org/lp/{slug}` as the canonical URL pattern, but existing routes use `/page/[tenantId]/[slug]`.

**Decision**: Implement Next.js middleware to rewrite custom domain requests to existing routes with tenantId injection.

**Consequences**:

- ✅ **Positive**: Clean URLs for custom domains (`/lp/slug` vs. `/page/ceremonia/slug`)
- ✅ **Positive**: No changes to existing route structure
- ✅ **Positive**: Scalable to multiple tenant domains
- ✅ **Positive**: SEO-friendly (custom domain + clean slug)
- ❌ **Negative**: Adds middleware layer (potential performance impact)
- ⚠️ **Neutral**: Requires DNS configuration per tenant domain

**Alternatives Considered**:

1. **Vercel rewrites** (in `vercel.json`): Rejected—less flexible, harder to test locally
2. **Custom route handlers**: Rejected—duplicates logic, increases maintenance
3. **Middleware rewrite** (proposed): **SELECTED**—flexible, testable, maintainable

### ADR-003: Route Pattern Alignment

**Context**: PRD 1 uses `/lp/[slug]`, PRD 2 uses `/page/[tenantId]/[slug]`. Need unified pattern.

**Decision**:

- **External URL** (custom domain): `/lp/{slug}` (rewritten by middleware)
- **Internal route**: `/page/[tenantId]/[slug]` (existing structure)
- **Preview route**: `/preview/[tenantId]/[slug]` (existing structure)

**Consequences**:

- ✅ **Positive**: Clean external URLs for marketing
- ✅ **Positive**: Consistent internal routing with existing system
- ✅ **Positive**: Preview URLs work for all tenants (including Ceremonia)
- ⚠️ **Neutral**: URL rewrite logic in middleware (additional code)

**Implementation**:

```typescript
// src/middleware.ts (NEW FILE)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TENANT_DOMAINS: Record<string, { tenantId: string; allowedPaths: string[] }> = {
  'live.ceremoniacircle.org': {
    tenantId: 'ceremonia',
    allowedPaths: ['/lp'],
  },
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const pathname = request.nextUrl.pathname;

  const tenantConfig = TENANT_DOMAINS[host];

  if (tenantConfig) {
    // Custom domain: rewrite /lp/slug → /page/{tenantId}/slug
    if (pathname.startsWith('/lp/')) {
      const slug = pathname.replace('/lp/', '');
      const rewriteUrl = new URL(`/page/${tenantConfig.tenantId}/${slug}`, request.url);
      return NextResponse.rewrite(rewriteUrl);
    }

    // Block non-allowed paths on custom domains
    const isAllowed = tenantConfig.allowedPaths.some((p) => pathname.startsWith(p));
    if (!isAllowed && pathname !== '/') {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### ADR-004: TenantId for Ceremonia

**Context**: Ceremonia is the first tenant. Need to establish tenantId convention.

**Decision**: `tenantId: "ceremonia"` (lowercase, alphanumeric, no special characters)

**Consequences**:

- ✅ **Positive**: Clear, memorable identifier
- ✅ **Positive**: Matches domain subdomain pattern (live.ceremoniacircle.org)
- ✅ **Positive**: Consistent with slug naming conventions

**Database Record Example**:

```json
{
  "_status": "published",
  "designSystem": "untitledui",
  "id": "page-ceremonia-001",
  "sections": [
    {
      "blockType": "hero",
      "title": "Softening the Season",
      "subtitle": "3 Simple Skills for Connection in the Chaos",
      "ctaLabel": "Join Us",
      "ctaHref": "#register"
    }
  ],
  "slug": "softening-the-season-3-simple-skills-for-connection-in-the-chaos",
  "tenantId": "ceremonia",
  "title": "Softening the Season: 3 Simple Skills for Connection in the Chaos",
  "userId": "user_ceremonia_admin"
}
```

### ADR-005: DNS and Domain Configuration

**Context**: Custom domain `live.ceremoniacircle.org` needs to resolve to Vercel deployment.

**Decision**: Use Vercel custom domains with CNAME DNS record.

**DNS Configuration**:

```
Type: CNAME
Name: live
Value: cname.vercel-dns.com
TTL: Auto
```

**Vercel Project Settings**:

- Add domain: `live.ceremoniacircle.org`
- Enable automatic HTTPS (Let's Encrypt)
- Configure production deployment

**Consequences**:

- ✅ **Positive**: Vercel handles SSL automatically
- ✅ **Positive**: Standard DNS pattern (CNAME)
- ⚠️ **Neutral**: Requires Ceremonia team to update DNS records

---

## Implementation Roadmap

### Phase 1: Infrastructure Setup (Days 1-2)

**Goal**: Establish Ceremonia tenant in existing system

**Tasks**:

1. ✅ **Payload CMS Verification**:
   - Verify Payload collections exist (`pages`, `users`)
   - Verify multi-tenant plugin configured
   - Verify database schema supports `tenantId` + `slug` composite index

2. ✅ **Create Ceremonia Tenant**:
   - Create user in Payload: `email: admin@ceremoniacircle.org`, `tenantId: ceremonia`
   - Set role: `user` (or `admin` if global visibility needed)
   - Test login to Payload admin

3. ✅ **Test Existing Routes**:
   - Create test page via Payload admin: `tenantId: ceremonia`, `slug: test-page`
   - Verify preview: `/preview/ceremonia/test-page`
   - Verify published: `/page/ceremonia/test-page` (after publishing)

**Success Criteria**:

- [ ] Ceremonia tenant exists in Payload
- [ ] Can create pages via Payload admin
- [ ] Pages render correctly at `/preview/ceremonia/{slug}` and `/page/ceremonia/{slug}`

### Phase 2: Middleware Implementation (Days 3-4)

**Goal**: Add custom domain routing

**Tasks**:

1. ✅ **Create Middleware**:
   - File: `src/middleware.ts`
   - Implement domain-to-tenantId mapping
   - Implement URL rewriting: `/lp/slug` → `/page/ceremonia/slug`
   - Add path blocking for non-allowed paths

2. ✅ **Test Middleware Locally**:
   - Add `live.ceremoniacircle.org` to `/etc/hosts` (points to localhost)
   - Run Next.js dev server
   - Test URL: `http://live.ceremoniacircle.org:3000/lp/test-page`
   - Verify rewrite to `/page/ceremonia/test-page`

3. ✅ **Add Tests**:
   - Unit tests for middleware logic
   - Integration tests for URL rewriting
   - Security tests (path blocking, cross-tenant isolation)

**Success Criteria**:

- [ ] Middleware file created and functional
- [ ] Custom domain requests rewrite correctly
- [ ] Non-allowed paths blocked on custom domain
- [ ] All tests passing

### Phase 3: First Landing Page (Days 5-6)

**Goal**: Create Ceremonia's first landing page

**Tasks**:

1. ✅ **Create Page in Payload**:
   - Title: "Softening the Season: 3 Simple Skills for Connection in the Chaos"
   - Slug: `softening-the-season-3-simple-skills-for-connection-in-the-chaos`
   - TenantId: `ceremonia`
   - Design System: `untitledui`
   - Sections:
     - Hero: Title, subtitle, CTA
     - Features: Key benefits
     - CTA: Registration prompt

2. ✅ **Content Population**:
   - Work with Ceremonia team to populate sections
   - Add images (if applicable)
   - Test mobile responsiveness

3. ✅ **Publish Workflow**:
   - Save as draft
   - Review at `/preview/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos`
   - Publish via Payload admin
   - Verify at `/page/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos`

**Success Criteria**:

- [ ] Page created in Payload with correct tenantId
- [ ] Content populated and reviewed
- [ ] Page published and accessible

### Phase 4: Domain Configuration (Days 7-8)

**Goal**: Configure custom domain and verify production deployment

**Tasks**:

1. ✅ **DNS Configuration**:
   - Ceremonia team creates CNAME: `live.ceremoniacircle.org` → `cname.vercel-dns.com`
   - Verify DNS propagation: `dig live.ceremoniacircle.org`

2. ✅ **Vercel Configuration**:
   - Add domain in Vercel project settings
   - Verify SSL certificate issued
   - Deploy to production

3. ✅ **Production Verification**:
   - Test URL: `https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos`
   - Verify page renders correctly
   - Verify HTTPS works
   - Test mobile responsiveness

**Success Criteria**:

- [ ] DNS configured and propagated
- [ ] Vercel domain added and SSL active
- [ ] Production page accessible at custom domain
- [ ] HTTPS active and verified

### Phase 5: Testing & Documentation (Days 9-10)

**Goal**: Comprehensive testing and documentation

**Tasks**:

1. ✅ **Testing**:
   - E2E tests for custom domain routing
   - Security tests (cross-tenant isolation)
   - Performance tests (page load time < 3s)
   - Mobile responsiveness tests

2. ✅ **Documentation**:
   - Update PRD 1 with Payload CMS approach
   - Create "Adding New Landing Pages" guide
   - Create "Custom Domain Setup" guide
   - Update architectural docs

3. ✅ **Handoff**:
   - Train Ceremonia team on Payload admin
   - Provide credentials securely
   - Document content editing workflow

**Success Criteria**:

- [ ] All tests passing (unit, integration, E2E)
- [ ] Documentation complete and reviewed
- [ ] Ceremonia team trained and able to edit content

---

## Modified File Structure

```
src/
├── middleware.ts                           # NEW: Custom domain routing
├── app/
│   ├── (backend)/                          # Existing: API routes
│   ├── [variants]/                         # Existing: LobeChat main app
│   ├── preview/                            # Existing: Preview route
│   │   └── [tenantId]/
│   │       └── [slug]/
│   │           └── page.tsx                # Fetches draft + published pages
│   └── page/                               # Existing: Published route
│       └── [tenantId]/
│           └── [slug]/
│               └── page.tsx                # Fetches published pages only
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

**Note**: The `(tenants)` route group from PRD 1 is **NOT CREATED**. We use the existing `/preview/` and `/page/` routes.

---

## URL Mapping Reference

### Ceremonia Custom Domain

| User-Facing URL                                    | Internal Route                         | Payload Query                                                                   |
| -------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| `live.ceremoniacircle.org/lp/softening-the-season` | `/page/ceremonia/softening-the-season` | `{ tenantId: "ceremonia", slug: "softening-the-season", _status: "published" }` |
| `live.ceremoniacircle.org/`                        | → 404 or redirect to default page      | N/A                                                                             |
| `live.ceremoniacircle.org/chat`                    | → 404 (blocked by middleware)          | N/A                                                                             |

### Main Domain (myxelium.app or lobe-builder.vercel.app)

| User-Facing URL                                       | Internal Route                            | Payload Query                                                                   |
| ----------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| `myxelium.app/preview/ceremonia/softening-the-season` | `/preview/ceremonia/softening-the-season` | `{ tenantId: "ceremonia", slug: "softening-the-season", draft: true }`          |
| `myxelium.app/page/ceremonia/softening-the-season`    | `/page/ceremonia/softening-the-season`    | `{ tenantId: "ceremonia", slug: "softening-the-season", _status: "published" }` |
| `myxelium.app/lp/anything`                            | → 404 (blocked by middleware)             | N/A                                                                             |

---

## Security Considerations

### 1. Multi-Tenant Isolation

**Threat**: Tenant A accessing Tenant B's content via URL manipulation

**Mitigation**:

- Payload CMS access control enforces `tenantId` filtering
- Middleware does NOT bypass Payload security—only rewrites URLs
- Custom domain mapping is static (no user input)
- Database composite index: `(tenantId, slug)` ensures per-tenant slug uniqueness

**Test**:

```typescript
// Attempt cross-tenant access
await page.goto('https://live.ceremoniacircle.org/lp/other-tenant-page');
// Expected: 404 (page not found in ceremonia tenant)
```

### 2. Path Traversal

**Threat**: Accessing non-allowed paths via custom domain

**Mitigation**:

- Middleware blocks all paths except `/lp/*` on custom domains
- Returns 404 for blocked paths (not 403 to avoid information leakage)

**Test**:

```typescript
await page.goto('https://live.ceremoniacircle.org/../admin');
// Expected: 404
```

### 3. DNS Hijacking

**Threat**: Attacker hijacks custom domain DNS

**Mitigation**:

- Vercel domain verification (ownership check before activation)
- HTTPS enforced (SSL certificate tied to verified domain)
- DNSSEC recommended for Ceremonia's domain registrar

---

## Performance Considerations

### 1. Middleware Performance

**Concern**: Middleware adds latency to every request

**Mitigation**:

- Middleware logic is lightweight (string matching + Map lookup)
- No external API calls or database queries
- Estimated overhead: < 5ms

**Benchmark Target**: P95 < 10ms for middleware execution

### 2. Page Load Performance

**Target**: < 3 seconds (from PRD 1)

**Strategy**:

- Use Next.js ISR (Incremental Static Regeneration) for published pages
- Cache Payload API responses
- Optimize images with `next/image`
- CDN caching (Vercel Edge Network)

**Metrics**:

- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1

### 3. Database Query Optimization

**Payload Queries**:

```typescript
// Optimized query with composite index
await payload.find({
  collection: 'pages',
  where: {
    tenantId: { equals: 'ceremonia' }, // Indexed
    slug: { equals: 'softening-the-season' }, // Indexed
    _status: { equals: 'published' }, // Indexed
  },
  limit: 1,
});
```

**Index Strategy**:

- Composite index: `(tenantId, slug)` (unique)
- Single index: `_status`
- Query execution time: < 50ms (P95)

---

## Monitoring & Observability

### 1. Middleware Monitoring

**Metrics**:

- Request rate per domain (custom vs. main)
- Middleware execution time (P50, P95, P99)
- Rewrite success/failure rate
- Path blocking rate (404s on custom domain)

**Alerts**:

- Middleware execution time > 50ms (P95)
- Rewrite failure rate > 1%

### 2. Page Performance Monitoring

**Metrics**:

- Page load time (FCP, LCP, CLS)
- API response time (Payload queries)
- Error rate (4xx, 5xx)
- Cache hit rate (CDN, ISR)

**Alerts**:

- Page load time > 3s (P95)
- Error rate > 1%

### 3. Security Monitoring

**Metrics**:

- Cross-tenant access attempts (denied queries)
- Path traversal attempts (blocked requests)
- Invalid domain requests (TENANT_DOMAINS misses)

**Alerts**:

- Cross-tenant access attempts > 10/hour
- Path traversal attempts > 5/hour

---

## Testing Strategy

### 1. Unit Tests

**Middleware**:

```typescript
describe('middleware', () => {
  it('rewrites custom domain /lp/slug to /page/tenantId/slug', () => {
    const request = new NextRequest('https://live.ceremoniacircle.org/lp/test-page');
    const response = middleware(request);
    expect(response.url).toBe('https://live.ceremoniacircle.org/page/ceremonia/test-page');
  });

  it('blocks non-allowed paths on custom domain', () => {
    const request = new NextRequest('https://live.ceremoniacircle.org/admin');
    const response = middleware(request);
    expect(response.url).toContain('/404');
  });
});
```

### 2. Integration Tests

**Page Rendering**:

```typescript
describe('Ceremonia landing pages', () => {
  it('renders page at custom domain URL', async () => {
    const page = await createTestPage({ tenantId: 'ceremonia', slug: 'test-page' });
    const response = await fetch('https://live.ceremoniacircle.org/lp/test-page');
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain(page.title);
  });
});
```

### 3. E2E Tests

**User Journey**:

```typescript
test('Ceremonia user creates and publishes page', async ({ page }) => {
  // 1. Login to Payload
  await page.goto('/admin');
  await login(page, 'admin@ceremoniacircle.org', 'password');

  // 2. Create page
  await page.click('text=Pages');
  await page.click('text=Create New');
  await page.fill('[name="title"]', 'Test Landing Page');
  await page.fill('[name="slug"]', 'test-landing-page');

  // 3. Add hero section
  await page.click('text=Add Block');
  await page.click('text=Hero Section');
  await page.fill('[name="sections.0.title"]', 'Welcome');

  // 4. Save as draft
  await page.click('button[type="submit"]');

  // 5. Preview
  await page.goto('https://live.ceremoniacircle.org/lp/test-landing-page');
  await expect(page.locator('h1')).toContainText('Welcome');

  // 6. Publish
  await page.goto('/admin/collections/pages/{pageId}');
  await page.click('text=Publish');

  // 7. Verify published
  await page.goto('https://live.ceremoniacircle.org/lp/test-landing-page');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

---

## Migration Path from PRD 1 Static Files

**If PRD 1 static files were already implemented** (they are not in this case), here's the migration path:

### Step 1: Export Static Pages to JSON

```typescript
// scripts/export-static-pages.ts
import { LANDING_PAGES } from '@/app/(tenants)/lp/_pages';

async function exportPages() {
  const pages = [];
  for (const [slug, loader] of Object.entries(LANDING_PAGES)) {
    const { page } = await loader();
    pages.push({
      tenantId: 'ceremonia',
      slug,
      title: page.title,
      description: page.description,
      sections: page.sections,
    });
  }
  fs.writeFileSync('static-pages-export.json', JSON.stringify(pages, null, 2));
}
```

### Step 2: Import to Payload CMS

```typescript
// scripts/import-to-payload.ts
import { getPayloadClient } from '@/libs/payload/client';

import pages from './static-pages-export.json';

async function importPages() {
  const payload = await getPayloadClient();

  for (const pageData of pages) {
    await payload.create({
      collection: 'pages',
      data: {
        tenantId: pageData.tenantId,
        slug: pageData.slug,
        title: pageData.title,
        designSystem: 'untitledui',
        _status: 'draft',
        sections: pageData.sections.map((section) => ({
          blockType: section.type,
          ...section,
        })),
      },
    });
  }
}
```

### Step 3: Verify and Delete Static Files

```bash
# Verify all pages imported
psql -c "SELECT tenantId, slug, title FROM payload_pages WHERE tenantId = 'ceremonia';"

# Delete static files
rm -rf src/app/(tenants)
```

---

## Open Questions & Decisions Needed

### 1. Root Path Behavior on Custom Domain

**Question**: What should `https://live.ceremoniacircle.org/` display?

**Options**:

- A) Redirect to a default landing page (e.g., `/lp/home`)
- B) Display a static "Welcome to Ceremonia" page
- C) Return 404

**Recommendation**: **Option A** - Redirect to `/lp/home` (a designated default page in Payload)

**Implementation**:

```typescript
// In middleware.ts
if (pathname === '/' && tenantConfig) {
  return NextResponse.redirect(new URL('/lp/home', request.url));
}
```

### 2. Subdomain vs. Path for Multiple Domains

**Question**: Should future tenants use:

- A) Subdomains: `{tenant}.myxelium.app/slug`
- B) Custom domains: `{tenant-domain}/lp/slug`
- C) Both

**Recommendation**: **Option C** - Support both patterns via middleware configuration

**Implementation**:

```typescript
const TENANT_DOMAINS = {
  'live.ceremoniacircle.org': { tenantId: 'ceremonia', pathPrefix: '/lp' },
  'acme.myxelium.app': { tenantId: 'acme-corp', pathPrefix: '' }, // No prefix
};
```

### 3. Payload Admin Access for Tenants

**Question**: Should tenants access Payload admin directly or via a branded wrapper?

**Recommendation**: **Phase 1** - Direct Payload admin access. **Phase 2** - Consider embedded iframe or custom UI.

**Rationale**:

- Direct access is faster to implement
- Payload admin is feature-rich and well-designed
- Custom UI adds significant development time

---

## Success Criteria

### Phase 1 Completion (Infrastructure)

- [ ] Ceremonia tenant created in Payload
- [ ] Test page created and renders at `/preview/ceremonia/test-page`
- [ ] Test page publishes and renders at `/page/ceremonia/test-page`

### Phase 2 Completion (Middleware)

- [ ] Middleware file created
- [ ] Custom domain requests rewrite correctly
- [ ] Path blocking works on custom domain
- [ ] All middleware tests passing

### Phase 3 Completion (First Page)

- [ ] "Softening the Season" page created in Payload
- [ ] Content populated and reviewed
- [ ] Page published successfully

### Phase 4 Completion (Domain Configuration)

- [ ] DNS configured: `live.ceremoniacircle.org` → Vercel
- [ ] SSL certificate active
- [ ] Production page accessible at `https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos`

### Phase 5 Completion (Testing & Documentation)

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Documentation complete
- [ ] Ceremonia team trained

---

## Appendix A: Environment Variables

```bash
# Existing (from PRD 2)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PAYLOAD_SECRET=your-secret-key

# New (for custom domains)
# None required - domain mapping is in code (src/middleware.ts)
```

---

## Appendix B: DNS Records

### Ceremonia Domain Configuration

**Domain**: ceremoniacircle.org
**Subdomain**: live

**DNS Records**:

```
Type: CNAME
Name: live
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

**Verification**:

```bash
dig live.ceremoniacircle.org
# Should return CNAME to Vercel
```

---

## Appendix C: Related Documents

- **PRD 1 (Original)**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0.md`
- **PRD 1 (Modified)**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0-unified.md` (to be created)
- **PRD 2 (Existing)**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
- **Multi-Design System Architecture**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/multi-design-system-architecture.md`
- **Existing PageRenderer**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/src/components/PageRenderer/`

---

**Document Status**: APPROVED
**Next Action**: Modify PRD 1 to align with unified architecture
**Owner**: Austin Mao
**Review Date**: 2025-12-10
