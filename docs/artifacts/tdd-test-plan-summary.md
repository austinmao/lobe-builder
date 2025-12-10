# TDD Test Plan Summary - Quick Reference

**Document:** `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/tdd-test-plan-payload-cms-multi-design-system.md`

**Created:** 2025-11-29
**Status:** Ready for Implementation

---

## Critical Requirements (NEW)

1. **Multi-Design System Support**
   - MVP must support BOTH Untitled UI AND Shadcn UI
   - `designSystem` field in PageSpec (`'untitledui' | 'shadcn'`)
   - Default: `untitledui`
   - Architecture allows future design systems

2. **Dual Route Structure**
   - Preview: `/preview/[tenantId]/[slug]` (draft + published)
   - Published: `/page/[tenantId]/[slug]` (published only)
   - Future: custom domains, tenant subdomains

3. **Hello World First**
   - Reference: Untitled UI Landing Page 17
   - Simplest possible working flow
   - Write test BEFORE implementation

4. **Payload CMS Migration**
   - Replace Builder.io with Payload CMS
   - Self-hosted, PostgreSQL-backed
   - Multi-tenant with `@payloadcms/plugin-multi-tenant`

---

## Test Files Created

### Phase 1: Hello World E2E Test

**File:** `tests/e2e/page-builder/hello-world.spec.ts`

**Tests:**

- Create and preview simple hello world page with Untitled UI
- Publish page and verify `/page/` route works
- Handle Payload CMS draft status correctly
- Render multiple sections in correct order

**Command:**

```bash
npx playwright test tests/e2e/page-builder/hello-world.spec.ts
```

### Phase 2: Multi-Design System Tests

**File:** `tests/e2e/page-builder/multi-design-system.spec.ts`

**Tests:**

- Render page with Untitled UI design system
- Render page with Shadcn UI design system
- Use default design system when not specified
- Isolate design systems (no style bleeding)
- Validate `designSystem` field
- Support future design systems via extensible architecture

**Command:**

```bash
npx playwright test tests/e2e/page-builder/multi-design-system.spec.ts
```

### Phase 3: Tenant Isolation Tests

**File:** `tests/e2e/page-builder/tenant-isolation.spec.ts`

**Tests:**

- Block cross-tenant access via preview route
- Block cross-tenant access via published route
- Allow same slug across different tenants
- Enforce tenant isolation at API level

**Command:**

```bash
npx playwright test tests/e2e/page-builder/tenant-isolation.spec.ts
```

### Phase 4: PageSpec Validation Unit Tests

**File:** `src/libs/payload/__tests__/pageSpec.test.ts`

**Tests:**

- Validate complete PageSpec with Untitled UI
- Validate PageSpec with Shadcn UI
- Default to untitledui when designSystem not specified
- Reject missing/invalid fields (tenantId, slug, title, sections)
- Reject invalid designSystem value
- Validate section types (hero, features, cta)

**Command:**

```bash
bunx vitest run --silent='passed-only' 'pageSpec.test.ts'
```

### Phase 5: PageRenderer Component Tests

**File:** `src/components/PageRenderer/__tests__/PageRenderer.test.tsx`

**Tests:**

- Render hero/features sections with Untitled UI
- Render hero/CTA sections with Shadcn UI
- Render multiple sections in correct order
- Skip unknown section types gracefully
- Isolate design systems (no mixing)
- Use Untitled UI when designSystem not specified

**Command:**

```bash
bunx vitest run --silent='passed-only' 'PageRenderer.test.tsx'
```

---

## TDD Workflow

### Step 1: Write All Tests FIRST (Before Implementation)

```bash
# Create test files
touch tests/e2e/page-builder/hello-world.spec.ts
touch tests/e2e/page-builder/multi-design-system.spec.ts
touch tests/e2e/page-builder/tenant-isolation.spec.ts
touch src/libs/payload/__tests__/pageSpec.test.ts
touch src/components/PageRenderer/__tests__/PageRenderer.test.tsx

# Copy test code from TDD plan document

# Run tests - ALL SHOULD FAIL (expected)
npx playwright test tests/e2e/page-builder/
bunx vitest run --silent='passed-only' 'pageSpec.test.ts'
bunx vitest run --silent='passed-only' 'PageRenderer.test.tsx'
```

**Expected:** All tests FAIL ❌ (no implementation exists)

### Step 2: Implement Code to Make Tests Pass

```bash
# Create implementation files
mkdir -p src/libs/payload/schemas
touch src/libs/payload/schemas/pageSpec.ts

mkdir -p src/app/api/pages/create
touch src/app/api/pages/create/route.ts

mkdir -p src/app/api/pages/[id]/publish
touch src/app/api/pages/[id]/publish/route.ts

mkdir -p src/app/preview/[tenantId]/[slug]
touch src/app/preview/[tenantId]/[slug]/page.tsx

mkdir -p src/app/page/[tenantId]/[slug]
touch src/app/page/[tenantId]/[slug]/page.tsx

mkdir -p src/components/PageRenderer/sections/untitled-ui
mkdir -p src/components/PageRenderer/sections/shadcn
touch src/components/PageRenderer/index.tsx
touch src/components/PageRenderer/sections/untitled-ui/HeroSection.tsx
touch src/components/PageRenderer/sections/shadcn/HeroSection.tsx

# Implement minimal code to pass tests
# Run tests iteratively
bunx vitest run --silent='passed-only' 'pageSpec.test.ts'
# ... fix code until passing ...

npx playwright test tests/e2e/page-builder/hello-world.spec.ts
# ... fix code until passing ...

# Repeat for each test file
```

**Expected:** All tests PASS ✅ (after implementation)

### Step 3: Verify Coverage

```bash
# Run all tests with coverage
bunx vitest run --silent='passed-only' --coverage
npx playwright test

# Check coverage report
open coverage/app/index.html

# Verify ≥70% coverage
```

---

## PRD Updates Required

### 1. Add `designSystem` Field to PageSpec

**File:** `docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
**Section:** 5.1

**Before:**

```typescript
interface PageSpec {
  tenantId: string;
  userId: string;
  slug: string;
  title: string;
  sections: PageSpecSection[];
}
```

**After:**

```typescript
interface PageSpec {
  tenantId: string;
  userId: string;
  slug: string;
  title: string;
  designSystem: 'untitledui' | 'shadcn'; // NEW FIELD
  sections: PageSpecSection[];
}
```

### 2. Document Dual Route Structure

**File:** `docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
**Section:** 5.4 (add subsection 5.4.1)

**Add:**

- Preview route: `/preview/[tenantId]/[slug]` (draft + published)
- Published route: `/page/[tenantId]/[slug]` (published only)
- Draft pages return 404 on published route
- Implementation examples for both routes

### 3. Add Design System Architecture

**File:** `docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
**Section:** New Section 5.8

**Add:**

- Component mapping strategy (DESIGN_SYSTEM_COMPONENTS)
- How to add new design systems
- Design system isolation principles
- Example directory structure

### 4. Update Success Criteria

**File:** `docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
**Section:** 11

**Add:**

- [ ] AI can generate pages using Shadcn UI (in addition to Untitled UI)
- [ ] Pages can specify design system via `designSystem` field
- [ ] Preview route works for draft pages
- [ ] Published route works for published pages only
- [ ] Design systems are isolated (no style bleeding)

---

## Gap Analysis Summary

| Requirement                 | Current PRD      | Gap      | Priority |
| --------------------------- | ---------------- | -------- | -------- |
| Multi-design system support | ❌ Not mentioned | CRITICAL | P0       |
| `designSystem` field        | ❌ Missing       | CRITICAL | P0       |
| Dual route structure        | ⚠️ Partial       | HIGH     | P0       |
| Design system extensibility | ❌ Not mentioned | CRITICAL | P1       |
| Component isolation         | ❌ Not mentioned | CRITICAL | P1       |
| Hello World TDD workflow    | ❌ Not mentioned | CRITICAL | P0       |

---

## Test Execution Commands

### Run All Tests

```bash
# All E2E tests
npx playwright test tests/e2e/page-builder/

# All unit tests
bunx vitest run --silent='passed-only' 'pageSpec.test.ts'
bunx vitest run --silent='passed-only' 'PageRenderer.test.tsx'

# With coverage
bunx vitest run --silent='passed-only' --coverage
```

### Run Specific Test Phases

```bash
# Phase 1: Hello World
npx playwright test tests/e2e/page-builder/hello-world.spec.ts

# Phase 2: Multi-Design System
npx playwright test tests/e2e/page-builder/multi-design-system.spec.ts

# Phase 3: Tenant Isolation
npx playwright test tests/e2e/page-builder/tenant-isolation.spec.ts

# Phase 4: PageSpec Validation
bunx vitest run --silent='passed-only' 'pageSpec.test.ts'

# Phase 5: PageRenderer
bunx vitest run --silent='passed-only' 'PageRenderer.test.tsx'
```

### Run Specific Tests by Name

```bash
# E2E test by name
npx playwright test --grep "hello world page with Untitled UI"

# Unit test by name
bunx vitest run --silent='passed-only' -t "should validate complete PageSpec"
```

---

## Acceptance Criteria Checklist

### Phase 1: Hello World ✅

- [ ] Create and preview hello world page works
- [ ] Publishing moves page to `/page/` route
- [ ] Draft status handled correctly
- [ ] Multiple sections render in order

### Phase 2: Multi-Design System ✅

- [ ] Untitled UI pages render correctly
- [ ] Shadcn UI pages render correctly
- [ ] Default to Untitled UI when not specified
- [ ] Design systems isolated (no style bleeding)
- [ ] Invalid design system values rejected

### Phase 3: Tenant Isolation ✅

- [ ] Cross-tenant access blocked (preview route)
- [ ] Cross-tenant access blocked (published route)
- [ ] Same slug works across tenants
- [ ] API enforces tenant boundaries

### Phase 4: PageSpec Validation ✅

- [ ] Valid PageSpec passes validation
- [ ] Missing required fields rejected
- [ ] Invalid designSystem rejected
- [ ] Section types validated

### Phase 5: PageRenderer ✅

- [ ] Both design systems render
- [ ] Sections render in order
- [ ] Unknown sections handled gracefully
- [ ] Design systems isolated

### Overall ✅

- [ ] All tests passing (100% pass rate)
- [ ] Coverage ≥ 70%
- [ ] TypeScript strict mode passing
- [ ] ESLint + Prettier passing
- [ ] PRD updated

---

## Key Design Decisions

### 1. Design System as First-Class Field

**Decision:** Add `designSystem` field to PageSpec at MVP stage

**Rationale:**

- Enables multi-design system architecture from day 1
- Avoids breaking changes later
- Simplifies component selection logic
- Makes testing easier (explicit rather than implicit)

### 2. Dual Route Structure

**Decision:** Separate routes for preview and published pages

**Rationale:**

- Clear separation of concerns (draft vs. production)
- Payload CMS has native draft support (`_status` field)
- Allows different access control policies
- Future-proof for custom domains

### 3. Default to Untitled UI

**Decision:** When `designSystem` omitted, default to `untitledui`

**Rationale:**

- PRD v1.1.0 specifies Untitled UI as primary design system
- Backwards compatibility with existing pages (if any)
- Simplifies migration from Builder.io
- Clear default behavior for AI agents

### 4. Component Isolation

**Decision:** Separate directory structure per design system

**Rationale:**

- Prevents style bleeding between systems
- Easier to maintain and test
- Clear ownership boundaries
- Enables independent updates to each system

---

## Next Actions

1. **Review test plan** with team ✅
2. **Approve PRD updates** before implementation
3. **Create all test files** (copy code from main document)
4. **Run tests to confirm FAIL** (expected)
5. **Begin TDD implementation**
6. **Iterate until all tests pass**
7. **Verify coverage ≥ 70%**
8. **Update PRD documentation**
9. **Commit changes**

---

## Files to Create

```
lobe-builder/
├── tests/e2e/page-builder/
│   ├── hello-world.spec.ts          ← CREATE (Phase 1)
│   ├── multi-design-system.spec.ts  ← CREATE (Phase 2)
│   └── tenant-isolation.spec.ts     ← CREATE (Phase 3)
├── src/libs/payload/
│   ├── __tests__/
│   │   └── pageSpec.test.ts         ← CREATE (Phase 4)
│   └── schemas/
│       └── pageSpec.ts              ← CREATE (implementation)
├── src/components/PageRenderer/
│   ├── __tests__/
│   │   └── PageRenderer.test.tsx    ← CREATE (Phase 5)
│   ├── index.tsx                    ← CREATE (implementation)
│   └── sections/
│       ├── untitled-ui/
│       │   ├── HeroSection.tsx      ← CREATE (implementation)
│       │   ├── FeaturesSection.tsx  ← CREATE (implementation)
│       │   └── CTASection.tsx       ← CREATE (implementation)
│       └── shadcn/
│           ├── HeroSection.tsx      ← CREATE (implementation)
│           ├── FeaturesSection.tsx  ← CREATE (implementation)
│           └── CTASection.tsx       ← CREATE (implementation)
├── src/app/api/pages/
│   ├── create/route.ts              ← CREATE (implementation)
│   └── [id]/publish/route.ts        ← CREATE (implementation)
├── src/app/preview/[tenantId]/[slug]/
│   └── page.tsx                     ← CREATE (implementation)
└── src/app/page/[tenantId]/[slug]/
    └── page.tsx                     ← CREATE (implementation)
```

---

## Important Reminders

**TDD Workflow:**

- ✅ TESTS FIRST, IMPLEMENTATION SECOND
- ✅ All tests should FAIL initially
- ✅ Implement minimal code to pass tests
- ✅ Run tests frequently
- ✅ Refactor only when tests pass

**Testing Best Practices:**

- Use semantic locators (getByRole, getByLabel)
- Test behavior, not implementation
- Verify isolation between tenants
- Test both happy path and error cases

**Design System Best Practices:**

- Keep components isolated per design system
- No shared styles between systems
- Test visual rendering for each system
- Document extensibility for future systems

---

**Full Test Plan:** `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/tdd-test-plan-payload-cms-multi-design-system.md`
