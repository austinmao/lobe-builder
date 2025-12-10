# TASK-018: Preview Route Implementation - Context

**Status**: COMPLETE
**Started**: 2025-11-29
**Completed**: 2025-11-29

## Summary

Successfully implemented the preview route `/preview/[tenantId]/[slug]` that fetches page data from Builder.io and renders it using PageRenderer component. Supports draft pages (includeUnpublished) for content preview during editing.

## Implementation Details

### Files Created

1. **src/app/preview/\[tenantId]/\[slug]/layout.tsx**
   - Root layout for preview route
   - Uses UntitledUIProviders for theme and routing context
   - Imports Untitled UI theme CSS
   - Follows same pattern as builder-preview layout

2. **src/app/preview/\[tenantId]/\[slug]/page.tsx**
   - Async Server Component (Next.js App Router)
   - Fetches page data from Builder.io using `getPageForTenant()`
   - Includes unpublished/draft pages with `includeUnpublished: true`
   - Converts Builder.io content to PageData format
   - Renders using PageRenderer component
   - Returns PageNotFound component for non-existent pages
   - No authentication required (tenant isolation via tenantId + slug)

3. **src/components/PageNotFound.tsx**
   - Simple 404 component with user-friendly message
   - Link to return home
   - Uses theme CSS variables for styling
   - Accessible with semantic HTML and keyboard navigation

4. **Tests**:
   - **src/app/preview/\[tenantId]/\[slug]/page.test.tsx** (13 tests)
     - Happy path: Render existing published page
     - Happy path: Render existing draft page
     - Error paths: Non-existent page returns 404
     - Error paths: Builder.io unavailable throws error
     - Edge cases: Empty sections renders empty container
     - Tenant isolation verification
     - Design system support

   - **src/components/PageNotFound.test.tsx** (8 tests)
     - Happy path: Render 404 message
     - Accessibility: Semantic HTML, keyboard navigation
     - Styling verification

### Key Features

1. **Builder.io Integration**: Uses existing `getPageForTenant()` client from `src/libs/builder`
2. **Draft Support**: Includes unpublished pages with `includeUnpublished: true` option
3. **Content Transformation**: Converts Builder.io blocks to PageData format
4. **404 Handling**: Returns PageNotFound component when page not found
5. **Tenant Isolation**: Only fetches pages for specified tenant (no cross-contamination)
6. **Design System Support**: Passes designSystem field to PageRenderer
7. **Type Safety**: Full TypeScript typing with proper interfaces
8. **Error Handling**: Graceful handling of missing data and API failures

### Builder.io Content Mapping

```typescript
// Builder component names � blockType mapping
{
  'Hero': 'hero',
  'Text': 'text',
  'CTA': 'cta',
  'Features': 'features'
}
```

### Verification Results

**Tests**: All 21 tests passing

```
 src/app/preview/[tenantId]/[slug]/page.test.tsx (13 tests) 27ms
 src/components/PageNotFound.test.tsx (8 tests) 24ms
```

**TypeScript**: No type errors found in preview or PageNotFound files

**Linter**: No linting errors (passes Biome checks)

**Format**: Code follows project formatting standards

## Acceptance Criteria Status

-  **BLOCKING**: Visiting /preview/acme-corp/landing renders the page
-  **BLOCKING**: Draft pages (unpublished) are visible in preview
-  **BLOCKING**: Non-existent page shows PageNotFound component
-  Page renders all section types correctly (via PageRenderer)
-  No tenant cross-contamination (only specified tenant's page shown)

All acceptance criteria met.

## Technical Decisions

### 1. Used Builder.io Instead of Payload CMS

**Decision**: Implemented using existing Builder.io infrastructure (`src/libs/builder/client.ts`)

**Rationale**:

- Task documentation mentioned "Payload CMS" but existing codebase uses Builder.io
- Previous tasks (TASK-014, TASK-017) reference Builder.io integration
- `src/libs/builder/client.ts` already implements multi-tenant page fetching
- Following "No Deviation Protocol" - fix existing issues, don't switch technologies

### 2. Content Transformation Layer

**Decision**: Created `builderContentToPageData()` function to convert Builder.io format to PageData

**Rationale**:

- Separates Builder.io API concerns from PageRenderer component
- PageRenderer expects standardized PageData format
- Allows future migration to different CMS without changing PageRenderer

### 3. Server Component Pattern

**Decision**: Implemented as async Server Component (not Client Component)

**Rationale**:

- Follows Next.js 15 best practices (data fetching on server)
- Reduces client bundle size
- Better SEO and initial page load performance
- No client-side state needed for preview route

### 4. Error Handling Strategy

**Decision**: Return PageNotFound component for missing pages, throw for API failures

**Rationale**:

- Missing page = user-facing 404 (expected behavior)
- API failures = unexpected errors (should be caught by error boundary)
- Clear separation between "not found" and "server error" states

## Integration Points

This route integrates with:

- **Builder.io Client**: `src/libs/builder/client.ts` for page fetching
- **PageRenderer**: `src/components/PageRenderer` for page rendering
- **UntitledUIProviders**: Theme and routing context
- **Untitled UI Theme**: CSS variables for PageNotFound styling

## Testing Strategy

**Coverage**: 21 tests across 2 files

- 13 preview route tests (page.test.tsx)
- 8 PageNotFound component tests

**Test Categories**:

1. Happy paths: Published pages, draft pages
2. Error paths: 404 handling, API failures
3. Edge cases: Empty sections, missing data
4. Tenant isolation: Cross-tenant access prevention
5. Accessibility: Semantic HTML, keyboard navigation

**Mocking Approach**:

- Mock Builder.io client (`getPageForTenant`)
- Mock PageRenderer (test integration, not implementation)
- Mock PageNotFound (test routing logic)
- No mocking of internal transformation logic

## Known Limitations

1. **No Caching**: Route uses `cache: 'no-store'` (implicit in Builder.io client)
2. **No ISR**: No Incremental Static Regeneration configured
3. **No Error Boundary**: Relies on Next.js default error handling
4. **Simple 404 Page**: PageNotFound is basic (no branding, analytics, etc.)

These are intentionally out of scope per task definition.

## Future Improvements

1. Add error boundary for preview route (`error.tsx`)
2. Implement loading state with streaming (`loading.tsx`)
3. Add preview toolbar with design system switcher
4. Implement ISR with revalidation for production
5. Enhanced 404 page with search and suggestions
6. Preview analytics tracking

## Time Tracking

- Planning & Research: 10 minutes
- Implementation: 20 minutes
- Testing: 10 minutes
- Verification & Documentation: 10 minutes
- **Total**: 50 minutes (within 40-50 minute time limit)

## Deliverables Checklist

-  src/app/preview/\[tenantId]/\[slug]/page.tsx
-  src/app/preview/\[tenantId]/\[slug]/layout.tsx (with UntitledUIProviders)
- � src/libs/payload/client.ts (used existing src/libs/builder/client.ts instead)
-  src/components/PageNotFound.tsx
-  Comprehensive test suite (21 tests)
-  TypeScript type checking passing
-  Biome linting/formatting passing

**Note**: Created `src/libs/builder` integration instead of `src/libs/payload` because the codebase uses Builder.io, not Payload CMS. This aligns with the "No Deviation Protocol" - we fixed the existing integration rather than switching technologies.

## Next Steps

- TASK-019+: Implement published route `/page/[tenantId]/[slug]` (production route)
- Add error boundary for preview route
- Implement preview toolbar for design system switching
- Consider ISR configuration for production routes
