# Ceremonia Landing Pages - E2E Test Suite

This directory contains end-to-end tests for the Ceremonia Multi-Page Landing System using Playwright.

## Overview

The test suite follows a **Test-Driven Development (TDD)** approach with **phased implementation gates**. Each phase must pass all tests before proceeding to the next phase.

## Test Structure

```
tests/e2e/ceremonia/
├── README.md                           # This file
├── fixtures/                           # Test data fixtures
│   ├── user.ts                         # User credentials
│   ├── test-page.ts                    # Basic test page
│   └── first-page.ts                   # First real landing page
├── phase1-infrastructure.spec.ts       # Phase 1: Payload CMS setup
├── phase2-middleware.spec.ts           # Phase 2: Custom domain routing
├── phase3-landing-page.spec.ts         # Phase 3: First page creation
├── phase4-domain.spec.ts               # Phase 4: Production deployment
└── phase5-documentation.spec.ts        # Phase 5: User workflow
```

## Implementation Phases

### Phase 1: Infrastructure Setup (BLOCKING)

**Tests**: 6 tests
**Duration**: 1-2 days

Verifies:

- Payload CMS tenant creation (tenantId: `ceremonia`)
- Pages collection configuration
- Preview route (`/preview/ceremonia/[slug]`)
- Published route (`/page/ceremonia/[slug]`)
- Cross-tenant isolation

**Run**: `npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts`

### Phase 2: Middleware Implementation (BLOCKING)

**Tests**: 6 tests
**Duration**: 1-2 days

Verifies:

- Middleware URL rewriting
- Custom domain routing simulation
- Path blocking on custom domains
- Main domain routes unaffected
- Performance impact < 10ms

**Run**: `npx playwright test tests/e2e/ceremonia/phase2-middleware.spec.ts`

### Phase 3: First Landing Page (BLOCKING)

**Tests**: 6 tests
**Duration**: 1-2 days

Verifies:

- First page created with complete content
- Untitled UI components render correctly
- Mobile responsive layout
- SEO metadata present
- Performance < 3s load time

**Run**: `npx playwright test tests/e2e/ceremonia/phase3-landing-page.spec.ts`

### Phase 4: Domain Configuration (BLOCKING)

**Tests**: 7 tests
**Duration**: 1 day

Verifies:

- HTTPS active on custom domain
- Valid SSL certificate
- DNS resolution
- Production performance
- No mixed content warnings

**Note**: Requires production environment with DNS configured.

**Run**: `NODE_ENV=production npx playwright test tests/e2e/ceremonia/phase4-domain.spec.ts`

### Phase 5: Documentation & Workflow (BLOCKING)

**Tests**: 7 tests
**Duration**: 1 day

Verifies:

- Payload admin workflow for non-technical users
- Create, edit, publish pages
- Preview vs. published distinction
- Tenant isolation in admin UI

**Run**: `npx playwright test tests/e2e/ceremonia/phase5-documentation.spec.ts`

## Running Tests

### Run All Ceremonia Tests

```bash
npx playwright test tests/e2e/ceremonia/
```

### Run Specific Phase

```bash
npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts
```

### Run with UI Mode (Debugging)

```bash
npx playwright test tests/e2e/ceremonia/ --ui
```

### Run with Trace

```bash
npx playwright test tests/e2e/ceremonia/ --trace on
```

### Generate HTML Report

```bash
npx playwright test tests/e2e/ceremonia/
npx playwright show-report
```

## Test Configuration

### Environment Variables

Create `.env.e2e` in project root:

```bash
# Base URL for tests
BASE_URL=http://localhost:3010

# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/test_db

# Payload configuration
PAYLOAD_SECRET=test-secret-key

# Custom domain (for Phase 4 production tests)
CEREMONIA_CUSTOM_DOMAIN=live.ceremoniacircle.org

# Skip production tests in development
NODE_ENV=development
```

### Playwright Configuration

Tests use the configuration from `/playwright.config.ts`:

- **Test directory**: `./tests/e2e`
- **Base URL**: `http://localhost:3010`
- **Browser**: Chromium
- **Retries**: 2 on CI, 0 locally
- **Parallel execution**: Yes (except within phase test suites)

## TDD Workflow

### RED Phase (Initial State)

All tests are expected to **FAIL** initially. This is by design.

**DO NOT SKIP WRITING TESTS FIRST.**

### GREEN Phase (Implementation)

Write minimal code to make each test pass, in order:

1. Start with Phase 1, Test 1
2. Implement feature until test passes
3. Move to next test
4. Repeat until all Phase 1 tests pass
5. Only then move to Phase 2

### REFACTOR Phase

Once all tests in a phase pass, refactor code for:

- Code quality
- Performance
- Maintainability

**All tests must remain GREEN after refactoring.**

## Phase Gate Policy

### BLOCKING GATES

Each phase acts as a **blocking gate**. You CANNOT proceed to the next phase until ALL tests in the current phase pass.

**Example**:

- ❌ Phase 1: Test 1.3 failing → BLOCKED, cannot start Phase 2
- ✅ Phase 1: All tests passing → UNBLOCKED, proceed to Phase 2

### Continuous Integration

GitHub Actions workflow (`.github/workflows/ceremonia-tests.yml`) enforces phase gates:

```yaml
- name: Phase 1
  run: npx playwright test phase1-infrastructure.spec.ts

- name: Phase 2
  run: npx playwright test phase2-middleware.spec.ts
  if: success() # Only run if Phase 1 passed
```

## Test Data

### Test Users

- **Ceremonia user**: `admin@ceremoniacircle.org` (password in `.env.e2e`)
- **Other tenant user**: `admin@other-tenant.com` (for isolation tests)

### Test Pages

- **Test page**: `test-page` (simple page for infrastructure tests)
- **First landing page**: `softening-the-season-3-simple-skills-for-connection-in-the-chaos` (real content)

### Fixtures

Test data is stored in `fixtures/` directory for reuse across tests.

## Success Metrics

| Phase     | Total Tests | Critical Tests | Pass Rate Target |
| --------- | ----------- | -------------- | ---------------- |
| Phase 1   | 6           | 6              | 100%             |
| Phase 2   | 6           | 6              | 100%             |
| Phase 3   | 6           | 5              | 100%             |
| Phase 4   | 7           | 5              | 100%             |
| Phase 5   | 7           | 5              | 100%             |
| **TOTAL** | **32**      | **27**         | **100%**         |

## Debugging Failed Tests

### View Test Report

```bash
npx playwright show-report
```

### Run Single Test

```bash
npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts --grep "1.1"
```

### Debug Mode

```bash
npx playwright test tests/e2e/ceremonia/ --debug
```

### View Trace

```bash
npx playwright test tests/e2e/ceremonia/ --trace on
npx playwright show-trace trace.zip
```

## Common Issues

### Issue: Tests fail with "baseURL not configured"

**Solution**: Ensure `.env.e2e` has `BASE_URL=http://localhost:3010`

### Issue: Tests fail with "Cannot connect to database"

**Solution**: Start local PostgreSQL and ensure `DATABASE_URL` is correct

### Issue: Phase 4 tests fail in development

**Solution**: Phase 4 tests are production-only. Set `NODE_ENV=production` or `CI=true`

### Issue: Tests timeout

**Solution**: Increase timeout in `playwright.config.ts` or specific test:

```typescript
test('...', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

## Related Documentation

- **TDD Test Plan**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/tdd-test-plan-ceremonia-landing-pages.md`
- **Unified PRD**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0-unified.md`
- **Architectural Analysis**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/architectural-compatibility-analysis.md`
- **Playwright Docs**: <https://playwright.dev/docs/intro>

## Support

For questions or issues with tests, contact:

- **Owner**: Austin Mao
- **Created**: 2025-12-10
- **Last Updated**: 2025-12-10
