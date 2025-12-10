# Product Requirements Document v1.2.0

## Myxelium Multi-Tenant Page Builder (Payload CMS + Multi-Design System + AI)

**Version:** v1.2.0
**Owner:** Austin Mao
**Scope:** Replace Builder.io with Payload CMS as the multi-tenant CMS for AI-generated landing pages, with support for multiple design systems (Untitled UI and Shadcn UI initially).
**Status:** Ready for Development
**Created:** 2025-11-27
**Updated:** 2025-11-29
**Note:** Filename retains the v1.1.0 suffix for traceability; the content and changelog reflect v1.2.0.

---

## 1. Product Overview

Myxelium is creating an AI-driven funnel builder that:

1. **Generates landing pages** via LobeChat (AI conversational interface)
2. **Saves pages** into Payload CMS as structured JSON blocks
3. **Renders pages** using Untitled UI React components
4. **Enables tenant editing** inside Payload's admin UI, securely and multi-tenant-aware
5. **Supports both AI and human content updates**
6. **Displays live page previews** through a generic preview route inside the Myxelium app
7. **Supports multiple design systems** (Untitled UI and Shadcn UI initially)
8. **Provides dual route structure** for draft and published pages

### Goal

A consistent, scalable, multi-tenant, design-system-driven page builder completely controlled by Myxelium, with a clean editing experience and zero per-editor licensing cost.

### Key Changes from v1.0.x (Builder.io)

| Aspect         | v1.0.x (Builder.io)    | v1.2.0 (Payload CMS + Multi-Design System) |
| -------------- | ---------------------- | ------------------------------------------ |
| CMS            | Builder.io (SaaS)      | Payload CMS (self-hosted)                  |
| Storage        | Builder.io cloud       | PostgreSQL (existing LobeChat DB)          |
| Components     | Builder built-in       | Untitled UI React + Shadcn UI              |
| Licensing      | Per-editor fees        | Zero licensing cost                        |
| Control        | External dependency    | Full ownership                             |
| Multi-tenancy  | Custom query filtering | Native plugin support                      |
| Design Systems | Single (Untitled UI)   | Multiple (Untitled UI + Shadcn UI)         |

### Database Integration

**LobeChat already uses PostgreSQL** with Drizzle ORM. Payload CMS will connect to the **same PostgreSQL database** using its `@payloadcms/db-postgres` adapter. This means:

- No new database infrastructure required
- Payload collections become tables in the existing database
- Shared connection pool and configuration
- Consistent backup/restore strategy

---

## 2. Goals & Objectives

### Primary Goals

1. **AI generates a structured landing page configuration** (PageSpec JSON)
2. **Payload stores PageSpec** as blocks under tenant-isolated "Pages" collection
3. **Untitled UI components** render pages dynamically in the application
4. **Tenants edit content visually** using Payload's block editor
5. **Page preview available** via `/preview/[tenantId]/[slug]`
6. **Fully multi-tenant**: each tenant sees and manages only their own pages
7. **LobeChat artifact previews** use the Myxelium preview route

### Secondary Goals

1. Tenants can list, preview, and manage pages inside the SaaS UI
2. Myxelium admins can see and manage all tenant pages
3. Component library (Untitled UI) is the single source of design truth
4. Future extendability to emails, testimonials, pricing tables, CTA groups

---

## 3. Non-Goals (for MVP)

- Drag-and-drop WYSIWYG builder
- Real-time collaborative editing
- Multi-page funnels (only single landing pages for now)
- Custom UI for editing content (Payload admin is used instead)
- Custom page-level permissions beyond tenant isolation
- Full white-label CMS embedding
- Multi-tenancy at the database level (shared collections only)

---

## 4. User Stories

### US-1: AI → Page Creation

> As a tenant user,
> I can request a landing page in the AI chat,
> And the system creates a new page in Payload with structured page blocks.

**Acceptance Criteria:**

- User prompts: "Create a landing page for a meditation retreat"
- AI generates valid PageSpec JSON
- Page is saved to Payload with correct `tenantId`
- LobeChat displays artifact with preview link

### US-2: Preview Page

> As a tenant user,
> I can open a preview URL inside the chat artifact or from my dashboard,
> And see the rendered page using Untitled UI components.

**Acceptance Criteria:**

- Preview route renders Untitled UI components
- Draft pages are visible (includeUnpublished)
- No authentication required for preview
- Page matches tenant-specific content

### US-3: Edit Page

> As a tenant user,
> I can click "Edit in CMS" on any page,
> And edit content inside Payload's admin UI.

**Acceptance Criteria:**

- Payload admin shows block editor
- User can modify text, images, CTAs
- Changes save as draft or publish
- Preview reflects changes immediately

### US-4: See Only My Pages

> As a tenant user,
> I only see pages belonging to my tenant,
> Even if other tenants exist in the system.

**Acceptance Criteria:**

- Pages collection filtered by `tenantId`
- API returns 403 for cross-tenant access
- Admin UI shows only tenant's pages

### US-5: Admin Visibility

> As a Myxelium admin,
> I can see all tenant pages in Payload and in the internal dashboard.

**Acceptance Criteria:**

- Admin role bypasses tenant filtering
- Can view/edit any tenant's pages
- Audit trail for admin actions

---

## 5. Functional Requirements

### 5.1 PageSpec — Structural Definition

The application uses a JSON-based specification for pages:

```typescript
interface PageSpec {
  tenantId: string; // Required for multi-tenant isolation
  userId: string; // User within organization
  slug: string; // URL-friendly identifier
  title: string; // Page title
  designSystem?: 'untitledui' | 'shadcn'; // Design system selection (default: 'untitledui')
  _status?: 'draft' | 'published'; // Default: 'draft'
  sections: PageSpecSection[]; // Ordered list of blocks
}

interface PageSpecSection {
  type: 'hero' | 'text' | 'cta' | 'features' | 'testimonials' | 'pricing';
  [key: string]: unknown; // Type-specific properties
}
```

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

**Section Type Examples:**

```typescript
// Hero Section
{
  type: 'hero',
  title: 'Find Inner Peace',
  subtitle: 'Join our 2025 meditation retreat',
  ctaLabel: 'Apply Now',
  ctaHref: '#apply',
  backgroundImage?: string
}

// Features Section
{
  type: 'features',
  heading: 'Why Choose Us',
  items: [
    { icon: 'star', title: 'Feature 1', description: '...' },
    { icon: 'heart', title: 'Feature 2', description: '...' }
  ]
}

// CTA Section
{
  type: 'cta',
  heading: 'Ready to get started?',
  description: 'Join thousands of happy customers',
  primaryButton: { label: 'Get Started', href: '/signup' },
  secondaryButton?: { label: 'Learn More', href: '/about' }
}

// Testimonials Section
{
  type: 'testimonials',
  heading: 'Loved by teams everywhere',
  items: [
    { quote: 'Transformed our workflow', name: 'Alex', title: 'Founder', avatarUrl?: string },
    { quote: 'Best launch tool', name: 'Jamie', title: 'CMO' }
  ]
}

// Pricing Section
{
  type: 'pricing',
  heading: 'Choose your plan',
  plans: [
    { name: 'Starter', price: '$19', features: ['Feature A', 'Feature B'] },
    { name: 'Pro', price: '$49', features: ['Feature C', 'Feature D'] }
  ]
}
```

### 5.2 Multi-Tenant Isolation

#### Data Model: tenantId AND userId

The system uses a **dual-key isolation model**:

- **`tenantId`**: Organization/tenant identifier (required for B2B multi-tenancy)
- **`userId`**: Individual user identifier within a tenant (required for per-user tracking)

This enables:

1. **Organization-level isolation**: Tenants only see their own pages
2. **User-level attribution**: Track which user within a tenant created/modified content
3. **Future collaboration**: Multiple users in same tenant can share pages
4. **Per-tenant slug uniqueness**: Composite unique index on (`tenantId`, `slug`) prevents cross-tenant collisions while allowing the same slug in different tenants

```typescript
interface PageSpec {
  tenantId: string; // Organization identifier (e.g., "acme-corp")
  userId: string; // User within organization (e.g., "user_abc123")
  slug: string;
  title: string;
  sections: PageSpecSection[];
}
```

#### Payload Multi-Tenant Plugin Configuration

Using Payload's official multi-tenant plugin:

```typescript
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';

export default buildConfig({
  plugins: [
    multiTenantPlugin<Config>({
      collections: {
        pages: {}, // Enable multi-tenancy for pages
      },
    }),
  ],
});
```

**Access Control Rules:**

```typescript
// Pages collection access control
access: {
  read: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true  // Admins see all
    return { tenantId: { equals: user.tenantId } }
  },
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user }, doc }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return doc.tenantId === user.tenantId
  },
  delete: ({ req: { user }, doc }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return doc.tenantId === user.tenantId
  },
}
```

### 5.3 CMS Editing (Payload Admin)

Tenants must be able to:

- Log in to Payload admin
- See a filtered Pages list containing only their own pages
- Click a page to open block editor
- Modify fields inside each block (e.g., hero title, subtitle, CTA label)
- Add, remove, and reorder blocks
- Save changes as draft
- Preview changes using the preview URL

System must support:

- Controlled block set (Untitled UI components only)
- Ability to add new block types later without breaking existing pages

### 5.4 Preview and Published Routes

#### 5.4.1 Dual Route Structure

The system provides two distinct routes for accessing pages:

**Preview Route (Draft + Published Pages):**

```
/preview/[tenantId]/[slug]
```

**Purpose:**

- Shows pages with `_status: 'draft'` OR `_status: 'published'`
- Used during content creation and editing
- Payload CMS Preview button points here
- AI-generated artifact preview (Lobe artifact iframe) uses this route
- Public by default for artifact embedding; draft access is guarded by tenantId + slug and a signed preview token to reduce enumeration

**Published Route (Production Pages Only):**

```
/page/[tenantId]/[slug]
```

**Purpose:**

- Shows ONLY pages with `_status: 'published'`
- Public-facing production URL
- Returns 404 for draft pages
- Used for live customer-facing pages
- Publicly accessible (no authentication required)

**Future Routes:**

- Custom domains: `custom-domain.com/[slug]`
- Tenant subdomains: `[tenant].myxelium.app/[slug]`

#### 5.4.2 Preview Route Implementation

**File:** `src/app/preview/[tenantId]/[slug]/page.tsx`

```typescript
import { getPayloadClient } from '@/libs/payload/client'
import { PageRenderer } from '@/components/PageRenderer'
import { PageNotFound } from '@/components/PageNotFound'

interface PreviewPageProps {
  params: { tenantId: string; slug: string }
  searchParams: { previewToken?: string }
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { tenantId, slug } = params
  const { previewToken } = searchParams

  verifyPreviewToken({ tenantId, slug, previewToken }) // allow drafts only when token matches
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: 'pages',
    where: {
      tenantId: { equals: tenantId },
      slug: { equals: slug },
    },
    draft: true,          // Include unpublished drafts
    overrideAccess: true, // Bypass admin ACL; route enforces tenant + token
  })

  if (!pages.docs.length) {
    return <PageNotFound tenantId={tenantId} slug={slug} />
  }

  return <PageRenderer page={pages.docs[0]} />
}
```

`verifyPreviewToken` is a lightweight HMAC check for the signed token minted during page creation; drafts must only render when the token matches the requested `tenantId` and `slug`.

**Requirements:**

- Server-rendered using Next.js App Router
- Fetches the page from Payload with `draft: true`
- Maps each section block to the corresponding design system component
- Supports both draft and published pages
- Used by:
  - The AI-generated artifact preview (inside LobeChat)
  - The CMS Preview button inside Payload
- Public iframe-friendly route used by Lobe artifacts; include a signed `previewToken` query param when serving drafts to mitigate slug-guessing
- Must not reveal data for other tenants; enforce tenantId + slug filters and reject mismatched tokens

#### 5.4.3 Published Route Implementation

**File:** `src/app/page/[tenantId]/[slug]/page.tsx`

```typescript
import { getPayloadClient } from '@/libs/payload/client'
import { PageRenderer } from '@/components/PageRenderer'
import { PageNotFound } from '@/components/PageNotFound'

interface PublishedPageProps {
  params: { tenantId: string; slug: string }
}

export default async function PublishedPage({ params }: PublishedPageProps) {
  const { tenantId, slug } = params
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: 'pages',
    where: {
      tenantId: { equals: tenantId },
      slug: { equals: slug },
      _status: { equals: 'published' },  // ONLY published pages
    },
    overrideAccess: true, // Public route bypasses admin ACL; route filters tenant + status
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
- Uses `overrideAccess: true` with `tenantId + slug` filters to keep multi-tenant isolation while serving published content publicly
- Suitable for production use
- Can be cached with ISR/static generation

#### 5.4.4 Publishing Workflow

**Create Draft:**

```typescript
// AI creates draft page via API
POST /api/pages/create
{
  tenantId: "acme-corp",
  userId: "user_abc123",
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

#### 5.4.5 Design System Rendering

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
    testimonials: UntitledUITestimonialsSection,
    pricing: UntitledUIPricingSection,
  },
  shadcn: {
    hero: ShadcnHeroSection,
    features: ShadcnFeaturesSection,
    cta: ShadcnCTASection,
    text: ShadcnTextSection,
    testimonials: ShadcnTestimonialsSection,
    pricing: ShadcnPricingSection,
  },
} as const;
```

### 5.5 AI → CMS Integration (LangGraph)

The AI pipeline (LangGraph) must:

1. Generate a valid PageSpec structure
2. Call the Myxelium API endpoint to create/update the page in Payload
3. Return an artifact with:
   - `type: "application/lobe.artifacts.page"` (Lobe artifact)
   - `tenantId`
   - `slug`
   - `previewToken` (signed token for draft access)
   - `previewUrl` containing `previewToken`
4. LobeChat artifact renderer uses: `/preview/{tenantId}/{slug}?previewToken=...` to embed the page in the artifact iframe

**LangGraph Node:**

```typescript
async function createPageNode(state: ConversationState) {
  const requirements = extractRequirements(state.messages);
  const pageSpec = await generatePageSpec(requirements);

  if (!isValidPageSpec(pageSpec)) {
    return { error: 'Failed to generate valid page specification' };
  }

  const response = await fetch('/api/pages/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageSpec),
  });

  if (!response.ok) {
    return { error: 'Failed to create page in Payload' };
  }

  const { slug, tenantId, previewToken } = await response.json();

  return {
    content: `I've created your landing page! Here's the preview:

<lobeArtifact identifier="${slug}" type="application/lobe.artifacts.page" title="${pageSpec.title}">
{"slug": "${slug}", "tenantId": "${tenantId}", "previewUrl": "/preview/${tenantId}/${slug}?previewToken=${previewToken}", "previewToken": "${previewToken}"}
</lobeArtifact>

You can edit this page in the CMS or ask me to make changes.`,
  };
}
```

### 5.6 SaaS UI: Page Management

Inside Myxelium, tenants must have:

- **"Pages" list view:**
  - Title
  - Slug
  - Created / updated timestamp
  - Buttons for Preview, Edit in CMS
- **"Create page with AI" button** (directly opens the AI agent)

### 5.7 Component System (Multi-Design System Architecture)

The page builder supports multiple design systems through a pluggable component architecture. **Untitled UI** is the default and primary design system, with **Shadcn UI** available as an alternative.

#### 5.7.1 Design System Selection

Pages can specify their design system via the `designSystem` field. If not specified, **Untitled UI** is used as the default.

**Supported Design Systems:**

| Design System | Key          | Status      | Description                                        |
| ------------- | ------------ | ----------- | -------------------------------------------------- |
| Untitled UI   | `untitledui` | **Default** | Primary design system with full component coverage |
| Shadcn UI     | `shadcn`     | Alternative | For projects already using Shadcn                  |

**Design System Components Mapping:**

```typescript
// src/components/PageRenderer/designSystems.ts
import * as ShadcnUI from './sections/shadcn';
import * as UntitledUI from './sections/untitledui';

export type DesignSystem = 'untitledui' | 'shadcn';
type PayloadBlockType = 'hero' | 'text' | 'cta' | 'features' | 'testimonials' | 'pricing';

export const DESIGN_SYSTEM_COMPONENTS: Record<
  DesignSystem,
  Record<PayloadBlockType, React.ComponentType<any>>
> = {
  untitledui: {
    hero: UntitledUI.HeroSection,
    text: UntitledUI.TextSection,
    cta: UntitledUI.CTASection,
    features: UntitledUI.FeaturesSection,
    testimonials: UntitledUI.TestimonialsSection,
    pricing: UntitledUI.PricingSection,
  },
  shadcn: {
    hero: ShadcnUI.HeroSection,
    text: ShadcnUI.TextSection,
    cta: ShadcnUI.CTASection,
    features: ShadcnUI.FeaturesSection,
    testimonials: ShadcnUI.TestimonialsSection,
    pricing: ShadcnUI.PricingSection,
  },
};

export const DEFAULT_DESIGN_SYSTEM: DesignSystem = 'untitledui';
```

**PageRenderer with Design System Support:**

```typescript
// src/components/PageRenderer/index.tsx
import { DESIGN_SYSTEM_COMPONENTS, DEFAULT_DESIGN_SYSTEM, DesignSystem } from './designSystems'

interface PayloadPage {
  title: string
  slug: string
  designSystem?: DesignSystem
  sections: PayloadSection[]
}

export function PageRenderer({ page }: { page: PayloadPage }) {
  const designSystem = page.designSystem || DEFAULT_DESIGN_SYSTEM
  const components = DESIGN_SYSTEM_COMPONENTS[designSystem]

  if (!components) {
    console.warn(`Unknown design system: ${designSystem}, falling back to ${DEFAULT_DESIGN_SYSTEM}`)
    return <PageRenderer page={{ ...page, designSystem: DEFAULT_DESIGN_SYSTEM }} />
  }

  return (
    <main className="min-h-screen">
      {page.sections.map((section, index) => {
        const blockType = section.blockType as PayloadBlockType
        const Component = components[blockType]
        if (!Component) {
          console.warn(`Unknown blockType: ${section.blockType}`)
          return null
        }
        return <Component key={index} {...section} />
      })}
    </main>
  )
}
```

#### 5.7.2 Testing Requirements

**All tests MUST use Untitled UI** (`designSystem: 'untitledui'`) as the default to ensure consistent test coverage of the primary design system.

```typescript
// Example test fixture - ALWAYS use untitledui
const testPage: PayloadPage = {
  title: 'Test Page',
  slug: 'test',
  designSystem: 'untitledui', // REQUIRED for tests
  sections: [
    /* ... */
  ],
};
```

#### 5.7.3 Untitled UI Setup (Primary Design System)

Untitled UI React components become the rendering engine for landing pages.

**Quick Setup with CLI (Recommended):**

```bash
npx untitledui@latest init untitled-ui --nextjs
```

During setup, you'll be prompted to select your project name and brand color preference.

**Manual Installation:**

```bash
npm install @untitledui/icons react-aria-components tailwindcss @tailwindcss/postcss postcss tailwindcss-react-aria-components tailwind-merge tailwindcss-animate next-themes
```

**Theme Configuration:**

Create a `theme.css` file with Tailwind CSS v4.1 variables for typography, colors, spacing, shadows, and animations:

```css
/* src/styles/untitled-ui-theme.css */
@import 'tailwindcss';

:root {
  /* Brand Colors */
  --color-brand-50: #f0f9ff;
  --color-brand-500: #0ea5e9;
  --color-brand-600: #0284c7;
  --color-brand-900: #0c4a6e;

  /* Component Colors */
  --color-bg-primary: var(--color-white);
  --color-bg-secondary: var(--color-gray-50);
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-700);
  --color-border-primary: var(--color-gray-300);
}

.dark-mode {
  --color-bg-primary: var(--color-gray-950);
  --color-bg-secondary: var(--color-gray-900);
  --color-text-primary: var(--color-white);
}
```

**Global Styles Setup:**

```css
/* src/app/globals.css */
@import 'tailwindcss';
@import './theme.css';
```

**Required Providers:**

```typescript
// src/providers/UntitledUIProviders.tsx
'use client'

import { RouterProvider } from 'react-aria-components'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/navigation'

export function UntitledUIProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <RouterProvider navigate={router.push}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </RouterProvider>
  )
}
```

**Reference:** <https://www.untitledui.com/react/integrations/nextjs>

> **Note:** For component mapping and PageRenderer implementation, see [Section 5.7.1 Design System Selection](#571-design-system-selection) above.

**Hero Section Example (Untitled UI):**

```typescript
// src/components/PageRenderer/sections/HeroSection.tsx
import { Button } from '@untitledui/react'

interface HeroSectionProps {
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  backgroundImage?: string
}

export function HeroSection({
  title,
  subtitle,
  ctaLabel,
  ctaHref
}: HeroSectionProps) {
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
```

---

## 6. Technical Requirements

### 6.1 Payload Collections

**Pages Collection:**

```typescript
// src/collections/Pages.ts
import { CollectionConfig } from 'payload';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tenantId', 'userId', 'updatedAt'],
  },
  versions: { drafts: true }, // Enables _status draft/published workflow
  indexes: [
    {
      fields: ['tenantId', 'slug'],
      unique: true, // Enforce per-tenant slug uniqueness
    },
  ],
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
          return 'Slug must be lowercase alphanumeric with hyphens';
        }
        return true;
      },
      // Note: unique constraint is per-tenant, enforced by composite index
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'designSystem',
      type: 'select',
      required: true,
      defaultValue: 'untitledui',
      options: [
        { label: 'Untitled UI', value: 'untitledui' },
        { label: 'Shadcn UI', value: 'shadcn' },
      ],
      admin: {
        description: 'Rendering system used by PageRenderer; defaults to Untitled UI',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: [HeroBlock, TextBlock, CTABlock, FeaturesBlock, TestimonialsBlock, PricingBlock],
    },
  ],
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { tenantId: { equals: user.tenantId } };
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user }, doc }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return doc?.tenantId === user.tenantId;
    },
    delete: ({ req: { user }, doc }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return doc?.tenantId === user.tenantId;
    },
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => ({
        ...data,
        tenantId: req.user?.tenantId ?? data.tenantId,
        userId: req.user?.id ?? data.userId,
      }),
    ],
  },
};
```

**Hero Block:**

```typescript
// src/blocks/HeroBlock.ts
import { Block } from 'payload';

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero Section',
    plural: 'Hero Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'textarea',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'CTA Button Label',
    },
    {
      name: 'ctaHref',
      type: 'text',
      label: 'CTA Button Link',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};
```

**Users Collection:**

```typescript
// src/collections/Users.ts
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'user',
    },
  ],
};
```

### 6.2 Access Control

For the Pages collection:

- `read`, `create`, `update`, `delete` are allowed only when `req.user.tenantId === doc.tenantId`
- Admin role bypasses this logic
- Preview route uses `overrideAccess: true` but must enforce `tenantId + slug` and validate a signed `previewToken` for drafts to prevent cross-tenant access
- Published route uses `overrideAccess: true` with `_status: 'published'` and `tenantId + slug` filters; no drafts are served from `/page/`

### 6.3 API Endpoints (Myxelium)

**Create Page:**

```typescript
// src/app/api/pages/create/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { getPayloadClient } from '@/libs/payload/client';
import { pageSpecSchema } from '@/libs/payload/schemas';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await authenticate(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate PageSpec
  const result = pageSpecSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid PageSpec', details: result.error }, { status: 400 });
  }

  const pageSpec = result.data;
  if (user.role !== 'admin' && user.tenantId !== pageSpec.tenantId) {
    return NextResponse.json({ error: 'Forbidden: tenant mismatch' }, { status: 403 });
  }

  const designSystem = pageSpec.designSystem ?? 'untitledui';
  const payload = await getPayloadClient();

  // Convert PageSpec sections to Payload blocks
  const blocks = pageSpec.sections.map((section) => ({
    blockType: section.type,
    ...section,
  }));

  const page = await payload.create({
    collection: 'pages',
    overrideAccess: true, // enforce tenant check above, bypass admin ACL
    data: {
      tenantId: pageSpec.tenantId,
      userId: pageSpec.userId ?? user.id,
      slug: pageSpec.slug,
      title: pageSpec.title,
      designSystem,
      _status: pageSpec._status ?? 'draft',
      sections: blocks,
    },
  });

  const previewToken = signPreviewToken({ tenantId: pageSpec.tenantId, slug: pageSpec.slug });

  return NextResponse.json({
    id: page.id,
    slug: page.slug,
    tenantId: page.tenantId,
    previewToken,
  });
}
```

**Update Page:**

```typescript
// src/app/api/pages/update/route.ts
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await getPayloadClient();

  const existing = await payload.findByID({
    collection: 'pages',
    id,
    overrideAccess: true, // manual tenant check below
  });

  if (user.role !== 'admin' && existing.tenantId !== user.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const page = await payload.update({
    collection: 'pages',
    id,
    overrideAccess: true,
    data: {
      ...updates,
      designSystem: updates.designSystem ?? existing.designSystem ?? 'untitledui',
    },
  });

  return NextResponse.json({ success: true, page });
}
```

### 6.4 Rendering Layer

The preview route uses:

- PageSpec pulled from Payload
- Mapping: each block type → Untitled UI component
- SSR or RSC supported

### 6.5 LobeChat Artifact Integration

**New Artifact Type:**

```typescript
// packages/types/src/artifact.ts
export enum ArtifactType {
  // ... existing types
  Page = 'application/lobe.artifacts.page', // NEW
}
```

**Artifact Renderer:**

```typescript
// src/features/Portal/Artifacts/Body/Renderer/Page.tsx
import { memo, useMemo } from 'react'

interface PageRendererProps {
  content: string
}

const PageRenderer = memo<PageRendererProps>(({ content }) => {
  const { previewUrl } = useMemo(() => {
    try {
      return JSON.parse(content)
    } catch {
      return { previewUrl: '' }
    }
  }, [content])

  if (!previewUrl) {
    return <div>Invalid page artifact</div>
  }

  return (
    <iframe
      src={previewUrl}
      style={{ border: 'none', height: '100%', width: '100%' }}
      title="Page Preview"
    />
  )
})

export default PageRenderer
```

---

## 7. Testing Requirements

> **Design System for Tests:** All tests MUST use **Untitled UI** (`designSystem: 'untitledui'`) as the default design system. This ensures consistent test coverage of the primary design system. See [Section 5.7.2](#572-testing-requirements) for implementation details.

### 7.1 Unit Tests

```typescript
// src/libs/payload/pageSpecToBlocks.test.ts
describe('pageSpecToBlocks', () => {
  it('should convert hero section to Payload block', () => {
    const pageSpec = {
      tenantId: 'tenant-1',
      slug: 'test-page',
      title: 'Test',
      designSystem: 'untitledui', // REQUIRED: all tests use Untitled UI
      sections: [{ type: 'hero', title: 'Hello', subtitle: 'World' }],
    };

    const blocks = pageSpecToBlocks(pageSpec.sections);

    expect(blocks[0]).toMatchObject({
      blockType: 'hero',
      title: 'Hello',
      subtitle: 'World',
    });
  });
});
```

### 7.2 Integration Tests

```typescript
// src/app/api/pages/create/route.test.ts
describe('POST /api/pages/create', () => {
  it('should create page with valid PageSpec', async () => {
    const response = await POST(
      new Request('...', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: 'tenant-1',
          slug: 'test-page',
          title: 'Test Page',
          designSystem: 'untitledui', // REQUIRED: all tests use Untitled UI
          sections: [{ type: 'hero', title: 'Hello' }],
        }),
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.slug).toBe('test-page');
  });

  it('should enforce tenant isolation', async () => {
    // Test that user cannot create page for different tenant
  });
});
```

### 7.3 E2E Tests

```typescript
// tests/e2e/page-builder.spec.ts
test('should create page via AI and preview', async ({ page }) => {
  await page.goto('/');
  await page.fill('[name="message"]', 'Create a landing page for meditation');
  await page.click('button[type="submit"]');

  // Wait for artifact
  await expect(page.locator('lobeArtifact')).toBeVisible();

  // Click preview
  await page.click('[data-testid="artifact-preview"]');

  // Verify iframe loads
  const iframe = page.frameLocator('iframe[title="Page Preview"]');
  await expect(iframe.locator('h1')).toContainText('Meditation');
});

test('should enforce tenant isolation', async ({ page }) => {
  // Login as tenant-1
  await loginAsTenant(page, 'tenant-1');

  // Try to access tenant-2's page
  await page.goto('/preview/tenant-2/some-page');

  // Should show 404 or access denied
  await expect(page.locator('text=Page Not Found')).toBeVisible();
});
```

### 7.4 Regression Tests

- Changes to blocks or components must not break existing pages
- Migration tests for schema changes

---

## 8. Migration Plan (Builder.io → Payload)

### Phase 1: Parallel Infrastructure (Week 1)

1. Set up Payload CMS with PostgreSQL
2. Create collections (Pages, Users)
3. Implement multi-tenant access control
4. Create preview route `/preview/[tenantId]/[slug]`

### Phase 2: Component System (Week 2)

1. Install and configure Untitled UI
2. Create section components (Hero, Text, CTA, Features)
3. Build PageRenderer component
4. Test rendering with mock data

### Phase 3: API & Integration (Week 3)

1. Create `/api/pages/create` and `/api/pages/update` endpoints
2. Update LangGraph agent to use new endpoints
3. Create new artifact type for Payload pages
4. Update artifact renderer

### Phase 4: Data Migration (Week 4)

1. Export existing Builder.io pages
2. Transform to PageSpec format
3. Import into Payload
4. Validate all pages render correctly

### Phase 5: Builder.io Removal & Technical Debt Cleanup (Week 5)

**Pre-Removal Verification:**

1. Confirm all Payload CMS functionality is working
2. Verify all existing pages migrated successfully
3. Run full test suite (unit, integration, E2E)
4. Backup current codebase state

**Code Removal:**

1. Delete `src/libs/builder/` directory (entire Builder.io library)
2. Delete `src/app/builder-preview/` route
3. Delete `src/app/api/builder/` API routes
4. Delete `src/components/BuilderRenderer/` component
5. Delete `src/features/Portal/Artifacts/Body/Renderer/Builder.tsx`
6. Delete `tests/e2e/builder/` test directory

**Dependency Cleanup:**

1. Remove `@builder.io/sdk-react-nextjs` from package.json
2. Remove `@builder.io/sdk` from package.json (if present)
3. Run `pnpm install` to regenerate lockfile
4. Remove Builder artifact type from `packages/types/src/artifact.ts`

**Environment Cleanup:**

1. Remove `BUILDER_API_KEY` from all environment files
2. Remove `BUILDER_ORG_ID` from all environment files
3. Update deployment configurations

**Verification:**

1. Run `rg -i "builder" --type ts -l` to verify no code references
2. Run `bun run type-check` to verify no missing imports
3. Run `bun run build` to verify build succeeds
4. Run full test suite
5. Deploy to staging and verify functionality
6. Compare bundle size (expect reduction)

### Phase 6: Production Cutover (Week 6)

1. Final verification in staging environment
2. Deploy to production
3. Monitor for issues
4. Update documentation to remove Builder.io references

---

## 9. Open Questions

1. **Should tenants use Payload admin directly, or a branded wrapper inside Myxelium?**
   - Recommendation: Start with direct Payload admin, add branded wrapper in v1.2

2. **Do we want custom UI for drag-and-drop ordering in Myxelium?**
   - Recommendation: Use Payload's built-in block reordering for MVP

3. **Should pages support versioning/rollback?**
   - Recommendation: Enable Payload's built-in drafts and versions

4. **Should sections support rich media or image upload?**
   - Recommendation: Yes, Payload has built-in upload support

---

## 10. Future Considerations

- Multi-page funnels (hero + opt-in + thank you pages)
- Email templates in Payload
- Global theme overrides (colors, fonts, spacing)
- Custom "Myxelium Page Editor" replacing Payload admin entirely
- Templates for different industries
- Snapshot versioning + A/B testing
- Component-level analytics

---

## 11. Builder.io Removal (Technical Debt Cleanup)

### 11.1 Overview

**Critical Requirement:** All Builder.io functionality MUST be completely replaced with Payload CMS, and all Builder.io code MUST be removed from the codebase to eliminate technical debt.

**Rationale:**

- Reduce dependency bloat and bundle size
- Eliminate per-editor licensing costs
- Remove maintenance burden of dual systems
- Clean codebase without deprecated code paths
- Simplified architecture

### 11.2 Files to Remove

The following files and directories must be deleted after Payload CMS implementation is complete and verified:

**Source Code:**

```
src/libs/builder/                    # Entire Builder.io library directory
├── pageSpecToBuilderContent.ts      # PageSpec → Builder content conversion
├── pageSpecToBuilderContent.test.ts # Unit tests
├── schemas.ts                       # Builder schema definitions
├── client.ts                        # Builder client configuration
└── types.ts                         # Builder type definitions

src/app/builder-preview/             # Builder.io preview route
└── [tenantId]/
    └── [slug]/
        └── page.tsx

src/app/api/builder/                 # Builder.io API routes
└── page/
    └── route.ts

src/features/Portal/Artifacts/Body/Renderer/
└── Builder.tsx                      # Builder artifact renderer

src/components/BuilderRenderer/      # Builder React component
├── index.tsx
└── BuilderRenderer.test.tsx
```

**Test Files:**

```
tests/e2e/builder/                   # Builder E2E tests
├── builder-integration.spec.ts
├── multi-tenant-integration.spec.ts
└── fixtures/
```

**Configuration Files (modifications):**

```
# Remove Builder.io entries from:
- .env.example (BUILDER_API_KEY, BUILDER_ORG_ID)
- .env.local (BUILDER_API_KEY, BUILDER_ORG_ID)
```

### 11.3 Dependencies to Remove

Remove from `package.json`:

```json
{
  "dependencies": {
    "@builder.io/sdk-react-nextjs": "^X.X.X", // REMOVE
    "@builder.io/sdk": "^X.X.X" // REMOVE (if present)
  }
}
```

After removal:

```bash
pnpm install # Regenerate lockfile
```

### 11.4 Types to Remove

Remove from `packages/types/src/artifact.ts`:

```typescript
// REMOVE this artifact type after migration
export enum ArtifactType {
  Builder = 'application/lobe.artifacts.builder', // REMOVE
  // ... other types remain
}
```

### 11.5 Environment Variables to Remove

```
BUILDER_API_KEY        # Remove from all environments
BUILDER_ORG_ID         # Remove from all environments (if used)
BUILDER_MODEL_NAME     # Remove from all environments (if used)
```

### 11.6 Removal Verification Checklist

Before removal:

- [ ] All Payload CMS functionality is implemented and tested
- [ ] All existing pages have been migrated to Payload
- [ ] All artifact renderers updated to use Payload pages
- [ ] E2E tests passing with Payload implementation

During removal:

- [ ] Delete all files listed in section 11.2
- [ ] Remove dependencies from package.json
- [ ] Remove environment variables
- [ ] Remove artifact type enum value
- [ ] Update any import statements that reference Builder

After removal:

- [ ] `pnpm install` completes without errors
- [ ] `bun run type-check` passes (no missing imports)
- [ ] `bun run build` completes successfully
- [ ] All Payload-based tests pass
- [ ] No references to "builder" in codebase (except documentation)
- [ ] Bundle size reduced

### 11.7 Verification Commands

```bash
# 1. Check for remaining Builder references
rg -i "builder" --type ts --type tsx -l | grep -v "node_modules" | grep -v ".md"

# 2. Verify no Builder imports
rg "from.*builder" --type ts --type tsx

# 3. Verify dependencies removed
grep -i "builder" package.json

# 4. Check for stale environment variables
grep -i "BUILDER" .env* || echo "No Builder env vars found"

# 5. Type check
bun run type-check

# 6. Build verification
bun run build
```

---

## 12. Success Criteria

The system is successful when:

### Payload CMS Implementation

- [ ] AI can generate a complete landing page using Untitled UI components
- [ ] AI can generate a complete landing page using Shadcn UI components
- [ ] Pages can specify design system via `designSystem` field
- [ ] Preview route `/preview/[tenantId]/[slug]` works for draft pages
- [ ] Draft previews require a valid signed `previewToken` (embedded in Lobe artifacts) to prevent cross-tenant snooping
- [ ] Published route `/page/[tenantId]/[slug]` works for published pages only
- [ ] Draft pages are NOT accessible via `/page/` route (return 404)
- [ ] Serialized PageSpec is stored in Payload
- [ ] Tenants can edit content using Payload admin
- [ ] Design system selection works in Payload admin
- [ ] Pages render identically inside preview and published routes
- [ ] No tenant can ever access another tenant's pages
- [ ] Design systems are isolated (no style bleeding between Untitled UI and Shadcn)
- [ ] LobeChat can show page previews reliably

### Builder.io Removal (Technical Debt)

- [ ] **All Builder.io source files removed** (src/libs/builder/, src/app/builder-preview/, etc.)
- [ ] **All Builder.io dependencies removed** (@builder.io/sdk-react-nextjs, @builder.io/sdk)
- [ ] **All Builder.io environment variables removed** (BUILDER_API_KEY, etc.)
- [ ] **No Builder.io references in codebase** (verified via `rg -i builder`)
- [ ] **Build succeeds without Builder.io** (`bun run build` passes)
- [ ] **Type check passes without Builder.io** (`bun run type-check` passes)
- [ ] **Bundle size reduced** (verified via build output)

### Testing

- [ ] All unit tests pass (100% pass rate)
- [ ] All integration tests pass (100% pass rate)
- [ ] All E2E tests pass (100% pass rate)
- [ ] Test coverage ≥ 70%

---

## 13. Risks & Mitigations

| Risk                         | Mitigation                             |
| ---------------------------- | -------------------------------------- |
| Payload CMS learning curve   | Comprehensive documentation + training |
| Untitled UI component gaps   | Custom components as needed            |
| Migration data loss          | Full backup + parallel running         |
| Performance degradation      | Database indexing + caching            |
| Multi-tenant security breach | Thorough access control testing        |

---

## Appendix A: File Structure

```
src/
├── app/
│   ├── api/
│   │   └── pages/
│   │       ├── create/
│   │       │   └── route.ts
│   │       └── update/
│   │           └── route.ts
│   └── preview/
│       └── [tenantId]/
│           └── [slug]/
│               └── page.tsx
├── collections/
│   ├── Pages.ts
│   ├── Users.ts
│   └── Media.ts
├── blocks/
│   ├── HeroBlock.ts
│   ├── TextBlock.ts
│   ├── CTABlock.ts
│   └── FeaturesBlock.ts
├── components/
│   └── PageRenderer/
│       ├── index.tsx
│       └── sections/
│           ├── HeroSection.tsx
│           ├── TextSection.tsx
│           └── CTASection.tsx
├── features/
│   └── Portal/
│       └── Artifacts/
│           └── Body/
│               └── Renderer/
│                   └── Page.tsx
└── libs/
    └── payload/
        ├── client.ts
        ├── schemas.ts
        └── config.ts

packages/
└── types/
    └── src/
        ├── artifact.ts      # Add ArtifactType.Page
        └── pageSpec.ts      # PageSpec types

tests/
└── e2e/
    └── page-builder.spec.ts
```

---

## Appendix B: Payload CMS Configuration

**Database Integration:** Payload CMS connects to the **same PostgreSQL database** that LobeChat already uses (via Drizzle ORM). This means:

- Payload tables are created alongside existing LobeChat tables
- Uses the same `DATABASE_URL` environment variable
- No separate database infrastructure required
- Shared connection pool

```typescript
// payload.config.ts
import { postgresAdapter } from '@payloadcms/db-postgres';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';

import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Users } from './collections/Users';

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [Pages, Users, Media],
  db: postgresAdapter({
    pool: {
      // Uses the SAME DATABASE_URL as LobeChat's Drizzle ORM
      connectionString: process.env.DATABASE_URL,
    },
    // Payload tables will be prefixed to avoid conflicts with Drizzle tables
    tablePrefix: 'payload_',
  }),
  editor: lexicalEditor(),
  plugins: [
    multiTenantPlugin({
      collections: {
        pages: {},
      },
    }),
  ],
  typescript: {
    outputFile: 'payload-types.ts',
  },
});
```

**Note on Table Naming:**

- Payload collections become tables prefixed with `payload_` (e.g., `payload_pages`, `payload_users`)
- LobeChat's existing tables (managed by Drizzle) remain unchanged
- Both systems can coexist in the same PostgreSQL database

---

## Changelog

- **v1.2.0** (2025-11-29): Builder.io removal and multi-design system architecture
  - **Section 5.7:** Renamed to "Multi-Design System Architecture"
    - Added 5.7.1: Design System Selection with pluggable component architecture
    - Added DESIGN_SYSTEM_COMPONENTS mapping for Untitled UI (default) and Shadcn UI
    - Added testimonials/pricing block coverage in design system mappings
    - Added 5.7.2: Testing Requirements - all tests MUST use Untitled UI
    - Renamed 5.7.3: Untitled UI Setup (Primary Design System)
  - **Section 7:** Added design system note - all tests must use `designSystem: 'untitledui'`
  - **Section 11:** Added Builder.io Removal (Technical Debt Cleanup)
    - Detailed files, dependencies, and environment variables to remove
    - Added removal verification checklist and commands
  - Updated Success Criteria with Builder.io removal requirements
  - Updated Migration Plan with explicit Phase 5 (Builder.io Removal) and Phase 6 (Production Cutover)
  - Added comprehensive pre-removal, removal, and post-removal verification steps
  - **Critical requirement**: All Builder.io code must be removed after Payload CMS migration
  - Clarified preview security: draft previews use signed `previewToken`, `overrideAccess` uses tenant + slug filters, and artifacts embed the preview URL
  - Unified artifact type to `application/lobe.artifacts.page` for Lobe artifact rendering

- **v1.1.2** (2025-11-29): Multi-design system support
  - Added `designSystem` field to PageSpec (`'untitledui' | 'shadcn'`)
  - Added dual route structure (`/preview/` for drafts, `/page/` for published)
  - Added design system architecture (Section 5.4.5)
  - Added support for Shadcn UI in addition to Untitled UI
  - Updated PageRenderer to support multiple design systems
  - Added publish endpoint (`/api/pages/[id]/publish`)
  - Updated success criteria to include multi-design system requirements
  - Added comprehensive TDD test plan

- **v1.1.1** (2025-11-29): Architecture clarifications
  - Clarified Payload CMS uses **existing PostgreSQL database** (same as LobeChat's Drizzle ORM)
  - Added `userId` field alongside `tenantId` for dual-key isolation (organization + user)
  - Updated Untitled UI installation with correct CLI and manual instructions
  - Added database integration notes (table prefixing, shared connection)
  - Added reference to <https://www.untitledui.com/react/integrations/nextjs>

- **v1.1.0** (2025-11-29): Payload CMS + Untitled UI migration
  - Replace Builder.io with Payload CMS for content storage
  - Replace Builder SDK with Untitled UI React components
  - Add native multi-tenant plugin support
  - Update preview route to `/preview/[tenantId]/[slug]`
  - Add comprehensive Payload collection definitions
  - Add Untitled UI component system
  - Add migration plan from Builder.io
  - Zero licensing cost model

- **v1.0.1** (2025-11-27): TDD restructure for Builder.io implementation

- **v1.0.0** (2025-11-27): Initial PRD creation for AI-Powered Funnel Builder MVP with Builder.io
