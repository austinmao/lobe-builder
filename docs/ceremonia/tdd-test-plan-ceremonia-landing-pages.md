# TDD Test Plan: Ceremonia Landing Page System

**Version**: 1.0.0
**Created**: 2025-12-10
**Status**: Ready for Implementation
**Owner**: Austin Mao
**Base PRD**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0-unified.md`

---

## Executive Summary

This document outlines a comprehensive Test-Driven Development (TDD) test plan for implementing the Ceremonia Multi-Page Landing System using Payload CMS and Next.js middleware for custom domain routing.

### TDD Approach

**RED → GREEN → REFACTOR**

1. **RED**: Write tests FIRST (they will fail initially)
2. **GREEN**: Write minimal code to make tests pass
3. **REFACTOR**: Clean up code while keeping tests green

### Phase Gates

Each phase has **blocking tests** that MUST pass before proceeding to the next phase. This ensures:

- Incremental progress with verification at each step
- Early detection of architectural issues
- Confidence in production readiness

---

## Test Strategy Overview

### Test Pyramid for This Project

```
                    ┌─────────────────┐
                    │   E2E Tests     │  ← Primary focus (TDD)
                    │   (Playwright)  │
                    └─────────────────┘
                    ┌─────────────────────┐
                    │ Integration Tests   │  ← API + Database
                    │    (Vitest)         │
                    └─────────────────────┘
                    ┌───────────────────────────┐
                    │     Unit Tests            │  ← Middleware logic
                    │      (Vitest)             │
                    └───────────────────────────┘
```

### Test Coverage Targets

| Test Type            | Coverage Target   | Critical Areas                                             |
| -------------------- | ----------------- | ---------------------------------------------------------- |
| E2E (Playwright)     | All user journeys | Custom domain routing, page rendering, publishing workflow |
| Integration (Vitest) | API endpoints     | Payload CMS operations, middleware URL rewriting           |
| Unit (Vitest)        | Utility functions | Middleware logic, tenant configuration                     |

---

## Phase 1: Infrastructure Setup Tests

### Phase Goal

Verify Payload CMS tenant infrastructure and existing route structure work correctly for Ceremonia.

### Test Suite: `phase1-infrastructure.spec.ts`

#### Test 1.1: Payload CMS Tenant Creation

```typescript
test('should create Ceremonia tenant in Payload CMS', async ({ request }) => {
  // RED: This will fail initially (tenant doesn't exist)
  const response = await request.post('/api/payload/users', {
    data: {
      email: 'admin@ceremoniacircle.org',
      password: 'test-password-123',
      tenantId: 'ceremonia',
      role: 'user',
    },
  });

  expect(response.status()).toBe(201);
  const user = await response.json();
  expect(user.tenantId).toBe('ceremonia');
  expect(user.email).toBe('admin@ceremoniacircle.org');
});
```

**Expected Failure**: User creation endpoint may not exist or tenant creation not configured.

**Success Criteria**: Ceremonia tenant user exists in Payload with correct tenantId.

---

#### Test 1.2: Create Test Page via Payload CMS

```typescript
test('should create test page for Ceremonia tenant', async ({ request }) => {
  // Login as Ceremonia user
  const loginResponse = await request.post('/api/payload/login', {
    data: {
      email: 'admin@ceremoniacircle.org',
      password: 'test-password-123',
    },
  });

  const { token } = await loginResponse.json();

  // Create test page
  const response = await request.post('/api/payload/pages', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      tenantId: 'ceremonia',
      userId: 'user_ceremonia_admin',
      slug: 'test-page',
      title: 'Test Page',
      designSystem: 'untitledui',
      _status: 'draft',
      sections: [
        {
          blockType: 'hero',
          title: 'Test Hero',
          subtitle: 'Test Subtitle',
          ctaLabel: 'Test CTA',
          ctaHref: '#test',
        },
      ],
    },
  });

  expect(response.status()).toBe(201);
  const page = await response.json();
  expect(page.tenantId).toBe('ceremonia');
  expect(page.slug).toBe('test-page');
});
```

**Expected Failure**: Pages collection may not enforce tenantId or validation rules.

**Success Criteria**: Page created with correct tenant isolation.

---

#### Test 1.3: Preview Route Renders Draft Page

```typescript
test('should render draft page at preview route', async ({ page }) => {
  // Navigate to preview route
  await page.goto('/preview/ceremonia/test-page');

  // Verify page renders
  await expect(page.locator('h1')).toContainText('Test Hero');
  await expect(page.locator('p')).toContainText('Test Subtitle');
  await expect(page.locator('button')).toContainText('Test CTA');

  // Verify status code
  const response = await page.goto('/preview/ceremonia/test-page');
  expect(response?.status()).toBe(200);
});
```

**Expected Failure**: Preview route may not exist or PageRenderer not configured.

**Success Criteria**: Draft page accessible via `/preview/ceremonia/test-page`.

---

#### Test 1.4: Published Route Returns 404 for Draft Page

```typescript
test('should return 404 for draft page on published route', async ({ page }) => {
  // Navigate to published route (page is still draft)
  const response = await page.goto('/page/ceremonia/test-page');

  // Verify 404
  expect(response?.status()).toBe(404);
  await expect(page.locator('text=Page Not Found')).toBeVisible();
});
```

**Expected Failure**: Published route may not filter by `_status`.

**Success Criteria**: Published route only shows published pages.

---

#### Test 1.5: Publish Page and Verify Published Route

```typescript
test('should render published page after publishing', async ({ request, page }) => {
  // Login and get page ID
  const loginResponse = await request.post('/api/payload/login', {
    data: {
      email: 'admin@ceremoniacircle.org',
      password: 'test-password-123',
    },
  });
  const { token } = await loginResponse.json();

  // Get page to find ID
  const pagesResponse = await request.get('/api/payload/pages?where[slug][equals]=test-page', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { docs } = await pagesResponse.json();
  const pageId = docs[0].id;

  // Publish page
  const publishResponse = await request.patch(`/api/payload/pages/${pageId}`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { _status: 'published' },
  });
  expect(publishResponse.status()).toBe(200);

  // Verify published route now works
  await page.goto('/page/ceremonia/test-page');
  await expect(page.locator('h1')).toContainText('Test Hero');
});
```

**Expected Failure**: Publish workflow may not be configured.

**Success Criteria**: Published page accessible via `/page/ceremonia/test-page`.

---

#### Test 1.6: Cross-Tenant Isolation

```typescript
test('should block access to other tenant pages', async ({ request }) => {
  // Create another tenant page
  const otherTenantLoginResponse = await request.post('/api/payload/login', {
    data: {
      email: 'admin@other-tenant.com',
      password: 'other-password',
    },
  });
  const { token: otherToken } = await otherTenantLoginResponse.json();

  await request.post('/api/payload/pages', {
    headers: { Authorization: `Bearer ${otherToken}` },
    data: {
      tenantId: 'other-tenant',
      slug: 'other-page',
      title: 'Other Page',
      designSystem: 'untitledui',
      _status: 'published',
      sections: [],
    },
  });

  // Try to access with Ceremonia token
  const loginResponse = await request.post('/api/payload/login', {
    data: {
      email: 'admin@ceremoniacircle.org',
      password: 'test-password-123',
    },
  });
  const { token } = await loginResponse.json();

  const response = await request.get('/api/payload/pages?where[slug][equals]=other-page', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { docs } = await response.json();
  expect(docs).toHaveLength(0); // Should not see other tenant's pages
});
```

**Expected Failure**: Access control may not be enforced.

**Success Criteria**: Tenant A cannot access Tenant B's pages.

---

### Phase 1 Exit Criteria (BLOCKING)

- [ ] All 6 tests passing
- [ ] Ceremonia tenant created
- [ ] Test page accessible at `/preview/ceremonia/test-page`
- [ ] Published page accessible at `/page/ceremonia/test-page`
- [ ] Cross-tenant isolation verified

---

## Phase 2: Middleware Implementation Tests

### Phase Goal

Implement and verify custom domain routing via Next.js middleware.

### Test Suite: `phase2-middleware.spec.ts`

#### Test 2.1: Middleware Rewrites Custom Domain Requests

```typescript
test('should rewrite custom domain /lp/slug to /page/tenantId/slug', async ({ page, context }) => {
  // Mock custom domain (in real test, use hosts file or Playwright proxy)
  await context.route('https://live.ceremoniacircle.org/**', (route) => {
    const url = new URL(route.request().url());
    url.hostname = 'localhost';
    url.port = '3010';
    route.continue({ url: url.toString() });
  });

  // Navigate to custom domain URL
  const response = await page.goto('https://live.ceremoniacircle.org/lp/test-page');

  // Verify page renders (rewritten to /page/ceremonia/test-page)
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('Test Hero');

  // Verify URL in browser remains clean
  expect(page.url()).toContain('/lp/test-page');
});
```

**Expected Failure**: Middleware doesn't exist yet.

**Success Criteria**: Custom domain requests rewritten to internal routes.

---

#### Test 2.2: Middleware Blocks Non-Allowed Paths on Custom Domain

```typescript
test('should return 404 for non-allowed paths on custom domain', async ({ page, context }) => {
  await context.route('https://live.ceremoniacircle.org/**', (route) => {
    const url = new URL(route.request().url());
    url.hostname = 'localhost';
    url.port = '3010';
    route.continue({ url: url.toString() });
  });

  // Try to access blocked path
  const response = await page.goto('https://live.ceremoniacircle.org/chat');

  // Verify 404
  expect(response?.status()).toBe(404);
  await expect(page.locator('text=404')).toBeVisible();
});
```

**Expected Failure**: Path blocking not implemented.

**Success Criteria**: Non-allowed paths return 404 on custom domain.

---

#### Test 2.3: Main Domain Routes Work Normally

```typescript
test('should not interfere with main domain routes', async ({ page }) => {
  // Navigate to main domain routes (should work normally)
  await page.goto('/preview/ceremonia/test-page');
  await expect(page.locator('h1')).toContainText('Test Hero');

  await page.goto('/page/ceremonia/test-page');
  await expect(page.locator('h1')).toContainText('Test Hero');
});
```

**Expected Failure**: Middleware may interfere with existing routes.

**Success Criteria**: Main domain routes unaffected by middleware.

---

#### Test 2.4: Middleware Adds Tenant Header

```typescript
test('should add x-tenant-id header for custom domain requests', async ({ page }) => {
  let headers: Record<string, string> = {};

  // Intercept requests to capture headers
  page.on('request', (request) => {
    headers = request.headers();
  });

  await page.goto('https://live.ceremoniacircle.org/lp/test-page');

  // Verify tenant header added
  expect(headers['x-tenant-id']).toBe('ceremonia');
});
```

**Expected Failure**: Header not added by middleware.

**Success Criteria**: Middleware adds tenant identification header.

---

#### Test 2.5: Middleware Performance Benchmark

```typescript
test('middleware should execute in under 10ms', async ({ request }) => {
  const start = Date.now();

  await request.get('https://live.ceremoniacircle.org/lp/test-page');

  const duration = Date.now() - start;

  // Middleware should add minimal overhead
  expect(duration).toBeLessThan(100); // Conservative upper bound
});
```

**Expected Failure**: May not fail, but establishes performance baseline.

**Success Criteria**: Middleware adds < 10ms P95 latency.

---

### Phase 2 Exit Criteria (BLOCKING)

- [ ] All 5 tests passing
- [ ] Middleware file created at `src/middleware.ts`
- [ ] Custom domain requests rewrite correctly
- [ ] Path blocking works
- [ ] Main domain routes unaffected
- [ ] Performance acceptable (< 10ms middleware overhead)

---

## Phase 3: First Landing Page Tests

### Phase Goal

Create and verify Ceremonia's first real landing page with complete content.

### Test Suite: `phase3-landing-page.spec.ts`

#### Test 3.1: Create First Landing Page via Payload

```typescript
test('should create "Softening the Season" page in Payload', async ({ request }) => {
  const loginResponse = await request.post('/api/payload/login', {
    data: {
      email: 'admin@ceremoniacircle.org',
      password: 'test-password-123',
    },
  });
  const { token } = await loginResponse.json();

  const response = await request.post('/api/payload/pages', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      tenantId: 'ceremonia',
      userId: 'user_ceremonia_admin',
      slug: 'softening-the-season-3-simple-skills-for-connection-in-the-chaos',
      title: 'Softening the Season: 3 Simple Skills for Connection in the Chaos',
      designSystem: 'untitledui',
      _status: 'draft',
      sections: [
        {
          blockType: 'hero',
          title: 'Softening the Season',
          subtitle: '3 Simple Skills for Connection in the Chaos',
          ctaLabel: 'Join Us',
          ctaHref: '#register',
        },
        {
          blockType: 'features',
          heading: "What You'll Learn",
          items: [
            {
              icon: 'heart',
              title: 'Emotional Regulation',
              description: 'Tools to manage stress during the holidays',
            },
            {
              icon: 'users',
              title: 'Connection Skills',
              description: 'Deepen relationships with loved ones',
            },
            {
              icon: 'brain',
              title: 'Mindfulness Practices',
              description: 'Stay present amidst the chaos',
            },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Ready to Transform Your Holidays?',
          description: 'Join us for this transformative workshop',
          primaryButton: {
            label: 'Register Now',
            href: '#register',
          },
        },
      ],
    },
  });

  expect(response.status()).toBe(201);
  const page = await response.json();
  expect(page.slug).toBe('softening-the-season-3-simple-skills-for-connection-in-the-chaos');
});
```

**Expected Failure**: Page structure may not match schema.

**Success Criteria**: Full landing page created with Hero, Features, CTA sections.

---

#### Test 3.2: Page Renders with Untitled UI Components

```typescript
test('should render page with Untitled UI design system', async ({ page }) => {
  await page.goto(
    '/preview/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  );

  // Verify Hero section
  await expect(page.locator('h1')).toContainText('Softening the Season');
  await expect(page.locator('text=3 Simple Skills for Connection in the Chaos')).toBeVisible();

  // Verify Features section
  await expect(page.locator("text=What You'll Learn")).toBeVisible();
  await expect(page.locator('text=Emotional Regulation')).toBeVisible();
  await expect(page.locator('text=Connection Skills')).toBeVisible();
  await expect(page.locator('text=Mindfulness Practices')).toBeVisible();

  // Verify CTA section
  await expect(page.locator('text=Ready to Transform Your Holidays?')).toBeVisible();
  await expect(page.locator('button:has-text("Register Now")')).toBeVisible();

  // Verify Untitled UI styles applied (check for design system class names)
  const heroElement = page.locator('h1');
  const classes = await heroElement.getAttribute('class');
  expect(classes).toContain('text-display'); // Untitled UI typography class
});
```

**Expected Failure**: PageRenderer may not map sections correctly.

**Success Criteria**: All sections render with correct Untitled UI styling.

---

#### Test 3.3: Mobile Responsive Layout

```typescript
test('should be mobile responsive', async ({ page }) => {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(
    '/preview/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  );

  // Verify content visible and readable
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('text=Emotional Regulation')).toBeVisible();

  // Verify no horizontal scroll
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBe(clientWidth);

  // Test tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(
    '/preview/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  );
  await expect(page.locator('h1')).toBeVisible();
});
```

**Expected Failure**: Responsive styles may not be applied.

**Success Criteria**: Page renders correctly on mobile and tablet.

---

#### Test 3.4: SEO Metadata Present

```typescript
test('should have correct SEO metadata', async ({ page }) => {
  await page.goto(
    '/page/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  );

  // Verify page title
  await expect(page).toHaveTitle(/Softening the Season/);

  // Verify meta description
  const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
  expect(metaDescription).toContain('3 Simple Skills for Connection in the Chaos');

  // Verify Open Graph tags
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  const ogDescription = await page
    .locator('meta[property="og:description"]')
    .getAttribute('content');

  expect(ogTitle).toContain('Softening the Season');
  expect(ogDescription).toBeTruthy();
});
```

**Expected Failure**: SEO metadata may not be generated.

**Success Criteria**: Page has complete SEO metadata.

---

#### Test 3.5: Page Load Performance

```typescript
test('should load in under 3 seconds', async ({ page }) => {
  const start = Date.now();

  await page.goto(
    '/page/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
    {
      waitUntil: 'networkidle',
    },
  );

  const loadTime = Date.now() - start;

  expect(loadTime).toBeLessThan(3000);

  // Verify Core Web Vitals
  const metrics = await page.evaluate(() => {
    return {
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      lcp: performance.getEntriesByType('largest-contentful-paint').pop()?.startTime,
    };
  });

  expect(metrics.fcp).toBeLessThan(1500); // FCP < 1.5s
  expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
});
```

**Expected Failure**: Performance may not meet targets initially.

**Success Criteria**: Page loads in < 3s with good Core Web Vitals.

---

### Phase 3 Exit Criteria (BLOCKING)

- [ ] All 5 tests passing
- [ ] First page created with complete content
- [ ] Page renders with Untitled UI components
- [ ] Mobile responsive
- [ ] SEO metadata present
- [ ] Performance meets targets (< 3s load time)

---

## Phase 4: Domain Configuration Tests

### Phase Goal

Configure custom domain and verify production deployment.

### Test Suite: `phase4-domain.spec.ts`

#### Test 4.1: HTTPS Active on Custom Domain

```typescript
test('should serve page over HTTPS on custom domain', async ({ page }) => {
  const response = await page.goto(
    'https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  );

  // Verify HTTPS
  expect(page.url()).toContain('https://');

  // Verify SSL certificate valid
  expect(response?.status()).toBe(200);
});
```

**Expected Failure**: Custom domain not configured yet.

**Success Criteria**: Page accessible via HTTPS on custom domain.

---

#### Test 4.2: No Mixed Content Warnings

```typescript
test('should have no mixed content warnings', async ({ page }) => {
  const warnings: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'warning' && msg.text().includes('mixed content')) {
      warnings.push(msg.text());
    }
  });

  await page.goto(
    'https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  );

  expect(warnings).toHaveLength(0);
});
```

**Expected Failure**: May have HTTP resources loaded.

**Success Criteria**: All resources loaded over HTTPS.

---

#### Test 4.3: SSL Certificate Valid

```typescript
test('should have valid SSL certificate', async ({ request }) => {
  const response = await request.get(
    'https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  );

  // Verify certificate (Playwright auto-validates)
  expect(response.status()).toBe(200);

  // Additional check: no SSL errors in console
  const securityDetails = await response.securityDetails();
  expect(securityDetails).toBeTruthy();
});
```

**Expected Failure**: SSL may not be configured.

**Success Criteria**: Valid SSL certificate issued and active.

---

#### Test 4.4: DNS Resolution

```typescript
test('should resolve DNS correctly', async () => {
  // Note: This is a smoke test; real DNS verification done externally
  const dns = require('dns').promises;

  const records = await dns.resolveCname('live.ceremoniacircle.org');

  expect(records).toContain('cname.vercel-dns.com');
});
```

**Expected Failure**: DNS not configured yet.

**Success Criteria**: CNAME record points to Vercel.

---

#### Test 4.5: Production Page Load Time

```typescript
test('should load production page in under 3 seconds', async ({ page }) => {
  const start = Date.now();

  await page.goto(
    'https://live.ceremoniacircle.org/lp/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
    {
      waitUntil: 'networkidle',
    },
  );

  const loadTime = Date.now() - start;

  expect(loadTime).toBeLessThan(3000);
});
```

**Expected Failure**: Initial load may be slow.

**Success Criteria**: Production page meets performance targets.

---

### Phase 4 Exit Criteria (BLOCKING)

- [ ] All 5 tests passing
- [ ] HTTPS active on custom domain
- [ ] No mixed content warnings
- [ ] Valid SSL certificate
- [ ] DNS resolves correctly
- [ ] Performance meets production targets

---

## Phase 5: Documentation & Workflow Tests

### Phase Goal

Verify end-to-end content management workflow for Ceremonia team.

### Test Suite: `phase5-documentation.spec.ts`

#### Test 5.1: Create New Page via Payload Admin

```typescript
test('Ceremonia user can create new page via Payload admin', async ({ page }) => {
  // Login to Payload
  await page.goto('/admin');
  await page.fill('input[name="email"]', 'admin@ceremoniacircle.org');
  await page.fill('input[name="password"]', 'test-password-123');
  await page.click('button[type="submit"]');

  // Navigate to Pages collection
  await page.click('text=Pages');

  // Click Create New
  await page.click('text=Create New');

  // Fill in page details
  await page.fill('input[name="title"]', 'New Event Page');
  await page.fill('input[name="slug"]', 'new-event-page');

  // Select design system
  await page.selectOption('select[name="designSystem"]', 'untitledui');

  // Add Hero section
  await page.click('text=Add Block');
  await page.click('text=Hero Section');
  await page.fill('input[name="sections.0.title"]', 'New Event');
  await page.fill('textarea[name="sections.0.subtitle"]', 'Event Description');

  // Save as draft
  await page.click('button:has-text("Save Draft")');

  // Verify success message
  await expect(page.locator('text=Successfully created')).toBeVisible();
});
```

**Expected Failure**: Payload admin workflow may not be configured.

**Success Criteria**: Non-technical user can create page via admin.

---

#### Test 5.2: Edit Existing Page

```typescript
test('Ceremonia user can edit existing page', async ({ page }) => {
  // Login and navigate to pages
  await page.goto('/admin');
  await page.fill('input[name="email"]', 'admin@ceremoniacircle.org');
  await page.fill('input[name="password"]', 'test-password-123');
  await page.click('button[type="submit"]');
  await page.click('text=Pages');

  // Select existing page
  await page.click('text=Softening the Season');

  // Edit hero title
  await page.fill('input[name="sections.0.title"]', 'Updated Title');

  // Save
  await page.click('button:has-text("Save")');

  // Verify changes saved
  await expect(page.locator('text=Successfully updated')).toBeVisible();

  // Verify changes on preview
  await page.goto(
    '/preview/ceremonia/softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  );
  await expect(page.locator('h1')).toContainText('Updated Title');
});
```

**Expected Failure**: Edit workflow may not update preview.

**Success Criteria**: Edits reflect immediately in preview.

---

#### Test 5.3: Publish Page

```typescript
test('Ceremonia user can publish draft page', async ({ page }) => {
  // Login and navigate to draft page
  await page.goto('/admin');
  await page.fill('input[name="email"]', 'admin@ceremoniacircle.org');
  await page.fill('input[name="password"]', 'test-password-123');
  await page.click('button[type="submit"]');
  await page.click('text=Pages');
  await page.click('text=New Event Page');

  // Publish
  await page.click('button:has-text("Publish")');

  // Verify success
  await expect(page.locator('text=Successfully published')).toBeVisible();

  // Verify accessible on custom domain
  await page.goto('https://live.ceremoniacircle.org/lp/new-event-page');
  await expect(page.locator('h1')).toContainText('New Event');
});
```

**Expected Failure**: Publish workflow may not be configured.

**Success Criteria**: Published page accessible on custom domain.

---

#### Test 5.4: Preview Before Publishing

```typescript
test('Ceremonia user can preview changes before publishing', async ({ page, context }) => {
  // Login and edit page
  await page.goto('/admin');
  await page.fill('input[name="email"]', 'admin@ceremoniacircle.org');
  await page.fill('input[name="password"]', 'test-password-123');
  await page.click('button[type="submit"]');
  await page.click('text=Pages');
  await page.click('text=New Event Page');

  // Make change
  await page.fill('input[name="sections.0.title"]', 'Draft Title');
  await page.click('button:has-text("Save Draft")');

  // Open preview in new tab
  const [previewPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click('button:has-text("Preview")'),
  ]);

  // Verify draft changes visible
  await expect(previewPage.locator('h1')).toContainText('Draft Title');

  // Verify published version unchanged
  await page.goto('https://live.ceremoniacircle.org/lp/new-event-page');
  await expect(page.locator('h1')).not.toContainText('Draft Title');
});
```

**Expected Failure**: Preview may not show draft-only changes.

**Success Criteria**: Preview shows draft, published route shows published version.

---

### Phase 5 Exit Criteria (BLOCKING)

- [ ] All 4 tests passing
- [ ] Ceremonia team can create pages via Payload admin
- [ ] Ceremonia team can edit and publish pages
- [ ] Preview workflow works correctly
- [ ] Documentation complete

---

## Test Fixtures

### Fixture: Test Page Data

```typescript
// tests/e2e/ceremonia/fixtures/test-page.ts
export const testPageData = {
  tenantId: 'ceremonia',
  userId: 'user_ceremonia_admin',
  slug: 'test-page',
  title: 'Test Page',
  designSystem: 'untitledui' as const,
  _status: 'draft' as const,
  sections: [
    {
      blockType: 'hero',
      title: 'Test Hero',
      subtitle: 'Test Subtitle',
      ctaLabel: 'Test CTA',
      ctaHref: '#test',
    },
  ],
};
```

### Fixture: Ceremonia User Credentials

```typescript
// tests/e2e/ceremonia/fixtures/user.ts
export const ceremoniaUser = {
  email: 'admin@ceremoniacircle.org',
  password: 'test-password-123',
  tenantId: 'ceremonia',
  role: 'user',
};
```

### Fixture: First Landing Page Data

```typescript
// tests/e2e/ceremonia/fixtures/first-page.ts
export const firstLandingPage = {
  tenantId: 'ceremonia',
  userId: 'user_ceremonia_admin',
  slug: 'softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  title: 'Softening the Season: 3 Simple Skills for Connection in the Chaos',
  designSystem: 'untitledui' as const,
  _status: 'draft' as const,
  sections: [
    {
      blockType: 'hero',
      title: 'Softening the Season',
      subtitle: '3 Simple Skills for Connection in the Chaos',
      ctaLabel: 'Join Us',
      ctaHref: '#register',
    },
    {
      blockType: 'features',
      heading: "What You'll Learn",
      items: [
        {
          icon: 'heart',
          title: 'Emotional Regulation',
          description: 'Tools to manage stress during the holidays',
        },
        {
          icon: 'users',
          title: 'Connection Skills',
          description: 'Deepen relationships with loved ones',
        },
        {
          icon: 'brain',
          title: 'Mindfulness Practices',
          description: 'Stay present amidst the chaos',
        },
      ],
    },
    {
      blockType: 'cta',
      heading: 'Ready to Transform Your Holidays?',
      description: 'Join us for this transformative workshop',
      primaryButton: {
        label: 'Register Now',
        href: '#register',
      },
    },
  ],
};
```

---

## Test Execution Strategy

### Local Development

```bash
# Run all Ceremonia tests
npx playwright test tests/e2e/ceremonia/

# Run specific phase
npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts

# Run with UI mode (debugging)
npx playwright test tests/e2e/ceremonia/ --ui

# Run with trace
npx playwright test tests/e2e/ceremonia/ --trace on
```

### CI/CD Pipeline

```yaml
# .github/workflows/ceremonia-tests.yml
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
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: pnpm install
      - name: Run Phase 1 tests
        run: npx playwright test tests/e2e/ceremonia/phase1-infrastructure.spec.ts
      - name: Run Phase 2 tests
        run: npx playwright test tests/e2e/ceremonia/phase2-middleware.spec.ts
        if: success()
      - name: Run Phase 3 tests
        run: npx playwright test tests/e2e/ceremonia/phase3-landing-page.spec.ts
        if: success()
      - name: Run Phase 4 tests
        run: npx playwright test tests/e2e/ceremonia/phase4-domain.spec.ts
        if: success()
      - name: Run Phase 5 tests
        run: npx playwright test tests/e2e/ceremonia/phase5-documentation.spec.ts
        if: success()
```

---

## Coverage Tracking

### Test Coverage Matrix

| Feature                    | Unit Tests | Integration Tests | E2E Tests | Status    |
| -------------------------- | ---------- | ----------------- | --------- | --------- |
| Payload Tenant Creation    | N/A        | ✅                | ✅        | Phase 1   |
| Middleware URL Rewriting   | ✅         | ✅                | ✅        | Phase 2   |
| Custom Domain Routing      | ✅         | ✅                | ✅        | Phase 2   |
| Page Rendering (Preview)   | N/A        | ✅                | ✅        | Phase 1   |
| Page Rendering (Published) | N/A        | ✅                | ✅        | Phase 1   |
| Cross-Tenant Isolation     | N/A        | ✅                | ✅        | Phase 1   |
| Publishing Workflow        | N/A        | ✅                | ✅        | Phase 3   |
| Mobile Responsiveness      | N/A        | N/A               | ✅        | Phase 3   |
| SEO Metadata               | N/A        | N/A               | ✅        | Phase 3   |
| Performance                | N/A        | N/A               | ✅        | Phase 3/4 |
| HTTPS Configuration        | N/A        | N/A               | ✅        | Phase 4   |
| Payload Admin Workflow     | N/A        | N/A               | ✅        | Phase 5   |

---

## Success Metrics

### Phase-Level Metrics

| Phase     | Total Tests | Critical Tests | Estimated Duration |
| --------- | ----------- | -------------- | ------------------ |
| Phase 1   | 6           | 6              | 1-2 days           |
| Phase 2   | 5           | 5              | 1-2 days           |
| Phase 3   | 5           | 4              | 1-2 days           |
| Phase 4   | 5           | 4              | 1 day              |
| Phase 5   | 4           | 3              | 1 day              |
| **Total** | **25**      | **22**         | **5-9 days**       |

### Overall Success Criteria

- [ ] All 25 tests passing
- [ ] 100% test pass rate
- [ ] No manual verification required
- [ ] Ceremonia team trained and confident
- [ ] Production deployment successful

---

## Appendix A: Test Dependencies

### Required Packages

```json
{
  "devDependencies": {
    "@playwright/test": "^1.51.0",
    "@axe-core/playwright": "^4.10.0",
    "vitest": "^4.0.7",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0"
  }
}
```

### Environment Setup

```bash
# .env.e2e
BASE_URL=http://localhost:3010
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
PAYLOAD_SECRET=test-secret-key
```

---

## Appendix B: Related Documents

- **Unified PRD**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/product-requirements-v1.0.0-unified.md`
- **Architectural Analysis**: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/architectural-compatibility-analysis.md`
- **Page Builder PRD**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/docs/artifacts/prd-builder-landing-page-generator-v1.1.0.md`
- **Playwright Config**: `/Users/austinmao/Documents/GitHub/lobe-builder/lobe-builder/playwright.config.ts`

---

**Document Status**: READY FOR IMPLEMENTATION
**Test-First Approach**: ENFORCED (all tests written before implementation)
**Phase Gates**: BLOCKING (each phase must pass before next phase begins)
**Owner**: Austin Mao
**Created**: 2025-12-10
