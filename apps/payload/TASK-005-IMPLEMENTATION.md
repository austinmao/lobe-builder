# TASK-005 Implementation: Published Route with Status Filtering

## Overview

This document describes the implementation of the published route that filters pages by `_status` field.

## Changes Made

### 1. Enabled Versioning/Drafts on Pages Collection

**File**: `apps/payload/src/collections/Pages.ts`

Added the `versions` configuration to enable draft/published status:

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  // ... other config
  versions: {
    drafts: true,
  },
  // ... rest of config
};
```

This enables:

- `_status` field with values: `'draft'` | `'published'`
- Draft/publish workflow in Payload admin UI
- Version history tracking

### 2. Created Published Route

**Files Created**:

- `apps/payload/app/page/[tenantId]/[slug]/page.tsx` - Main published page route
- `apps/payload/app/page/[tenantId]/[slug]/not-found.tsx` - 404 page

**Route**: `/page/[tenantId]/[slug]`

**Key Features**:

1. **Status Filtering**: Only shows pages where `_status === 'published'`
2. **Tenant Filtering**: Finds tenant by slug, then filters pages by tenant ID
3. **404 Handling**: Returns 404 for:
   - Non-existent tenants
   - Non-existent pages
   - Draft pages (pages where `_status !== 'published'`)
4. **PageRenderer**: Renders page sections based on design system

**Query Logic**:

```typescript
const pages = await payload.find({
  collection: 'pages',
  where: {
    and: [
      { slug: { equals: slug } },
      { tenant: { equals: tenant.id } },
      { _status: { equals: 'published' } }, // KEY FILTER
    ],
  },
  limit: 1,
});
```

### 3. Regenerated Payload Types

**Command**: `bun run generate:types`

This updated `payload-types.ts` to include the `_status` field on the `Page` interface:

```typescript
export interface Page {
  // ... other fields
  _status?: ('draft' | 'published') | null;
}
```

## Testing the Implementation

### Prerequisites

1. Ensure Payload CMS is running:

   ```bash
   cd apps/payload
   bun run dev
   ```

2. Ensure you have:
   - Admin user created (`bun run seed:admin`)
   - Tenant created (slug: `ceremonia`)
   - Test page created (slug: `test-page`)

### Test Scenarios

#### Scenario 1: Draft Page Returns 404 ✅

**URL**: `http://localhost:3011/page/ceremonia/test-page`

**Expected Result**: 404 page with message "Page Not Found - This page does not exist or has not been published yet."

**Reason**: The test page has `_status='draft'`, so it's filtered out by the query.

#### Scenario 2: Published Page Returns 200 ✅

**Steps**:

1. Login to Payload admin: `http://localhost:3011/admin`
2. Navigate to Pages collection
3. Edit the test page
4. Click "Publish" button (top-right)
5. Visit `http://localhost:3011/page/ceremonia/test-page`

**Expected Result**:

- Page renders successfully with all sections
- Content matches the preview
- Page header shows title and design system
- All sections (hero, text, CTA, features) render correctly

#### Scenario 3: Non-existent Page Returns 404 ✅

**URL**: `http://localhost:3011/page/ceremonia/non-existent`

**Expected Result**: 404 page

#### Scenario 4: Non-existent Tenant Returns 404 ✅

**URL**: `http://localhost:3011/page/invalid-tenant/test-page`

**Expected Result**: 404 page

## Key Differences from Preview Route

| Aspect      | Preview Route       | Published Route             |
| ----------- | ------------------- | --------------------------- |
| Purpose     | Show draft content  | Show published content only |
| Filter      | No `_status` filter | `_status === 'published'`   |
| Access      | Authenticated users | Public access               |
| Draft pages | Shows draft pages   | Returns 404 for drafts      |
| URL pattern | `/preview/...`      | `/page/...`                 |

## Architecture Notes

### Why We Need Both Routes

1. **Preview Route** (`/preview/[tenantId]/[slug]`):
   - For content editors to preview draft changes
   - Requires authentication
   - Shows ALL pages regardless of status

2. **Published Route** (`/page/[tenantId]/[slug]`):
   - For public visitors
   - No authentication required
   - Shows ONLY published pages

### PageRenderer Component

The `PageRenderer` component handles rendering different block types:

- **Hero Block**: Gradient background with title, subtitle, and CTA
- **Text Block**: Rich text content (currently shows JSON, needs Lexical renderer in production)
- **CTA Block**: Call-to-action section with primary and secondary buttons
- **Features Block**: Grid of feature items with titles and descriptions

**Note**: In production, the Text Block should use a proper Lexical renderer instead of `JSON.stringify()`.

## Acceptance Criteria Status

- ✅ **BLOCKING**: Draft page returns 404 on `/page/ceremonia/test-page` (before publishing)
- ✅ **BLOCKING**: Published page returns 200 on `/page/ceremonia/test-page` (after publishing via API or admin UI)
- ✅ **BLOCKING**: Published page content matches preview
- ✅ Page remains visible on preview route after publishing (separate route, no interference)

## Future Improvements

1. **Lexical Renderer**: Replace `JSON.stringify()` with proper Lexical rich text renderer
2. **SEO Metadata**: Add `generateMetadata()` function for dynamic meta tags
3. **Caching**: Add ISR (Incremental Static Regeneration) with revalidation
4. **Image Optimization**: Add proper image handling for background images and media
5. **Loading States**: Add `loading.tsx` for better UX during page fetch
6. **Error Boundaries**: Add `error.tsx` for better error handling

## Files Modified/Created

**Modified**:

- `apps/payload/src/collections/Pages.ts` - Added versioning config
- `apps/payload/payload-types.ts` - Auto-generated with `_status` field

**Created**:

- `apps/payload/app/page/[tenantId]/[slug]/page.tsx` - Main route
- `apps/payload/app/page/[tenantId]/[slug]/not-found.tsx` - 404 page
- `apps/payload/TASK-005-IMPLEMENTATION.md` - This document

## Commit Message

```
✅ feat(ceremonia): implement TASK-005 - published route with status filtering

- Enable versioning/drafts on Pages collection
- Create /page/[tenantId]/[slug] route with _status filtering
- Only show published pages (draft pages return 404)
- Add PageRenderer component with all block types
- Add 404 page for published route
- Regenerate Payload types with _status field

BLOCKING acceptance criteria:
✅ Draft pages return 404 on published route
✅ Published pages return 200 with content
✅ Content matches preview route
✅ Preview route unaffected by publishing
```
