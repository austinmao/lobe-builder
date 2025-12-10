# PRD Update Instructions - v1.1.0 to v1.1.1

**Target File:** `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`

**New Version:** v1.1.1
**Date:** 2025-11-29
**Reason:** Add multi-design system support and dual route structure

---

## Update 1: Version Header

**Location:** Lines 1-10

**REPLACE:**

```markdown
# Product Requirements Document v1.1.0

## Myxelium Multi-Tenant Page Builder (Payload CMS + Untitled UI + AI)

**Version:** v1.1.0
**Owner:** Austin Mao
**Scope:** Replace Builder.io with Payload CMS as the multi-tenant CMS for AI-generated landing pages, using Untitled UI React components as the design system.
**Status:** Ready for Development
**Created:** 2025-11-27
**Updated:** 2025-11-29
```

**WITH:**

```markdown
# Product Requirements Document v1.1.1

## Myxelium Multi-Tenant Page Builder (Payload CMS + Multi-Design System + AI)

**Version:** v1.1.1
**Owner:** Austin Mao
**Scope:** Replace Builder.io with Payload CMS as the multi-tenant CMS for AI-generated landing pages, with support for multiple design systems (Untitled UI and Shadcn UI initially).
**Status:** Ready for Development
**Created:** 2025-11-27
**Updated:** 2025-11-29
```

---

## Update 2: Product Overview

**Location:** Section 1 (around line 15)

**ADD after line 24 (after "6. **Displays live page previews**"):**

```markdown
7. **Supports multiple design systems** (Untitled UI and Shadcn UI initially)
8. **Provides dual route structure** for draft and published pages
```

**UPDATE Key Changes table (around line 29):**

**ADD new row:**

```markdown
| Design Systems | Single (Untitled UI) | Multiple (Untitled UI + Shadcn UI) |
```

---

## Update 3: PageSpec Interface

**Location:** Section 5.1 (around line 152)

**REPLACE:**

```typescript
interface PageSpec {
  tenantId: string; // Required for multi-tenant isolation
  slug: string; // URL-friendly identifier
  title: string; // Page title
  sections: PageSpecSection[]; // Ordered list of blocks
}
```

**WITH:**

```typescript
interface PageSpec {
  tenantId: string; // Required for multi-tenant isolation
  userId: string; // User within organization
  slug: string; // URL-friendly identifier
  title: string; // Page title
  designSystem: 'untitledui' | 'shadcn'; // Design system selection (default: 'untitledui')
  sections: PageSpecSection[]; // Ordered list of blocks
}
```

**ADD new subsection after Section 5.1:**

````markdown
### 5.1.1 Design System Selection

The `designSystem` field allows pages to specify which design system to use for rendering components.

**Supported Design Systems (MVP):**

- `untitledui`: Untitled UI React components (default)
- `shadcn`: Shadcn UI components

**Default Behavior:**

- If `designSystem` field is omitted, defaults to `untitledui`
- Invalid values return 400 validation error with supported options

**Future Extensibility:**

- Architecture supports adding new design systems (e.g., Material UI, custom systems)
- Each design system maps to isolated component implementations
- No style bleeding between design systems
- Clear separation of concerns per system

**Example PageSpec with Design System:**

```typescript
// Untitled UI page
{
  tenantId: "acme-corp",
  userId: "user_abc123",
  slug: "landing-page",
  title: "ACME Landing Page",
  designSystem: "untitledui",
  sections: [
    {
      type: "hero",
      title: "Grow your users. Smarter.",
      subtitle: "Powerful analytics platform",
      ctaLabel: "Get Started"
    }
  ]
}

// Shadcn UI page
{
  tenantId: "widget-inc",
  userId: "user_xyz789",
  slug: "product-launch",
  title: "Widget Product Launch",
  designSystem: "shadcn",
  sections: [
    {
      type: "hero",
      title: "Ship faster with our tools",
      ctaLabel: "Start Free Trial"
    }
  ]
}
```
````

**Validation Rules:**

- `designSystem` must be one of: `untitledui`, `shadcn`
- Case-sensitive
- Validated at API level before page creation
- Returns 400 with `{ error: "Invalid design system", supportedDesignSystems: [...] }` if invalid

**AI Integration:**
The AI can specify the design system in the prompt:

- "Create a landing page with Untitled UI"
- "Create a SaaS page using Shadcn UI"
- If not specified, defaults to Untitled UI

````

---

## Update 4: Preview Route Section

**Location:** Section 5.4 (around line 280)

**REPLACE entire Section 5.4 with:**

```markdown
## 5.4 Preview and Published Routes

### 5.4.1 Dual Route Structure

The system provides two distinct routes for accessing pages:

**Preview Route (Draft + Published Pages):**
````

/preview/\[tenantId]/\[slug]

```

**Purpose:**
- Shows pages with `_status: 'draft'` OR `_status: 'published'`
- Used during content creation and editing
- Payload CMS Preview button points here
- AI-generated artifact preview uses this route
- Accessible to authenticated users only

**Published Route (Production Pages Only):**
```

/page/\[tenantId]/\[slug]

````

**Purpose:**
- Shows ONLY pages with `_status: 'published'`
- Public-facing production URL
- Returns 404 for draft pages
- Used for live customer-facing pages
- Publicly accessible (no authentication required)

**Future Routes:**
- Custom domains: `custom-domain.com/[slug]`
- Tenant subdomains: `[tenant].myxelium.app/[slug]`

### 5.4.2 Preview Route Implementation

**File:** `src/app/preview/[tenantId]/[slug]/page.tsx`

```typescript
import { getPayloadClient } from '@/libs/payload/client'
import { PageRenderer } from '@/components/PageRenderer'
import { PageNotFound } from '@/components/PageNotFound'

interface PreviewPageProps {
  params: Promise<{ tenantId: string; slug: string }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { tenantId, slug } = await params
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: 'pages',
    where: {
      tenantId: { equals: tenantId },
      slug: { equals: slug },
    },
    draft: true,  // Include unpublished drafts
  })

  if (!pages.docs.length) {
    return <PageNotFound tenantId={tenantId} slug={slug} />
  }

  return <PageRenderer page={pages.docs[0]} />
}
````

**Requirements:**

- Server-rendered using Next.js App Router
- Fetches the page from Payload with `draft: true`
- Maps each section block to the corresponding design system component
- Supports both draft and published pages
- Used by:
  - The AI-generated artifact preview (inside LobeChat)
  - The CMS Preview button inside Payload
- No authentication required (content addressed by tenantId + slug)
- Must not reveal data for other tenants

### 5.4.3 Published Route Implementation

**File:** `src/app/page/[tenantId]/[slug]/page.tsx`

```typescript
import { getPayloadClient } from '@/libs/payload/client'
import { PageRenderer } from '@/components/PageRenderer'
import { PageNotFound } from '@/components/PageNotFound'

interface PublishedPageProps {
  params: Promise<{ tenantId: string; slug: string }>
}

export default async function PublishedPage({ params }: PublishedPageProps) {
  const { tenantId, slug } = await params
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: 'pages',
    where: {
      tenantId: { equals: tenantId },
      slug: { equals: slug },
      _status: { equals: 'published' },  // ONLY published pages
    },
  })

  if (!pages.docs.length) {
    return <PageNotFound tenantId={tenantId} slug={slug} type="published" />
  }

  return <PageRenderer page={pages.docs[0]} />
}
```

**Requirements:**

- Server-rendered using Next.js App Router
- Fetches ONLY pages with `_status: 'published'`
- Returns 404 for draft pages
- Public-facing route (no authentication)
- Suitable for production use
- Can be cached with ISR/static generation

### 5.4.4 Publishing Workflow

**Create Draft:**

```typescript
// AI creates draft page via API
POST /api/pages/create
{
  tenantId: "acme-corp",
  slug: "landing",
  title: "Landing Page",
  designSystem: "untitledui",
  _status: "draft",  // Default
  sections: [...]
}

// Returns: { id: "page-123", tenantId: "acme-corp", slug: "landing" }
```

**Preview Draft:**

```
/preview/acme-corp/landing  ← Shows draft page
/page/acme-corp/landing     ← 404 (not published)
```

**Publish Page:**

```typescript
PATCH / api / pages / page - 123 / publish;
{
  _status: 'published';
}
```

**Access Published:**

```
/preview/acme-corp/landing  ← Still works (shows published)
/page/acme-corp/landing     ← Now accessible (published)
```

### 5.4.5 Design System Rendering

Both routes use the same `PageRenderer` component, which selects the appropriate design system components:

```typescript
// src/components/PageRenderer/index.tsx
export function PageRenderer({ page }: { page: PayloadPage }) {
  const designSystem = page.designSystem || 'untitledui'
  const components = DESIGN_SYSTEM_COMPONENTS[designSystem]

  return (
    <main className="min-h-screen">
      {page.sections.map((section, index) => {
        const Component = components[section.blockType]
        if (!Component) {
          console.warn(`Unknown section type: ${section.blockType}`)
          return null
        }
        return <Component key={index} {...section} />
      })}
    </main>
  )
}
```

**Design System Components Mapping:**

```typescript
const DESIGN_SYSTEM_COMPONENTS = {
  untitledui: {
    hero: UntitledUIHeroSection,
    features: UntitledUIFeaturesSection,
    cta: UntitledUICTASection,
    text: UntitledUITextSection,
  },
  shadcn: {
    hero: ShadcnHeroSection,
    features: ShadcnFeaturesSection,
    cta: ShadcnCTASection,
    text: ShadcnTextSection,
  },
} as const;
```

````

---

## Update 5: Add Design System Architecture Section

**Location:** After Section 5.7 (Component System)

**ADD new Section 5.8:**

```markdown
## 5.8 Design System Architecture

### 5.8.1 Multi-Design System Support

The page builder supports multiple design systems from MVP, allowing tenants to choose between different UI frameworks for their landing pages.

**Initial Supported Systems:**
- **Untitled UI**: Premium React component library with modern design tokens
- **Shadcn UI**: Open-source component library built on Radix UI + Tailwind

**Architecture Benefits:**
- **Flexibility**: Tenants choose design system per page
- **Future-proof**: Easy to add new design systems (Material UI, custom systems)
- **Isolation**: No style bleeding between design systems
- **Type-safe**: TypeScript ensures correct component usage

### 5.8.2 Component Mapping Strategy

**Directory Structure:**

````

src/components/PageRenderer/
├── index.tsx # Main renderer with design system selection
│ ├── DESIGN_SYSTEM_COMPONENTS mapping
│ └── PageRenderer component
│
└── sections/
├── untitled-ui/ # Untitled UI implementation
│ ├── HeroSection.tsx
│ │ └── Uses: @untitledui/react, Untitled UI tokens
│ ├── FeaturesSection.tsx
│ ├── CTASection.tsx
│ ├── TextSection.tsx
│ └── index.ts
│
└── shadcn/ # Shadcn UI implementation
├── HeroSection.tsx
│ └── Uses: shadcn components, Tailwind utilities
├── FeaturesSection.tsx
├── CTASection.tsx
├── TextSection.tsx
└── index.ts

````

**Component Mapping:**

```typescript
// src/components/PageRenderer/index.tsx
import * as UntitledUI from './sections/untitled-ui'
import * as Shadcn from './sections/shadcn'

const DESIGN_SYSTEM_COMPONENTS = {
  untitledui: {
    hero: UntitledUI.HeroSection,
    features: UntitledUI.FeaturesSection,
    cta: UntitledUI.CTASection,
    text: UntitledUI.TextSection,
  },
  shadcn: {
    hero: Shadcn.HeroSection,
    features: Shadcn.FeaturesSection,
    cta: Shadcn.CTASection,
    text: Shadcn.TextSection,
  },
} as const

export function PageRenderer({ page }: { page: PayloadPage }) {
  const designSystem = page.designSystem || 'untitledui'
  const components = DESIGN_SYSTEM_COMPONENTS[designSystem]

  return (
    <main className="min-h-screen">
      {page.sections.map((section, index) => {
        const Component = components[section.blockType]
        if (!Component) {
          console.warn(`Unknown section type: ${section.blockType}`)
          return null
        }
        return <Component key={index} {...section} />
      })}
    </main>
  )
}
````

### 5.8.3 Adding New Design Systems

To add a new design system (e.g., Material UI):

**Step 1: Create Component Implementations**

```
src/components/PageRenderer/sections/material-ui/
├── HeroSection.tsx
├── FeaturesSection.tsx
├── CTASection.tsx
├── TextSection.tsx
└── index.ts
```

**Step 2: Update Component Mapping**

```typescript
import * as MaterialUI from './sections/material-ui'

const DESIGN_SYSTEM_COMPONENTS = {
  untitledui: { ... },
  shadcn: { ... },
  'material-ui': {  // NEW
    hero: MaterialUI.HeroSection,
    features: MaterialUI.FeaturesSection,
    cta: MaterialUI.CTASection,
    text: MaterialUI.TextSection,
  },
}
```

**Step 3: Update PageSpec Type**

```typescript
// packages/types/src/builder.ts
interface PageSpec {
  designSystem: 'untitledui' | 'shadcn' | 'material-ui'; // Add option
  // ... other fields
}
```

**Step 4: Update Validation Schema**

```typescript
// src/libs/payload/schemas/pageSpec.ts
import { z } from 'zod';

export const pageSpecSchema = z.object({
  designSystem: z.enum(['untitledui', 'shadcn', 'material-ui']).default('untitledui'),
  // ... other fields
});
```

**Step 5: Deploy and Use**

AI can now specify:

```json
{
  "designSystem": "material-ui",
  "sections": [...]
}
```

### 5.8.4 Design System Isolation

Each design system is completely isolated:

**CSS Isolation:**

- Untitled UI: Uses CSS custom properties (`--color-brand-500`)
- Shadcn UI: Uses Tailwind utility classes (`bg-blue-500`)
- No shared global styles
- Scoped class names prevent conflicts

**Component Isolation:**

- Separate directories per design system
- No cross-imports between design systems
- Each system can have different dependencies
- Independent versioning

**Testing Isolation:**

- Tests verify no style bleeding
- Each design system tested independently
- Visual regression tests per system
- E2E tests for each design system

**Example - Hero Section Comparison:**

```typescript
// Untitled UI Hero
// src/components/PageRenderer/sections/untitled-ui/HeroSection.tsx
import { Button } from '@untitledui/react'

export function HeroSection({ title, subtitle, ctaLabel, ctaHref }) {
  return (
    <section className="bg-bg-primary py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-display-lg font-semibold text-text-primary mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-text-secondary mb-8">
            {subtitle}
          </p>
        )}
        {ctaLabel && (
          <Button size="xl" href={ctaHref}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </section>
  )
}

// Shadcn UI Hero
// src/components/PageRenderer/sections/shadcn/HeroSection.tsx
import { Button } from '@/components/ui/button'

export function HeroSection({ title, subtitle, ctaLabel, ctaHref }) {
  return (
    <section className="bg-background py-24 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-muted-foreground mb-8">
            {subtitle}
          </p>
        )}
        {ctaLabel && (
          <Button size="lg" asChild>
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        )}
      </div>
    </section>
  )
}
```

### 5.8.5 Performance Considerations

**Component Loading:**

- Static imports: All design systems loaded upfront
- Trade-off: Larger initial bundle (\~50KB per system), faster runtime
- Future optimization: Dynamic imports with React.lazy() if needed

**Style Loading:**

- Untitled UI: CSS-in-JS with emotion/styled-components
- Shadcn UI: Tailwind utilities (tree-shaken)
- Both systems only load used components

**Caching Strategy:**

- Payload CMS: Built-in caching for page data
- Next.js: ISR for published pages (revalidate: 60s)
- CDN: Static assets cached per design system

````

---

## Update 6: Update Payload Collections

**Location:** Section 6.1 (around line 545)

**UPDATE Pages Collection to include designSystem field:**

**REPLACE the `fields` array (around line 598) with:**

```typescript
fields: [
  {
    name: 'tenantId',
    type: 'text',
    required: true,
    index: true,
    admin: {
      readOnly: true,
      position: 'sidebar',
      description: 'Organization/tenant identifier',
    },
  },
  {
    name: 'userId',
    type: 'text',
    required: true,
    index: true,
    admin: {
      readOnly: true,
      position: 'sidebar',
      description: 'User who created/owns this page',
    },
  },
  {
    name: 'slug',
    type: 'text',
    required: true,
    index: true,
    validate: (value) => {
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Slug must be lowercase alphanumeric with hyphens'
      }
      return true
    },
  },
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'designSystem',  // NEW FIELD
    type: 'select',
    required: true,
    defaultValue: 'untitledui',
    options: [
      { label: 'Untitled UI', value: 'untitledui' },
      { label: 'Shadcn UI', value: 'shadcn' },
    ],
    admin: {
      description: 'Design system used for rendering this page',
      position: 'sidebar',
    },
  },
  {
    name: 'sections',
    type: 'blocks',
    blocks: [
      HeroBlock,
      TextBlock,
      CTABlock,
      FeaturesBlock,
      TestimonialsBlock,
      PricingBlock,
    ],
  },
],
````

---

## Update 7: Update API Endpoints

**Location:** Section 6.3 (around line 709)

**UPDATE Create Page endpoint:**

**REPLACE with:**

```typescript
// src/app/api/pages/create/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { getPayloadClient } from '@/libs/payload/client';
import { pageSpecSchema } from '@/libs/payload/schemas/pageSpec';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate PageSpec (includes designSystem validation)
  const result = pageSpecSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Invalid PageSpec',
        details: result.error.format(),
        supportedDesignSystems: ['untitledui', 'shadcn'],
      },
      { status: 400 },
    );
  }

  const pageSpec = result.data;
  const payload = await getPayloadClient();

  // Convert PageSpec sections to Payload blocks
  const blocks = pageSpec.sections.map((section) => ({
    blockType: section.type,
    ...section,
  }));

  const page = await payload.create({
    collection: 'pages',
    data: {
      tenantId: pageSpec.tenantId,
      userId: pageSpec.userId,
      slug: pageSpec.slug,
      title: pageSpec.title,
      designSystem: pageSpec.designSystem || 'untitledui', // NEW
      sections: blocks,
    },
  });

  return NextResponse.json({
    id: page.id,
    slug: page.slug,
    tenantId: page.tenantId,
  });
}
```

**ADD new endpoint for publishing:**

```typescript
// src/app/api/pages/[id]/publish/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { getPayloadClient } from '@/libs/payload/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const payload = await getPayloadClient();

  try {
    const page = await payload.update({
      collection: 'pages',
      id,
      data: {
        _status: body._status || 'published',
      },
    });

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        slug: page.slug,
        tenantId: page.tenantId,
        _status: page._status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to publish page', details: error.message },
      { status: 500 },
    );
  }
}
```

---

## Update 8: Update Testing Requirements

**Location:** Section 7 (around line 835)

**REPLACE Section 7.3 E2E Tests with:**

````markdown
### 7.3 E2E Tests

```typescript
// tests/e2e/page-builder/hello-world.spec.ts
test('should create and preview hello world page with Untitled UI', async ({ page, request }) => {
  const pageSpec = {
    tenantId: 'test-tenant',
    userId: 'test-user',
    slug: 'hello-world',
    title: 'Hello World',
    designSystem: 'untitledui',
    sections: [
      {
        type: 'hero',
        title: 'Grow your users. Smarter.',
        subtitle: 'Powerful analytics',
        ctaLabel: 'Get Started',
      },
    ],
  };

  const response = await request.post('/api/pages/create', { data: pageSpec });
  expect(response.ok()).toBeTruthy();

  const { tenantId, slug } = await response.json();

  // Test preview route
  await page.goto(`/preview/${tenantId}/${slug}`);
  await expect(page.getByRole('heading', { name: /grow your users/i })).toBeVisible();

  // Test published route (should 404 for draft)
  await page.goto(`/page/${tenantId}/${slug}`);
  await expect(page.locator('text=Page Not Found')).toBeVisible();
});

test('should support both Untitled UI and Shadcn UI', async ({ page, request }) => {
  // Create Untitled UI page
  await request.post('/api/pages/create', {
    data: {
      tenantId: 'tenant-1',
      slug: 'untitled-page',
      title: 'Untitled Test',
      designSystem: 'untitledui',
      sections: [{ type: 'hero', title: 'Untitled Hero' }],
    },
  });

  // Create Shadcn UI page
  await request.post('/api/pages/create', {
    data: {
      tenantId: 'tenant-2',
      slug: 'shadcn-page',
      title: 'Shadcn Test',
      designSystem: 'shadcn',
      sections: [{ type: 'hero', title: 'Shadcn Hero' }],
    },
  });

  // Both should render correctly
  await page.goto('/preview/tenant-1/untitled-page');
  await expect(page.getByRole('heading', { name: /untitled hero/i })).toBeVisible();

  await page.goto('/preview/tenant-2/shadcn-page');
  await expect(page.getByRole('heading', { name: /shadcn hero/i })).toBeVisible();
});

test('should enforce tenant isolation', async ({ page, request }) => {
  await request.post('/api/pages/create', {
    data: {
      tenantId: 'tenant-a',
      slug: 'secret-page',
      title: 'Secret',
      designSystem: 'untitledui',
      sections: [{ type: 'hero', title: 'Tenant A Secret' }],
    },
  });

  // Tenant B tries to access Tenant A's page
  await page.goto('/preview/tenant-b/secret-page');
  await expect(page.locator('text=Page Not Found')).toBeVisible();
});
```
````

````

---

## Update 9: Update Success Criteria

**Location:** Section 11 (around line 993)

**REPLACE the checklist with:**

```markdown
The system is successful when:

- [ ] AI can generate a complete landing page using Untitled UI components
- [ ] AI can generate a complete landing page using Shadcn UI components
- [ ] Pages can specify design system via `designSystem` field
- [ ] Preview route `/preview/[tenantId]/[slug]` works for draft pages
- [ ] Published route `/page/[tenantId]/[slug]` works for published pages only
- [ ] Draft pages are NOT accessible via `/page/` route (return 404)
- [ ] Serialized PageSpec is stored in Payload
- [ ] Tenants can edit content using Payload admin
- [ ] Design system selection works in Payload admin
- [ ] Pages render identically inside preview and published routes
- [ ] No tenant can ever access another tenant's pages
- [ ] Design systems are isolated (no style bleeding between Untitled UI and Shadcn)
- [ ] LobeChat can show page previews reliably
- [ ] All unit tests pass (100% pass rate)
- [ ] All integration tests pass (100% pass rate)
- [ ] All E2E tests pass (100% pass rate)
- [ ] Test coverage ≥ 70%
````

---

## Update 10: Update File Structure

**Location:** Appendix A (around line 1021)

**REPLACE with:**

```markdown
## Appendix A: File Structure
```

src/
├── app/
│ ├── api/
│ │ └── pages/
│ │ ├── create/
│ │ │ └── route.ts
│ │ ├── update/
│ │ │ └── route.ts
│ │ └── \[id]/
│ │ └── publish/
│ │ └── route.ts
│ ├── preview/
│ │ └── \[tenantId]/
│ │ └── \[slug]/
│ │ └── page.tsx
│ └── page/
│ └── \[tenantId]/
│ └── \[slug]/
│ └── page.tsx
├── collections/
│ ├── Pages.ts
│ ├── Users.ts
│ └── Media.ts
├── blocks/
│ ├── HeroBlock.ts
│ ├── TextBlock.ts
│ ├── CTABlock.ts
│ └── FeaturesBlock.ts
├── components/
│ └── PageRenderer/
│ ├── index.tsx
│ └── sections/
│ ├── untitled-ui/
│ │ ├── HeroSection.tsx
│ │ ├── TextSection.tsx
│ │ ├── FeaturesSection.tsx
│ │ ├── CTASection.tsx
│ │ └── index.ts
│ └── shadcn/
│ ├── HeroSection.tsx
│ ├── TextSection.tsx
│ ├── FeaturesSection.tsx
│ ├── CTASection.tsx
│ └── index.ts
├── features/
│ └── Portal/
│ └── Artifacts/
│ └── Body/
│ └── Renderer/
│ └── Page.tsx
└── libs/
└── payload/
├── client.ts
├── schemas/
│ └── pageSpec.ts
└── config.ts

packages/
└── types/
└── src/
├── artifact.ts
└── builder.ts # Updated with designSystem field

tests/
├── e2e/
│ └── page-builder/
│ ├── hello-world.spec.ts
│ ├── multi-design-system.spec.ts
│ └── tenant-isolation.spec.ts
└── unit/
└── libs/
└── payload/
└── pageSpec.test.ts

```

```

---

## Update 11: Add Changelog Entry

**Location:** At the end of the document (around line 1150)

**ADD to Changelog section:**

```markdown
- **v1.1.1** (2025-11-29): Multi-design system support
  - Added `designSystem` field to PageSpec (`'untitledui' | 'shadcn'`)
  - Added dual route structure (`/preview/` for drafts, `/page/` for published)
  - Added design system architecture (Section 5.8)
  - Added support for Shadcn UI in addition to Untitled UI
  - Updated PageRenderer to support multiple design systems
  - Added publish endpoint (`/api/pages/[id]/publish`)
  - Updated success criteria to include multi-design system requirements
  - Added comprehensive TDD test plan
```

---

## Summary of Changes

1. **Version**: v1.1.0 → v1.1.1
2. **Scope**: Added multi-design system support
3. **New Field**: `designSystem` in PageSpec
4. **New Routes**: `/page/[tenantId]/[slug]` for published pages
5. **New Section**: 5.8 Design System Architecture
6. **New API**: `/api/pages/[id]/publish` endpoint
7. **Updated Tests**: E2E tests for multi-design system
8. **Updated Success Criteria**: Added design system requirements

## Verification Checklist

After making these updates:

- [ ] Version number updated to v1.1.1
- [ ] All code examples include `designSystem` field
- [ ] Dual route structure documented
- [ ] Design system architecture section added
- [ ] Payload collection includes `designSystem` field
- [ ] API endpoints updated
- [ ] Testing requirements updated
- [ ] Success criteria updated
- [ ] File structure updated
- [ ] Changelog entry added

---

**Related Documents:**

- TDD Test Plan: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/tdd-test-plan-payload-cms-multi-design-system.md`
- Architecture Diagram: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/multi-design-system-architecture.md`
