# Architectural Decision Summary: Ceremonia Landing Pages Integration

**Date**: 2025-12-10
**Decision**: APPROVED
**Status**: Ready for Implementation

---

## Executive Summary

After analyzing PRD 1 (Ceremonia Landing Page System) and PRD 2 (Myxelium Multi-Tenant Page Builder with Payload CMS), we have identified critical architectural conflicts and propose a **unified architecture** that:

1. ✅ **Leverages existing Payload CMS infrastructure** (no duplicate content systems)
2. ✅ **Adds custom domain routing via middleware** (clean URLs for Ceremonia)
3. ✅ **Maintains existing PageRenderer and component system** (zero code duplication)
4. ✅ **Preserves multi-tenant security** (database-level ACL)
5. ✅ **Enables dynamic content editing** (Payload admin, no deployments)

---

## Critical Conflicts Identified

### 1. Content Storage Conflict (CRITICAL)

| PRD 1 (Original)                     | PRD 2 (Existing)         | Resolution                                          |
| ------------------------------------ | ------------------------ | --------------------------------------------------- |
| Static TypeScript files in `_pages/` | Payload CMS + PostgreSQL | **Use Payload CMS** - infrastructure already exists |

**Rationale**: The existing codebase has a fully implemented Payload CMS system with PageRenderer, multi-tenant security, and AI integration. Creating a parallel static file system would:

- ❌ Duplicate content storage logic
- ❌ Create inconsistent editing experiences
- ❌ Require manual deployments for content changes
- ❌ Break AI-generated page workflow

### 2. Route Pattern Conflict (HIGH)

| PRD 1 (Original)      | PRD 2 (Existing)                                           | Resolution                                               |
| --------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| `(tenants)/lp/[slug]` | `/preview/[tenantId]/[slug]` and `/page/[tenantId]/[slug]` | **Middleware rewrite** - custom domain → existing routes |

**Rationale**: The existing `/page/[tenantId]/[slug]` route structure is production-ready and supports:

- ✅ Multi-tenant isolation via `tenantId` in URL
- ✅ Draft vs. published workflow (`_status` field)
- ✅ Per-tenant slug uniqueness (composite index)
- ✅ SEO-friendly URLs when combined with custom domain routing

### 3. Custom Domain Strategy (NEW FEATURE)

| PRD 1 (Original)                | PRD 2 (Existing) | Resolution                                                |
| ------------------------------- | ---------------- | --------------------------------------------------------- |
| Middleware-based domain routing | Not defined      | **Implement middleware** - additive feature, no conflicts |

**Rationale**: PRD 2 does not address custom domain routing. This is a gap that needs to be filled. Middleware provides:

- ✅ Clean external URLs: `live.ceremoniacircle.org/lp/slug`
- ✅ Tenant identification via domain (not URL path)
- ✅ Path blocking for security (only `/lp/*` allowed on custom domain)
- ✅ Scalable to multiple tenant domains

---

## Unified Architecture

### Architecture Diagram

```
External Request:
  live.ceremoniacircle.org/lp/softening-the-season
                    ↓
         Next.js Middleware
         (src/middleware.ts)
                    ↓
    URL Rewrite: /lp/slug → /page/ceremonia/slug
                    ↓
         Next.js App Router
    (app/page/[tenantId]/[slug]/page.tsx)
                    ↓
           Payload CMS Query
    { tenantId: "ceremonia", slug, _status: "published" }
                    ↓
          PageRenderer Component
      (src/components/PageRenderer/)
                    ↓
    Untitled UI Components (Existing)
         (HeroSection, FeaturesSection, etc.)
                    ↓
            Rendered Page
```

### Key Components

1. **Middleware** (`src/middleware.ts` - NEW):
   - Maps `live.ceremoniacircle.org` → `tenantId: ceremonia`
   - Rewrites `/lp/{slug}` → `/page/ceremonia/{slug}`
   - Blocks non-allowed paths on custom domain

2. **Payload CMS** (EXISTING):
   - Stores pages with `tenantId: ceremonia`
   - Multi-tenant plugin enforces ACL
   - Draft/published workflow via `_status` field

3. **PageRenderer** (EXISTING):
   - Renders Payload data using Untitled UI components
   - Supports multiple design systems
   - Type-safe block-to-component mapping

4. **Routes** (EXISTING):
   - `/preview/[tenantId]/[slug]` - Draft + published pages
   - `/page/[tenantId]/[slug]` - Published pages only

---

## Key Decisions

### Decision 1: Use Payload CMS (Not Static Files)

**Context**: PRD 1 proposes static TypeScript files. Payload CMS is already implemented.

**Decision**: Ceremonia landing pages will be stored in Payload CMS with `tenantId: "ceremonia"`.

**Consequences**:

- ✅ Leverage existing infrastructure (PageRenderer, components, types)
- ✅ Dynamic editing via Payload admin (no deployments)
- ✅ Multi-tenant security via database ACL
- ✅ AI-generated pages use same workflow
- ❌ Requires Payload setup/training for Ceremonia team
- ⚠️ Content is in database, not version-controlled as code

**Alternatives Rejected**:

1. Static TypeScript files - Duplicates content system
2. Hybrid approach - Too complex, inconsistent UX

### Decision 2: Middleware-Based Custom Domain Routing

**Context**: Ceremonia requires `live.ceremoniacircle.org/lp/{slug}` URLs, but existing routes use `/page/[tenantId]/[slug]`.

**Decision**: Implement Next.js middleware to rewrite custom domain requests to existing routes.

**Consequences**:

- ✅ Clean URLs for custom domains (`/lp/slug` vs. `/page/ceremonia/slug`)
- ✅ No changes to existing route structure
- ✅ Scalable to multiple tenant domains
- ✅ SEO-friendly (custom domain + clean slug)
- ❌ Adds middleware layer (potential performance impact < 10ms)
- ⚠️ Requires DNS configuration per tenant

**Alternatives Rejected**:

1. Vercel rewrites - Less flexible, harder to test locally
2. Custom route handlers - Duplicates logic

### Decision 3: TenantId = "ceremonia"

**Context**: Ceremonia is the first tenant.

**Decision**: Use `tenantId: "ceremonia"` (lowercase, alphanumeric).

**Consequences**:

- ✅ Clear, memorable identifier
- ✅ Matches domain pattern (live.ceremoniacircle.org)
- ✅ Consistent with slug naming conventions

---

## Implementation Roadmap

### Phase 1: Infrastructure Setup (Days 1-2)

- Create Ceremonia tenant in Payload
- Create test page and verify existing routes
- **Success**: Test page renders at `/preview/ceremonia/test-page` and `/page/ceremonia/test-page`

### Phase 2: Middleware Implementation (Days 3-4)

- Create `src/middleware.ts` with domain mapping
- Implement URL rewriting and path blocking
- Add tests (unit, integration, security)
- **Success**: Custom domain requests rewrite correctly, tests pass

### Phase 3: First Landing Page (Day 5)

- Create "Softening the Season" page in Payload
- Populate content (Hero, Features, CTA sections)
- Publish and verify
- **Success**: Page accessible at `https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos`

### Phase 4: Domain Configuration (Day 6)

- Ceremonia team configures DNS (CNAME: `live` → `cname.vercel-dns.com`)
- Add domain in Vercel project settings
- Deploy to production
- **Success**: SSL active, production page accessible

### Phase 5: Documentation & Handoff (Day 7)

- Create user guides (Adding Pages, Editing, Publishing)
- Train Ceremonia team on Payload admin
- Provide credentials securely
- **Success**: Ceremonia team can independently create/edit pages

---

## Modified File Structure

```
src/
├── middleware.ts                           # NEW: Custom domain routing
├── app/
│   ├── preview/[tenantId]/[slug]/          # EXISTING: Preview route
│   └── page/[tenantId]/[slug]/             # EXISTING: Published route
├── components/
│   └── PageRenderer/                       # EXISTING: Multi-design system renderer
└── libs/
    └── payload/                            # EXISTING: Payload CMS config

DELETED (from original PRD):
- app/(tenants)/lp/[slug]/page.tsx          # NOT CREATED
- app/(tenants)/lp/_pages/                  # NOT CREATED
- app/(tenants)/lp/_components/             # NOT CREATED
```

---

## URL Mapping Reference

### Ceremonia Custom Domain

| External URL                       | Internal Route         | Payload Query                                           |
| ---------------------------------- | ---------------------- | ------------------------------------------------------- |
| `live.ceremoniacircle.org/lp/slug` | `/page/ceremonia/slug` | `{ tenantId: "ceremonia", slug, _status: "published" }` |
| `live.ceremoniacircle.org/`        | → 404 or redirect      | N/A                                                     |
| `live.ceremoniacircle.org/chat`    | → 404 (blocked)        | N/A                                                     |

### Main Domain

| External URL                          | Internal Route            | Payload Query                                           |
| ------------------------------------- | ------------------------- | ------------------------------------------------------- |
| `myxelium.app/preview/ceremonia/slug` | `/preview/ceremonia/slug` | `{ tenantId: "ceremonia", slug, draft: true }`          |
| `myxelium.app/page/ceremonia/slug`    | `/page/ceremonia/slug`    | `{ tenantId: "ceremonia", slug, _status: "published" }` |
| `myxelium.app/lp/slug`                | → 404 (blocked)           | N/A                                                     |

---

## Security Considerations

1. **Multi-Tenant Isolation**: Payload ACL enforces `tenantId` filtering at database level
2. **Path Traversal**: Middleware blocks non-allowed paths on custom domains
3. **Cross-Tenant Access**: Composite index `(tenantId, slug)` + ACL prevents cross-tenant reads
4. **DNS Hijacking**: Vercel domain verification prevents unauthorized domain takeover

---

## Success Criteria

### Phase 1 Completion

- [ ] Ceremonia tenant created in Payload
- [ ] Test page renders at `/preview/ceremonia/test-page`
- [ ] Test page renders at `/page/ceremonia/test-page` after publishing

### Phase 2 Completion

- [ ] Middleware file created
- [ ] Custom domain requests rewrite correctly
- [ ] Path blocking works on custom domain
- [ ] All tests passing

### Phase 3 Completion

- [ ] First page created in Payload
- [ ] Content populated and reviewed
- [ ] Page published successfully

### Phase 4 Completion

- [ ] DNS configured and propagated
- [ ] SSL active on custom domain
- [ ] Production page accessible at `https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos`

### Phase 5 Completion

- [ ] Documentation complete
- [ ] Ceremonia team trained
- [ ] Credentials provided securely

---

## Next Steps

1. **Review and approve this document** with stakeholders
2. **Begin Phase 1** (Infrastructure Setup)
3. **Create Ceremonia tenant** in Payload CMS
4. **Implement middleware** for custom domain routing
5. **Create first landing page** with Ceremonia team
6. **Configure DNS** and deploy to production

---

## Related Documents

- **Architectural Compatibility Analysis** (detailed): `/Users/austinmao/Documents/GitHub/lobe-builder/docs/architectural-compatibility-analysis.md`
- **Modified PRD 1** (Unified Architecture): `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0-unified.md`
- **Original PRD 1**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0.md`
- **PRD 2** (Myxelium Page Builder): `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
- **Multi-Design System Architecture**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/multi-design-system-architecture.md`
- **Existing PageRenderer**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/src/components/PageRenderer/`

---

**Document Status**: APPROVED
**Architecture Decision**: Use Payload CMS + Middleware Routing
**Next Action**: Begin Phase 1 Implementation
**Owner**: Austin Mao
**Review Date**: 2025-12-10
