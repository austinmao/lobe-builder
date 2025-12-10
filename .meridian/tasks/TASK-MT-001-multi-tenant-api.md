# TASK-MT-001: Multi-Tenant Builder.io API Implementation

## Status: pending

## Priority: high

## Description

Implement Option A multi-tenant architecture for Builder.io integration using tenantId-based content isolation. Update the API to support multi-tenant page creation and querying.

## Acceptance Criteria

- [ ] Update `/api/builder/page` POST endpoint to require `tenantId` parameter
- [ ] Add `tenantId` to Builder.io content data when creating pages
- [ ] Update preview page route to `/builder-preview/[tenantId]/[slug]`
- [ ] Implement tenant-filtered content fetching using MongoDB-style queries
- [ ] Remove legacy code that doesn't use tenantId isolation
- [ ] Add TypeScript types for multi-tenant PageSpec
- [ ] Use Builder.io SDK with query filtering: `query: { 'data.tenantId': tenantId }`

## Technical Details

### Files to Create/Modify:

1. `src/app/api/builder/page/route.ts` - Add tenantId to Write API payload
2. `src/app/builder-preview/[tenantId]/[slug]/page.tsx` - New route with tenant isolation
3. `src/libs/builder/types.ts` - Multi-tenant type definitions
4. `src/libs/builder/client.ts` - Helper functions for tenant-filtered queries

### Builder.io API Reference:

- Write API: `POST https://builder.io/api/v1/write/page`
- Content API query: `query.data.tenantId=<value>`
- SDK query: `builder.get('page', { query: { 'data.tenantId': tenantId } })`

### Remove Legacy Files:

- `src/app/builder-preview/[slug]/page.tsx` (replace with tenant version)

## Dependencies

- Builder.io SDK: @builder.io/sdk, @builder.io/sdk-react-nextjs
- Environment: BUILDER_PRIVATE_API_KEY, NEXT_PUBLIC_BUILDER_API_KEY

## Tags

- builder-io
- multi-tenant
- api
- next-js
