# Ceremonia Landing Pages - TDD Test Suite Implementation Summary

**Created**: 2025-12-10
**Status**: Complete - Ready for Implementation
**Owner**: Austin Mao

---

## Overview

A comprehensive Test-Driven Development (TDD) test suite has been created for the Ceremonia Multi-Page Landing System. This document summarizes all deliverables and provides guidance for implementation.

## Deliverables

### 1. TDD Test Plan Document

**Location**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/tdd-test-plan-ceremonia-landing-pages.md`

**Size**: 33KB, comprehensive specification

**Contents**:

- Executive summary of TDD approach
- Test strategy overview (test pyramid, coverage targets)
- Detailed test specifications for all 5 phases
- 32 total test cases with RED-GREEN-REFACTOR guidance
- Test fixtures and data
- Success metrics and exit criteria
- Appendices with dependencies and related documents

### 2. E2E Test Suite Files

**Location**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/tests/e2e/ceremonia/`

**Total Code**: 1,101 lines of TypeScript test code across 5 phase test files

#### Test Files Created:

1. **phase1-infrastructure.spec.ts** (221 lines)
   - 6 tests for Payload CMS infrastructure
   - Tests tenant creation, page creation, routes, publishing, isolation

2. **phase2-middleware.spec.ts** (158 lines)
   - 6 tests for middleware implementation
   - Tests URL rewriting, path blocking, performance

3. **phase3-landing-page.spec.ts** (242 lines)
   - 6 tests for first landing page
   - Tests content rendering, responsive design, SEO, performance

4. **phase4-domain.spec.ts** (199 lines)
   - 7 tests for production domain configuration
   - Tests HTTPS, SSL, DNS, mixed content, production performance

5. **phase5-documentation.spec.ts** (281 lines)
   - 7 tests for user workflow and documentation
   - Tests Payload admin UI, create/edit/publish workflows

#### Test Fixtures Created:

1. **fixtures/user.ts**
   - Ceremonia user credentials
   - Other tenant user credentials (for isolation tests)

2. **fixtures/test-page.ts**
   - Basic test page data
   - Used for infrastructure tests

3. **fixtures/first-page.ts**
   - Complete first landing page data
   - "Softening the Season: 3 Simple Skills for Connection in the Chaos"
   - Includes Hero, Features, and CTA sections

#### Documentation:

4. **README.md**
   - Comprehensive guide for running tests
   - TDD workflow explanation
   - Phase gate policy
   - Debugging instructions
   - Common issues and solutions

---

## Test Coverage Summary

| Phase     | Test File                     | Tests  | Lines     | Critical Tests | Duration     |
| --------- | ----------------------------- | ------ | --------- | -------------- | ------------ |
| Phase 1   | phase1-infrastructure.spec.ts | 6      | 221       | 6              | 1-2 days     |
| Phase 2   | phase2-middleware.spec.ts     | 6      | 158       | 6              | 1-2 days     |
| Phase 3   | phase3-landing-page.spec.ts   | 6      | 242       | 5              | 1-2 days     |
| Phase 4   | phase4-domain.spec.ts         | 7      | 199       | 5              | 1 day        |
| Phase 5   | phase5-documentation.spec.ts  | 7      | 281       | 5              | 1 day        |
| **TOTAL** | **5 files**                   | **32** | **1,101** | **27**         | **5-9 days** |

---

## Implementation Workflow

### RED Phase (Write Tests First)

**STATUS**: ✅ COMPLETE

All 32 tests have been written and are expected to FAIL initially. This is correct TDD behavior.

**What to expect**:

```bash
npx playwright test tests/e2e/ceremonia/

# Expected output (initially):
# 32 tests failed (100% failure rate) ✓ Correct for TDD RED phase
```

### GREEN Phase (Implement Features)

**STATUS**: 🔴 NOT STARTED (Awaiting implementation)

**Implementation Order**:

1. **Phase 1: Infrastructure Setup** (1-2 days)
   - Create Ceremonia tenant in Payload CMS
   - Configure Pages collection with multi-tenancy
   - Verify preview and published routes work
   - Test cross-tenant isolation

2. **Phase 2: Middleware Implementation** (1-2 days)
   - Create `src/middleware.ts`
   - Implement TENANT_DOMAINS configuration
   - Implement URL rewriting logic
   - Add path blocking
   - Test middleware doesn't break existing routes

3. **Phase 3: First Landing Page** (1-2 days)
   - Create first page via Payload admin
   - Populate content (Hero, Features, CTA)
   - Verify Untitled UI rendering
   - Test mobile responsiveness
   - Optimize for SEO and performance

4. **Phase 4: Domain Configuration** (1 day)
   - Configure DNS CNAME record
   - Add domain in Vercel
   - Verify SSL certificate
   - Test production deployment

5. **Phase 5: Documentation & Workflow** (1 day)
   - Train Ceremonia team on Payload admin
   - Create user documentation
   - Verify content management workflow
   - Hand off credentials

### REFACTOR Phase (Optimize)

**STATUS**: 🔴 NOT STARTED

After all tests pass, refactor for:

- Code quality (ESLint, Prettier)
- Performance optimization
- Type safety improvements
- Documentation updates

**All tests must remain GREEN after refactoring.**

---

## Phase Gates (BLOCKING)

Each phase acts as a **blocking gate**. You CANNOT proceed to the next phase until ALL tests pass.

### Phase 1 Gate (BLOCKING)

```bash
npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts
# MUST see: 6 passed (100%)
```

**Exit Criteria**:

- [ ] All 6 tests passing
- [ ] Ceremonia tenant created
- [ ] Test page accessible at `/preview/ceremonia/test-page`
- [ ] Published page accessible at `/page/ceremonia/test-page`
- [ ] Cross-tenant isolation verified

### Phase 2 Gate (BLOCKING)

```bash
npx playwright test tests/e2e/ceremonia/phase2-middleware.spec.ts
# MUST see: 6 passed (100%)
```

**Exit Criteria**:

- [ ] All 6 tests passing
- [ ] Middleware file created
- [ ] URL rewriting works
- [ ] Path blocking works
- [ ] Performance acceptable

### Phase 3 Gate (BLOCKING)

```bash
npx playwright test tests/e2e/ceremonia/phase3-landing-page.spec.ts
# MUST see: 6 passed (100%)
```

**Exit Criteria**:

- [ ] All 6 tests passing
- [ ] First page created with complete content
- [ ] Mobile responsive
- [ ] SEO metadata present
- [ ] Performance < 3s

### Phase 4 Gate (BLOCKING)

```bash
NODE_ENV=production npx playwright test tests/e2e/ceremonia/phase4-domain.spec.ts
# MUST see: 7 passed (100%)
```

**Exit Criteria**:

- [ ] All 7 tests passing
- [ ] HTTPS active on custom domain
- [ ] SSL certificate valid
- [ ] DNS resolves correctly
- [ ] Production performance meets targets

### Phase 5 Gate (BLOCKING)

```bash
npx playwright test tests/e2e/ceremonia/phase5-documentation.spec.ts
# MUST see: 7 passed (100%)
```

**Exit Criteria**:

- [ ] All 7 tests passing
- [ ] Payload admin workflow verified
- [ ] Ceremonia team can create/edit/publish pages
- [ ] Documentation complete

---

## Running Tests

### Run All Tests (Full Suite)

```bash
npx playwright test tests/e2e/ceremonia/
```

### Run Specific Phase

```bash
# Phase 1
npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts

# Phase 2
npx playwright test tests/e2e/ceremonia/phase2-middleware.spec.ts

# Phase 3
npx playwright test tests/e2e/ceremonia/phase3-landing-page.spec.ts

# Phase 4 (Production only)
NODE_ENV=production npx playwright test tests/e2e/ceremonia/phase4-domain.spec.ts

# Phase 5
npx playwright test tests/e2e/ceremonia/phase5-documentation.spec.ts
```

### Run with UI Mode (Debugging)

```bash
npx playwright test tests/e2e/ceremonia/ --ui
```

### Run with Trace

```bash
npx playwright test tests/e2e/ceremonia/ --trace on
npx playwright show-trace trace.zip
```

### Generate HTML Report

```bash
npx playwright test tests/e2e/ceremonia/
npx playwright show-report
```

---

## Test Architecture Alignment

### Payload CMS Integration

All tests are designed to work with the **existing Payload CMS infrastructure** documented in:

- `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`

**Key Alignments**:

- Uses existing `pages` collection schema
- Uses existing `tenantId` + `userId` multi-tenancy model
- Uses existing `designSystem` field (defaults to `untitledui`)
- Uses existing `_status` draft/published workflow
- Uses existing PageRenderer component

### Middleware Integration

Tests verify middleware implementation aligns with:

- `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0-unified.md`

**Key Requirements**:

- Custom domain mapping: `live.ceremoniacircle.org` → `tenantId: ceremonia`
- URL rewriting: `/lp/slug` → `/page/ceremonia/slug`
- Path blocking on custom domains
- No interference with existing routes

### PageRenderer Integration

Tests verify PageRenderer correctly renders:

- Untitled UI components (default design system)
- Hero sections with title, subtitle, CTA
- Features sections with icon, title, description
- CTA sections with heading, description, buttons

---

## Environment Configuration

### Required Environment Variables

Create `.env.e2e` in project root:

```bash
# Base URL for tests
BASE_URL=http://localhost:3010

# Database connection (shared with LobeChat)
DATABASE_URL=postgresql://user:password@localhost:5432/lobe_builder

# Payload CMS configuration
PAYLOAD_SECRET=your-payload-secret-key

# Custom domain (for Phase 4 production tests)
CEREMONIA_CUSTOM_DOMAIN=live.ceremoniacircle.org

# Environment
NODE_ENV=development
```

### Test User Credentials

**Ceremonia User**:

- Email: `admin@ceremoniacircle.org`
- Password: `test-password-123` (development only)
- TenantId: `ceremonia`

**Other Tenant User** (for isolation tests):

- Email: `admin@other-tenant.com`
- Password: `other-password-123` (development only)
- TenantId: `other-tenant`

---

## Success Metrics

### Overall Success Criteria

- [ ] All 32 tests passing (100% pass rate)
- [ ] Test coverage ≥ 70% for Ceremonia-specific code
- [ ] All 5 phase gates passed
- [ ] Production deployment successful
- [ ] Ceremonia team trained and confident

### Performance Targets

| Metric                       | Target     | Test              |
| ---------------------------- | ---------- | ----------------- |
| Middleware overhead          | < 10ms P95 | Phase 2, Test 2.5 |
| Page load time (preview)     | < 3s       | Phase 3, Test 3.5 |
| Page load time (production)  | < 3s       | Phase 4, Test 4.5 |
| FCP (First Contentful Paint) | < 1.5s     | Phase 3, Test 3.5 |

### Accessibility Targets

| Requirement           | Target               | Test              |
| --------------------- | -------------------- | ----------------- |
| Mobile responsiveness | No horizontal scroll | Phase 3, Test 3.3 |
| SEO metadata          | Complete             | Phase 3, Test 3.4 |
| HTTPS                 | Active               | Phase 4, Test 4.1 |
| Mixed content         | 0 warnings           | Phase 4, Test 4.2 |

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/ceremonia-tests.yml`:

```yaml
name: Ceremonia E2E Tests

on:
  pull_request:
    paths:
      - 'src/middleware.ts'
      - 'src/app/preview/**'
      - 'src/app/page/**'
      - 'tests/e2e/ceremonia/**'

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Run Phase 1 Tests
        run: npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts

      - name: Run Phase 2 Tests
        run: npx playwright test tests/e2e/ceremonia/phase2-middleware.spec.ts
        if: success()

      - name: Run Phase 3 Tests
        run: npx playwright test tests/e2e/ceremonia/phase3-landing-page.spec.ts
        if: success()

      - name: Upload Test Results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Related Documentation

### Primary Documents

1. **TDD Test Plan**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/tdd-test-plan-ceremonia-landing-pages.md`
   - Comprehensive test specifications
   - Test fixtures and data
   - Success criteria

2. **Unified PRD**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0-unified.md`
   - Product requirements
   - Architecture decisions
   - Implementation phases

3. **Architectural Analysis**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/architectural-compatibility-analysis.md`
   - Compatibility with existing system
   - Architectural decisions
   - Integration points

### Supporting Documents

4. **Page Builder PRD**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
   - Payload CMS schema
   - PageRenderer specification
   - Multi-design system architecture

5. **Playwright Config**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/playwright.config.ts`
   - Test configuration
   - Browser setup
   - Timeouts and retries

---

## Next Steps

### For Developers

1. **Verify Test Suite**:

   ```bash
   cd /Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder
   npx playwright test tests/e2e/ceremonia/ --list
   # Should see: 32 tests listed
   ```

2. **Run Initial Tests** (expect all to fail):

   ```bash
   npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts
   # Expected: 6 failed (RED phase - correct!)
   ```

3. **Start Implementation**:
   - Begin with Phase 1, Test 1.1
   - Implement feature until test passes
   - Move to next test
   - Repeat

4. **Monitor Progress**:
   ```bash
   npx playwright test tests/e2e/ceremonia/ --reporter=list
   # Watch pass rate increase as you implement
   ```

### For Project Managers

1. **Track Phase Completion**:
   - Phase 1: 0/6 tests passing → Target: 6/6
   - Phase 2: 0/6 tests passing → Target: 6/6
   - Phase 3: 0/6 tests passing → Target: 6/6
   - Phase 4: 0/7 tests passing → Target: 7/7
   - Phase 5: 0/7 tests passing → Target: 7/7

2. **Monitor Blockers**:
   - Any failing test in Phase N blocks Phase N+1
   - Phase 4 requires production environment
   - Phase 5 requires Phase 1-4 completion

3. **Review Deliverables**:
   - After Phase 5 completion
   - Ceremonia team training
   - Documentation handoff

---

## Test Maintenance

### Adding New Tests

To add new tests to existing phases:

1. Add test case to appropriate `phaseN-*.spec.ts` file
2. Update test count in this summary document
3. Update README.md with new test description
4. Run full suite to ensure no regressions

### Modifying Tests

When requirements change:

1. Update TDD test plan document first
2. Modify test specifications
3. Update fixtures if needed
4. Re-run full suite
5. Update documentation

### Test Data Management

Test fixtures are version-controlled and should be updated when:

- Page schema changes
- Design system changes
- New sections added
- Tenant configuration changes

---

## Support & Contact

**Owner**: Austin Mao
**Created**: 2025-12-10
**Last Updated**: 2025-12-10

For questions or issues:

1. Review test output and error messages
2. Check test plan document for detailed specifications
3. Review related PRDs and architectural documentation
4. Contact project owner if issues persist

---

## Appendix A: File Locations

All test-related files:

```
/Users/austinmao/Documents/GitHub/lobe-builder/
├── docs/
│   ├── tdd-test-plan-ceremonia-landing-pages.md          # 33KB test plan
│   ├── ceremonia-tests-implementation-summary.md         # This file
│   ├── product-requirements-v1.0.0-unified.md            # Unified PRD
│   └── architectural-compatibility-analysis.md            # Architecture doc
└── lobe-builder/
    ├── playwright.config.ts                               # Playwright config
    └── tests/
        └── e2e/
            └── ceremonia/
                ├── README.md                              # Test suite guide
                ├── fixtures/
                │   ├── user.ts                           # User credentials
                │   ├── test-page.ts                      # Test page data
                │   └── first-page.ts                     # First landing page data
                ├── phase1-infrastructure.spec.ts          # 6 tests, 221 lines
                ├── phase2-middleware.spec.ts              # 6 tests, 158 lines
                ├── phase3-landing-page.spec.ts            # 6 tests, 242 lines
                ├── phase4-domain.spec.ts                  # 7 tests, 199 lines
                └── phase5-documentation.spec.ts           # 7 tests, 281 lines
```

**Total Deliverables**:

- 1 comprehensive test plan (33KB)
- 5 test spec files (1,101 lines of TypeScript)
- 3 test fixture files
- 1 README guide
- 1 implementation summary (this document)

---

**Document Status**: COMPLETE
**Implementation Status**: READY TO START
**Test Suite Status**: RED PHASE (All tests expected to fail initially - correct TDD behavior)
