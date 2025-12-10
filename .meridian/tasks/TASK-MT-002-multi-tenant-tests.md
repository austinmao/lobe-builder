# TASK-MT-002: Multi-Tenant Builder.io Test Suite

## Status: pending

## Priority: high

## Description

Create comprehensive test suite for multi-tenant Builder.io integration including unit tests, integration tests, and E2E tests. Ensure tenant isolation is properly enforced.

## Acceptance Criteria

- [ ] Unit tests for tenant-filtered content queries
- [ ] Unit tests for API endpoint validation (tenantId required)
- [ ] Integration tests for Builder.io Write API with tenantId
- [ ] E2E tests for multi-tenant page creation and preview
- [ ] E2E tests for tenant isolation (tenant A cannot see tenant B's pages)
- [ ] Update existing E2E tests to use new multi-tenant routes
- [ ] Remove legacy test files that test old non-tenant routes

## Technical Details

### Test Files to Create:

1. `tests/unit/builder/multi-tenant.test.ts` - Unit tests
2. `tests/e2e/builder/multi-tenant-integration.spec.ts` - E2E tests
3. Update `tests/e2e/builder/builder-integration.spec.ts` - Migrate to multi-tenant

### Test Scenarios:

#### Unit Tests:

- `pageSpecToBuilderContent` includes tenantId in output
- Query builder includes tenantId filter
- API rejects requests without tenantId

#### E2E Tests:

- Create page for tenant-a, verify accessible at `/builder-preview/tenant-a/slug`
- Create page for tenant-b, verify NOT accessible at `/builder-preview/tenant-a/slug`
- API returns 400 when tenantId missing
- Preview shows 404 when tenant doesn't match

### Test Commands:

- Unit: `bunx vitest run --silent='passed-only' 'tests/unit/builder'`
- E2E: `bunx playwright test tests/e2e/builder`

### Remove Legacy Tests:

- Update tests that use `/builder-preview/[slug]` to use `/builder-preview/[tenantId]/[slug]`

## Dependencies

- Vitest for unit tests
- Playwright for E2E tests
- Dev server running on port 3010

## Tags

- testing
- e2e
- unit-tests
- multi-tenant
- builder-io
