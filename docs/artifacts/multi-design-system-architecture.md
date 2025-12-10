# Multi-Design System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            User Request                                  │
│                                                                          │
│  AI: "Create landing page with Untitled UI"                            │
│  OR                                                                      │
│  AI: "Create landing page with Shadcn UI"                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        LangGraph Agent                                   │
│                                                                          │
│  Generates PageSpec:                                                    │
│  {                                                                       │
│    tenantId: "acme-corp",                                               │
│    slug: "landing",                                                     │
│    title: "Landing Page",                                               │
│    designSystem: "untitledui" | "shadcn",  ← NEW FIELD                 │
│    sections: [...]                                                      │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    POST /api/pages/create                               │
│                                                                          │
│  1. Validate PageSpec (Zod schema)                                     │
│  2. Check designSystem in ['untitledui', 'shadcn']                     │
│  3. Check tenantId authorization                                       │
│  4. Create page in Payload CMS                                         │
│  5. Return { id, tenantId, slug }                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Payload CMS Storage                              │
│                    (PostgreSQL Database)                                 │
│                                                                          │
│  Collection: pages                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ id: "page-123"                                                 │   │
│  │ tenantId: "acme-corp"                                          │   │
│  │ slug: "landing"                                                │   │
│  │ title: "Landing Page"                                          │   │
│  │ designSystem: "untitledui"  ← STORED                          │   │
│  │ _status: "draft" | "published"  ← Payload CMS field          │   │
│  │ sections: [                                                    │   │
│  │   { blockType: "hero", title: "...", ... }                    │   │
│  │ ]                                                              │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Route Selection                                  │
│                                                                          │
│  Preview Route (Draft + Published):                                     │
│  /preview/[tenantId]/[slug]                                             │
│  ↓                                                                       │
│  Fetches page with draft: true                                          │
│                                                                          │
│  Published Route (Published Only):                                      │
│  /page/[tenantId]/[slug]                                                │
│  ↓                                                                       │
│  Fetches page with _status: "published"                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       PageRenderer Component                             │
│                                                                          │
│  const designSystem = page.designSystem || 'untitledui'                 │
│  const components = DESIGN_SYSTEM_COMPONENTS[designSystem]              │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  DESIGN_SYSTEM_COMPONENTS = {                                    │  │
│  │    untitledui: {                                                 │  │
│  │      hero: UntitledUIHeroSection,        ◄─── Isolated          │  │
│  │      features: UntitledUIFeaturesSection,                        │  │
│  │      cta: UntitledUICTASection,                                  │  │
│  │    },                                                            │  │
│  │    shadcn: {                                                     │  │
│  │      hero: ShadcnHeroSection,            ◄─── Isolated          │  │
│  │      features: ShadcnFeaturesSection,                            │  │
│  │      cta: ShadcnCTASection,                                      │  │
│  │    },                                                            │  │
│  │  }                                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Component Selection Logic                            │
│                                                                          │
│  page.sections.map((section) => {                                       │
│    const Component = components[section.blockType]                      │
│    return <Component {...section} />                                    │
│  })                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│   Untitled UI Components        │  │   Shadcn UI Components           │
│                                  │  │                                  │
│  <UntitledUIHeroSection>        │  │  <ShadcnHeroSection>            │
│    - Uses Untitled UI tokens    │  │    - Uses Shadcn classes        │
│    - Inter font                  │  │    - Tailwind utilities         │
│    - --color-brand-500          │  │    - inline-flex                │
│  </UntitledUIHeroSection>       │  │  </ShadcnHeroSection>           │
│                                  │  │                                  │
│  <UntitledUIFeaturesSection>    │  │  <ShadcnFeaturesSection>        │
│  <UntitledUICTASection>         │  │  <ShadcnCTASection>             │
└─────────────────────────────────┘  └─────────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Rendered Page                                     │
│                                                                          │
│  <main>                                                                  │
│    <section class="untitled-ui-hero">  ← OR class="shadcn-hero"        │
│      <h1>Grow your users. Smarter.</h1>                                │
│      <button>Get Started</button>                                       │
│    </section>                                                            │
│    <section class="untitled-ui-features"> ← OR class="shadcn-features" │
│      ...                                                                 │
│    </section>                                                            │
│  </main>                                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Directory Structure

```
src/components/PageRenderer/
├── index.tsx                          # Main renderer with design system selection
│   ├── DESIGN_SYSTEM_COMPONENTS mapping
│   └── PageRenderer component
│
└── sections/
    ├── untitled-ui/                   # Untitled UI implementation
    │   ├── HeroSection.tsx
    │   │   └── Uses: @untitledui/react, Untitled UI tokens
    │   ├── FeaturesSection.tsx
    │   ├── CTASection.tsx
    │   ├── TextSection.tsx
    │   └── index.ts
    │
    └── shadcn/                        # Shadcn UI implementation
        ├── HeroSection.tsx
        │   └── Uses: shadcn components, Tailwind utilities
        ├── FeaturesSection.tsx
        ├── CTASection.tsx
        ├── TextSection.tsx
        └── index.ts
```

## Data Flow Example

### Untitled UI Page Creation

```
1. AI Request:
   "Create a landing page for meditation retreat using Untitled UI"

2. PageSpec Generation:
   {
     tenantId: "zen-retreat",
     slug: "meditation-2025",
     title: "Meditation Retreat",
     designSystem: "untitledui",  ← Specified by AI
     sections: [
       {
         type: "hero",
         title: "Find Inner Peace",
         subtitle: "Join our 2025 meditation retreat",
         ctaLabel: "Apply Now"
       }
     ]
   }

3. API Validation:
   ✅ designSystem = "untitledui" (valid)
   ✅ tenantId = "zen-retreat" (authorized)
   ✅ sections array valid

4. Payload CMS Storage:
   CREATE pages {
     tenantId: "zen-retreat",
     slug: "meditation-2025",
     designSystem: "untitledui",  ← Stored in DB
     _status: "draft"
   }

5. Preview Route:
   /preview/zen-retreat/meditation-2025
   ↓
   Fetches page from Payload (draft: true)
   ↓
   PageRenderer selects: DESIGN_SYSTEM_COMPONENTS['untitledui']
   ↓
   Renders: <UntitledUIHeroSection title="Find Inner Peace" ... />

6. Published Route:
   PATCH /api/pages/{id}/publish { _status: "published" }
   ↓
   /page/zen-retreat/meditation-2025
   ↓
   Fetches page from Payload (_status: "published")
   ↓
   Renders same Untitled UI components
```

### Shadcn UI Page Creation

```
1. AI Request:
   "Create a SaaS landing page using Shadcn UI"

2. PageSpec Generation:
   {
     tenantId: "saas-startup",
     slug: "product-launch",
     title: "Product Launch",
     designSystem: "shadcn",  ← Specified by AI
     sections: [
       {
         type: "hero",
         title: "Ship faster with our tools",
         ctaLabel: "Get Started"
       }
     ]
   }

3. API Validation:
   ✅ designSystem = "shadcn" (valid)

4. Payload CMS Storage:
   designSystem: "shadcn"  ← Stored in DB

5. PageRenderer Logic:
   DESIGN_SYSTEM_COMPONENTS['shadcn']
   ↓
   Renders: <ShadcnHeroSection title="Ship faster..." ... />
   ↓
   Uses Shadcn button component with Tailwind classes
```

## Tenant Isolation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Tenant Isolation                                 │
└─────────────────────────────────────────────────────────────────────────┘

Tenant A (acme-corp):
  Page: /preview/acme-corp/landing
  ↓
  Payload Query: {
    tenantId: { equals: "acme-corp" },
    slug: { equals: "landing" }
  }
  ↓
  Returns: Tenant A's page ✅

Tenant B (widget-inc):
  Attempts: /preview/acme-corp/landing  ← Cross-tenant access
  ↓
  Payload Query: {
    tenantId: { equals: "acme-corp" },  ← Mismatch!
    slug: { equals: "landing" }
  }
  ↓
  Payload Access Control:
    user.tenantId = "widget-inc"
    doc.tenantId = "acme-corp"
    ❌ BLOCKED
  ↓
  Returns: 404 Page Not Found ✅
```

## Design System Extensibility

### Adding Material UI (Future)

```
1. Create components:
   src/components/PageRenderer/sections/material-ui/
   ├── HeroSection.tsx
   ├── FeaturesSection.tsx
   └── CTASection.tsx

2. Update DESIGN_SYSTEM_COMPONENTS:
   const DESIGN_SYSTEM_COMPONENTS = {
     untitledui: { ... },
     shadcn: { ... },
     'material-ui': {  ← ADD
       hero: MaterialUIHeroSection,
       features: MaterialUIFeaturesSection,
       cta: MaterialUICTASection,
     },
   }

3. Update PageSpec type:
   interface PageSpec {
     designSystem: 'untitledui' | 'shadcn' | 'material-ui';  ← ADD
     ...
   }

4. Update validation schema:
   const pageSpecSchema = z.object({
     designSystem: z.enum(['untitledui', 'shadcn', 'material-ui']),  ← ADD
     ...
   })

5. Deploy and use:
   AI can now specify: designSystem: "material-ui"
```

## Key Architectural Decisions

### 1. Design System Field Location

**Decision:** Store `designSystem` in PageSpec (top-level)
**Rationale:**

- Page-level decision (not section-level)
- Simplifies component selection
- Easier to migrate pages between systems
- Clear API contract

### 2. Component Mapping Strategy

**Decision:** Object mapping vs. dynamic imports
**Rationale:**

- Static object is faster (no async)
- Type-safe with TypeScript
- Easier to test
- Clear component inventory

### 3. Default Design System

**Decision:** Default to 'untitledui'
**Rationale:**

- PRD v1.1.0 primary choice
- Backwards compatibility
- Clear fallback behavior

### 4. Isolation Strategy

**Decision:** Separate directories per design system
**Rationale:**

- Prevents style bleeding
- Clear ownership
- Independent versioning
- Easier testing

## Testing Strategy

### Unit Tests

```typescript
// Test PageSpec validation
pageSpecSchema.parse({
  designSystem: 'untitledui', // Valid
});

pageSpecSchema.parse({
  designSystem: 'invalid', // Throws ZodError
});
```

### Component Tests

```typescript
// Test Untitled UI rendering
render(<PageRenderer page={{ designSystem: 'untitledui', ... }} />)
expect(screen.getByRole('heading')).toHaveClass('untitled-ui-hero')

// Test Shadcn UI rendering
render(<PageRenderer page={{ designSystem: 'shadcn', ... }} />)
expect(screen.getByRole('heading')).toHaveClass('shadcn-hero')
```

### E2E Tests

```typescript
// Test full flow
await request.post('/api/pages/create', {
  data: { designSystem: 'untitledui', ... }
})

await page.goto('/preview/tenant/slug')
await expect(page.locator('section.untitled-ui-hero')).toBeVisible()
```

## Performance Considerations

### Component Loading

- **Static imports**: All design systems loaded upfront
- **Trade-off**: Larger initial bundle, faster runtime
- **Future optimization**: Dynamic imports with React.lazy()

### Style Isolation

- **CSS Modules**: Scoped class names per design system
- **Tailwind**: Prefix classes to prevent conflicts
- **CSS-in-JS**: Component-scoped styles (if using)

### Caching

- **Payload CMS**: Built-in caching
- **Next.js**: ISR for published pages
- **CDN**: Static assets cached per design system

---

**Related Documents:**

- TDD Test Plan: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/tdd-test-plan-payload-cms-multi-design-system.md`
- PRD v1.1.0: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
