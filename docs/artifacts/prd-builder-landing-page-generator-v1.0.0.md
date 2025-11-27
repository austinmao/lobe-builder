# Product Requirements Document v1.0.1

## AI-Powered Funnel Builder with LobeChat + Builder Integration

**Version:** v1.0.1 (TDD-Compliant)
**Owner:** Austin Mao
**Scope:** MVP integration of LobeChat with Builder.io to generate, preview, and store landing pages via LangGraph backend orchestration.
**Status:** Draft
**Created:** 2025-11-27
**Updated:** 2025-11-27 (TDD restructure)

---

## 1. Product Overview

We are building the foundation of an **AI-powered funnel generator** that allows a user to:

1. Chat with an AI assistant (via LobeChat UI).
2. The AI generates a structured PageSpec representing a landing page.
3. The backend converts the PageSpec into a Builder.io page, stored in a tenant's Builder Space.
4. LobeChat displays the final Builder-rendered landing page in its built-in **Artifact Preview Pane** (via iframe).

This PRD follows **Test-Driven Development (TDD)** principles: all test cases are defined BEFORE implementation begins.

---

## 2. Goals & Objectives

### Primary Goals

1. **Chat-driven landing page generation**
   - User chats in LobeChat asking for a landing page.
   - System produces a Builder-backed page.

2. **Live page preview inside the chat UI**
   - LobeChat artifact used to show an iframe of Builder page preview.

3. **Full automation**
   - LangGraph agent orchestrates page generation end-to-end.

4. **Test-Driven Development**
   - All tests written FIRST before implementation.
   - RED-GREEN-REFACTOR workflow enforced.
   - 100% test pass rate required before feature completion.

---

## 3. TDD Workflow & Testing Requirements

### 3.1 TDD Philosophy

This project follows strict Test-Driven Development:

**RED-GREEN-REFACTOR Cycle:**

```
1. RED:    Write a failing test that defines desired behavior
2. GREEN:  Write minimal code to make the test pass
3. REFACTOR: Improve code quality while keeping tests green
4. REPEAT: Move to next test case
```

**Core Principles:**

- Tests are written BEFORE implementation code
- Each feature requires corresponding test cases
- Tests must fail initially (proving they test something)
- Implementation continues until all tests pass
- No feature is "complete" without passing tests

### 3.2 Test Organization

**Test File Locations** (following LobeChat conventions):

```
src/
├── features/Portal/Artifacts/Body/Renderer/
│   ├── Builder.tsx
│   └── Builder.test.tsx                    # Unit tests for BuilderRenderer
├── server/services/builder/
│   ├── pageSpecToBuilderContent.ts
│   └── pageSpecToBuilderContent.test.ts    # Unit tests for PageSpec mapping
├── app/(backend)/api/builder/page/
│   ├── route.ts
│   └── route.test.ts                       # Integration tests for API endpoint
└── app/builder-preview/[slug]/
    ├── page.tsx
    └── page.test.tsx                       # Integration tests for preview route

tests/
└── e2e/
    └── builder-landing-page.spec.ts        # E2E tests with Playwright
```

### 3.3 Test Specifications (WRITE THESE FIRST)

#### 3.3.1 Unit Tests (Vitest)

**File:** `src/server/services/builder/pageSpecToBuilderContent.test.ts`

```typescript
import type { PageSpec } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { pageSpecToBuilderContent } from './pageSpecToBuilderContent';

describe('pageSpecToBuilderContent', () => {
  describe('hero section mapping', () => {
    it('should convert hero section to Builder block with correct structure', () => {
      const pageSpec: PageSpec = {
        slug: 'test-page',
        title: 'Test Page',
        sections: [
          {
            type: 'hero',
            title: 'Hero Title',
            subtitle: 'Hero Subtitle',
            ctaLabel: 'Click Me',
          },
        ],
      };

      const result = pageSpecToBuilderContent(pageSpec);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        '@type': '@builder.io/sdk:Element',
        'component': {
          name: 'Hero',
          options: {
            title: 'Hero Title',
            subtitle: 'Hero Subtitle',
            ctaLabel: 'Click Me',
          },
        },
      });
    });
  });

  describe('text section mapping', () => {
    it('should convert text section to Builder block with HTML content', () => {
      const pageSpec: PageSpec = {
        slug: 'test-page',
        title: 'Test Page',
        sections: [
          {
            type: 'text',
            heading: 'About Us',
            body: 'We are awesome',
          },
        ],
      };

      const result = pageSpecToBuilderContent(pageSpec);

      expect(result).toHaveLength(1);
      expect(result[0].component.options.text).toBe('<h2>About Us</h2><p>We are awesome</p>');
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown section type', () => {
      const pageSpec: PageSpec = {
        slug: 'test-page',
        title: 'Test Page',
        sections: [{ type: 'unknown' as any }],
      };

      expect(() => pageSpecToBuilderContent(pageSpec)).toThrow('Unknown section type: unknown');
    });
  });

  describe('multiple sections', () => {
    it('should convert multiple sections in correct order', () => {
      const pageSpec: PageSpec = {
        slug: 'test-page',
        title: 'Test Page',
        sections: [
          { type: 'hero', title: 'Hero', subtitle: 'Sub', ctaLabel: 'CTA' },
          { type: 'text', heading: 'Text', body: 'Body' },
        ],
      };

      const result = pageSpecToBuilderContent(pageSpec);

      expect(result).toHaveLength(2);
      expect(result[0].component.name).toBe('Hero');
      expect(result[1].component.name).toBe('Text');
    });
  });
});
```

---

**File:** `src/features/Portal/Artifacts/Body/Renderer/Builder.test.tsx`

```typescript
/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import BuilderRenderer from './Builder';

describe('<BuilderRenderer />', () => {
  describe('valid content rendering', () => {
    it('should render iframe with correct src when given valid JSON', () => {
      const content = JSON.stringify({
        slug: 'meditation-retreat',
        builderUrl: '/builder-preview/meditation-retreat',
      });

      render(<BuilderRenderer content={content} />);

      const iframe = screen.getByTitle('Builder Page Preview');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', '/builder-preview/meditation-retreat');
    });

    it('should render iframe with full width and height styles', () => {
      const content = JSON.stringify({
        slug: 'test',
        builderUrl: '/builder-preview/test',
      });

      render(<BuilderRenderer content={content} />);

      const iframe = screen.getByTitle('Builder Page Preview');
      expect(iframe).toHaveStyle({
        border: 'none',
        height: '100%',
        width: '100%',
      });
    });
  });

  describe('invalid content handling', () => {
    it('should display error message when content is invalid JSON', () => {
      render(<BuilderRenderer content="invalid json{" />);

      expect(screen.getByText('Invalid Builder artifact')).toBeInTheDocument();
      expect(screen.queryByTitle('Builder Page Preview')).not.toBeInTheDocument();
    });

    it('should display error message when builderUrl is missing', () => {
      const content = JSON.stringify({ slug: 'test' }); // Missing builderUrl

      render(<BuilderRenderer content={content} />);

      expect(screen.getByText('Invalid Builder artifact')).toBeInTheDocument();
    });

    it('should display error message when builderUrl is empty string', () => {
      const content = JSON.stringify({ slug: 'test', builderUrl: '' });

      render(<BuilderRenderer content={content} />);

      expect(screen.getByText('Invalid Builder artifact')).toBeInTheDocument();
    });
  });
});
```

---

#### 3.3.2 Integration Tests (Vitest)

**File:** `src/app/(backend)/api/builder/page/route.test.ts`

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

// Mock environment variables
vi.stubEnv('BUILDER_PRIVATE_API_KEY', 'test-private-key');
vi.stubEnv('NEXT_PUBLIC_BUILDER_API_KEY', 'test-public-key');

describe('POST /api/builder/page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful page creation', () => {
    it('should create Builder page and return slug', async () => {
      // Mock Builder API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'builder-page-id' }),
      });

      const pageSpec = {
        slug: 'meditation-retreat',
        title: 'Meditation Retreat Landing Page',
        sections: [
          {
            type: 'hero',
            title: 'Find Inner Peace',
            subtitle: 'Join our 2025 retreat',
            ctaLabel: 'Apply Now',
          },
        ],
      };

      const request = new Request('http://localhost:3000/api/builder/page', {
        method: 'POST',
        body: JSON.stringify(pageSpec),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ slug: 'meditation-retreat' });

      // Verify Builder API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://builder.io/api/v1/write/page',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-private-key',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should send correct Builder block structure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'test-id' }),
      });

      const pageSpec = {
        slug: 'test',
        title: 'Test',
        sections: [{ type: 'hero', title: 'Hero', subtitle: 'Sub', ctaLabel: 'CTA' }],
      };

      const request = new Request('http://localhost:3000/api/builder/page', {
        method: 'POST',
        body: JSON.stringify(pageSpec),
      });

      await POST(request);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.data.blocks).toHaveLength(1);
      expect(body.data.blocks[0].component.name).toBe('Hero');
    });
  });

  describe('error handling', () => {
    it('should return 500 when Builder API fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const request = new Request('http://localhost:3000/api/builder/page', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test', title: 'Test', sections: [] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create page' });
    });

    it('should return 400 for invalid PageSpec schema', async () => {
      const request = new Request('http://localhost:3000/api/builder/page', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
```

---

**File:** `src/app/builder-preview/[slug]/page.test.tsx`

```typescript
/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BuilderPreviewPage from './page';

// Mock Builder SDK
vi.mock('@builder.io/sdk', () => ({
  builder: {
    init: vi.fn(),
    get: vi.fn(() => ({
      promise: vi.fn(),
    })),
  },
}));

vi.mock('@builder.io/sdk-react-nextjs', () => ({
  RenderBuilderContent: ({ content }: any) => (
    <div data-testid="builder-content">{content.data.title}</div>
  ),
}));

describe('BuilderPreviewPage', () => {
  describe('successful content rendering', () => {
    it('should render Builder content when page exists', async () => {
      const { builder } = await import('@builder.io/sdk');
      (builder.get as any).mockReturnValue({
        promise: async () => ({
          data: { title: 'Meditation Retreat' },
        }),
      });

      const params = Promise.resolve({ slug: 'meditation-retreat' });
      const page = await BuilderPreviewPage({ params });

      render(page);

      expect(screen.getByTestId('builder-content')).toHaveTextContent('Meditation Retreat');
    });
  });

  describe('error handling', () => {
    it('should display 404 message when page not found', async () => {
      const { builder } = await import('@builder.io/sdk');
      (builder.get as any).mockReturnValue({
        promise: async () => null,
      });

      const params = Promise.resolve({ slug: 'non-existent' });
      const page = await BuilderPreviewPage({ params });

      render(page);

      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('No Builder content found for: /non-existent')).toBeInTheDocument();
    });
  });

  describe('Builder SDK configuration', () => {
    it('should fetch page with includeUnpublished option', async () => {
      const { builder } = await import('@builder.io/sdk');
      const mockGet = vi.fn().mockReturnValue({
        promise: async () => ({ data: {} }),
      });
      (builder.get as any) = mockGet;

      const params = Promise.resolve({ slug: 'test' });
      await BuilderPreviewPage({ params });

      expect(mockGet).toHaveBeenCalledWith('page', {
        userAttributes: { urlPath: '/test' },
        options: { includeUnpublished: true },
      });
    });
  });
});
```

---

#### 3.3.3 E2E Tests (Playwright)

**File:** `tests/e2e/builder-landing-page.spec.ts`

```typescript
import { expect, test } from '@playwright/test';

test.describe('Builder Landing Page Generation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Builder API responses
    await page.route('https://builder.io/api/v1/write/page', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ id: 'test-builder-id' }),
      });
    });

    await page.route('**/api/builder/page', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ slug: 'meditation-retreat' }),
      });
    });
  });

  test('should generate landing page from chat and display in artifact', async ({ page }) => {
    // Step 1: Navigate to LobeChat
    await page.goto('/');

    // Step 2: Type prompt in chat
    await page
      .getByRole('textbox', { name: /message/i })
      .fill('Create a landing page for a meditation retreat');
    await page.getByRole('button', { name: /send/i }).click();

    // Step 3: Wait for AI response with artifact
    await expect(page.locator('lobeArtifact')).toBeVisible({ timeout: 10000 });

    // Step 4: Verify artifact attributes
    const artifact = page.locator('lobeArtifact');
    await expect(artifact).toHaveAttribute('type', 'application/lobe.artifacts.builder');
    await expect(artifact).toHaveAttribute('identifier', 'meditation-retreat');

    // Step 5: Click artifact to open preview
    await page.getByRole('button', { name: /meditation retreat/i }).click();

    // Step 6: Verify iframe loads in portal
    const iframe = page.frameLocator('iframe[title="Builder Page Preview"]');
    await expect(iframe.locator('body')).toBeVisible();
  });

  test('should update landing page when user requests changes', async ({ page }) => {
    await page.goto('/');

    // Create initial page
    await page
      .getByRole('textbox', { name: /message/i })
      .fill('Create a landing page for a meditation retreat');
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.locator('lobeArtifact')).toBeVisible();

    // Request update
    await page.getByRole('textbox', { name: /message/i }).fill('Make the hero title shorter');
    await page.getByRole('button', { name: /send/i }).click();

    // Verify updated artifact appears
    const artifacts = page.locator('lobeArtifact');
    await expect(artifacts).toHaveCount(2);
  });

  test('should display error artifact when Builder API fails', async ({ page }) => {
    // Mock failed Builder API
    await page.route('**/api/builder/page', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to create page' }),
      });
    });

    await page.goto('/');

    await page
      .getByRole('textbox', { name: /message/i })
      .fill('Create a landing page for a meditation retreat');
    await page.getByRole('button', { name: /send/i }).click();

    // Verify error message appears
    await expect(page.getByText(/failed to create page in builder/i)).toBeVisible();
  });

  test('should handle invalid PageSpec gracefully', async ({ page }) => {
    // This test verifies schema validation
    await page.goto('/');

    // Mock LLM to return invalid PageSpec (would be done via agent mocking)
    await page
      .getByRole('textbox', { name: /message/i })
      .fill('Create a landing page with invalid structure');
    await page.getByRole('button', { name: /send/i }).click();

    // Verify error artifact appears
    await expect(page.getByText(/failed to generate valid page specification/i)).toBeVisible();
  });
});

test.describe('Builder Preview Route', () => {
  test('should display Builder content for valid slug', async ({ page }) => {
    await page.goto('/builder-preview/meditation-retreat');

    // Verify page renders without LobeChat chrome
    await expect(page.locator('body')).not.toHaveAttribute('class', /lobe-chat/);

    // Verify Builder content is rendered
    await expect(page.locator('[data-builder-content]')).toBeVisible();
  });

  test('should display 404 for non-existent slug', async ({ page }) => {
    await page.goto('/builder-preview/non-existent-page');

    await expect(page.getByText('Page Not Found')).toBeVisible();
    await expect(page.getByText('No Builder content found for: /non-existent-page')).toBeVisible();
  });
});
```

---

### 3.4 Test Execution Commands

```bash
# Run all unit tests for Builder feature
bunx vitest run --silent='passed-only' 'pageSpecToBuilderContent.test.ts'
bunx vitest run --silent='passed-only' 'Builder.test.tsx'

# Run integration tests
bunx vitest run --silent='passed-only' 'route.test.ts'
bunx vitest run --silent='passed-only' 'page.test.tsx'

# Run E2E tests
npx playwright test builder-landing-page.spec.ts

# Run all Builder-related tests
bunx vitest run --silent='passed-only' 'builder'
npx playwright test builder
```

---

### 3.5 Test Coverage Requirements

- **Unit Tests**: 100% coverage for `pageSpecToBuilderContent()` and `BuilderRenderer`
- **Integration Tests**: All API routes and preview routes covered
- **E2E Tests**: All user stories (US-1, US-2, US-3) covered
- **Error Paths**: All error scenarios tested (invalid input, API failures, etc.)

---

## 4. Non-Goals (for MVP)

- Email sequence generation
- Customer.io campaign setup
- Multi-page funnels
- Multi-tenant domain routing
- Builder custom component registration
- Authentication beyond existing LobeChat auth
- Billing, user roles, permissions

---

## 5. User Stories

### US-1: Generate Page

> As a user chatting in the interface,
> I can request: "Create a landing page for a meditation retreat,"
> and the AI generates a landing page visible inside LobeChat.

**Test Coverage:** E2E test `builder-landing-page.spec.ts` → "should generate landing page from chat"

---

### US-2: View Preview

> As a user,
> I can see the generated landing page **inside LobeChat** using the Artifact Preview Panel.

**Test Coverage:**

- E2E test → "should display in artifact"
- Integration test → `page.test.tsx` → "should render Builder content"

---

### US-3: Update Page

> As a user,
> I can ask the AI: "Make the hero title shorter," and the page updates.

**Test Coverage:** E2E test → "should update landing page when user requests changes"

---

### US-4: No Manual Testing

> As the product owner,
> I want a reliable automated testing suite for:
>
> - PageSpec mapping ✅ Unit tests
> - Builder write endpoint ✅ Integration tests
> - Preview route ✅ Integration tests
> - Artifact -> iframe rendering ✅ Unit + E2E tests
> - Full E2E chat flow ✅ E2E tests

**Test Coverage:** All tests in Section 3

---

## 6. Functional Requirements

**IMPORTANT:** All functional requirements below should be implemented AFTER corresponding tests are written and failing (RED phase).

### FR-1: LobeChat Artifact System Integration

#### Test-First Approach:

1. ✅ Write `Builder.test.tsx` (already defined in Section 3.3.1)
2. ❌ Run tests → expect FAIL
3. ✅ Implement `Builder.tsx` component
4. ✅ Run tests → expect PASS

#### 6.1.1 LobeChat Artifact Architecture (Reference)

LobeChat's existing artifact system works as follows:

1. **Tag Format**: Artifacts are embedded in AI responses using `<lobeArtifact>` XML tags
2. **Type System**: Uses MIME-like types (e.g., `application/lobe.artifacts.react`, `text/html`)
3. **Portal Display**: Artifacts render in a side panel with Preview/Code toggle
4. **State Management**: Zustand store at `src/store/chat/slices/portal/`

**Key Files**:

- Type definitions: `packages/types/src/artifact.ts`
- Constants/regex: `packages/const/src/plugin.ts`
- Renderer routing: `src/features/Portal/Artifacts/Body/Renderer/index.tsx`
- Portal state: `src/store/chat/slices/portal/`

#### 6.1.2 New Artifact Type: Builder Page

**Add to `packages/types/src/artifact.ts`**:

```typescript
export enum ArtifactType {
  Code = 'application/lobe.artifacts.code',
  Default = 'html',
  Python = 'python',
  React = 'application/lobe.artifacts.react',
  Builder = 'application/lobe.artifacts.builder', // NEW
}
```

#### 6.1.3 Artifact Tag Format (AI Output)

The LLM must output artifacts in this format:

```xml
<lobeArtifact identifier="meditation-retreat" type="application/lobe.artifacts.builder" title="Meditation Retreat Landing Page">
{"slug": "meditation-retreat", "builderUrl": "/builder-preview/meditation-retreat"}
</lobeArtifact>
```

**Attributes**:

| Attribute    | Required | Description                                  |
| ------------ | -------- | -------------------------------------------- |
| `identifier` | Yes      | Unique ID for the artifact (use slug)        |
| `type`       | Yes      | Must be `application/lobe.artifacts.builder` |
| `title`      | Yes      | Human-readable title for the artifact card   |

**Content (JSON)**:

```json
{
  "builderUrl": "/builder-preview/meditation-retreat",
  "slug": "meditation-retreat"
}
```

---

### FR-2: Builder Artifact Renderer

**TDD Workflow:**

1. ✅ Write tests in `Builder.test.tsx` (Section 3.3.1)
2. ❌ Run tests → FAIL (component doesn't exist)
3. ✅ Create `src/features/Portal/Artifacts/Body/Renderer/Builder.tsx` (implementation below)
4. ✅ Run tests → PASS

**Create**: `src/features/Portal/Artifacts/Body/Renderer/Builder.tsx`

```typescript
import { memo, useMemo } from 'react';

interface BuilderRendererProps {
  content: string; // JSON string with slug and builderUrl
}

const BuilderRenderer = memo<BuilderRendererProps>(({ content }) => {
  const { builderUrl } = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return { builderUrl: '' };
    }
  }, [content]);

  if (!builderUrl) {
    return <div>Invalid Builder artifact</div>;
  }

  return (
    <iframe
      src={builderUrl}
      style={{
        border: 'none',
        height: '100%',
        width: '100%',
      }}
      title="Builder Page Preview"
    />
  );
});

export default BuilderRenderer;
```

**Update**: `src/features/Portal/Artifacts/Body/Renderer/index.tsx`

```typescript
import BuilderRenderer from './Builder';

const Renderer = memo<{ content: string; type?: string }>(({ content, type }) => {
  switch (type) {
    case 'application/lobe.artifacts.builder': {
      return <BuilderRenderer content={content} />;
    }
    case 'application/lobe.artifacts.react': {
      return <ReactRenderer code={content} />;
    }
    // ... existing cases
  }
});
```

---

### FR-3: PageSpec Generation (LangGraph)

#### PageSpec JSON Structure (MVP)

```json
{
  "sections": [
    {
      "type": "hero",
      "title": "Find Inner Peace",
      "subtitle": "Join our 2025 retreat",
      "ctaLabel": "Apply Now"
    },
    {
      "type": "text",
      "heading": "About the Retreat",
      "body": "A transformative 5-day journey..."
    }
  ],
  "slug": "meditation-retreat",
  "title": "Meditation Retreat Landing Page"
}
```

#### Requirements

- LangGraph agent must produce a valid PageSpec each time.
- If invalid, system retries or returns structured error.

**Test Coverage:** E2E test validates PageSpec validation behavior

---

### FR-4: Builder Page Creation API

**TDD Workflow:**

1. ✅ Write tests in `route.test.ts` (Section 3.3.2)
2. ❌ Run tests → FAIL (route doesn't exist)
3. ✅ Create `src/app/(backend)/api/builder/page/route.ts`
4. ✅ Run tests → PASS

#### Endpoint

`POST /api/builder/page`

**Create**: `src/app/(backend)/api/builder/page/route.ts`

#### Input

`PageSpec` (from above schema)

#### Output

```json
{ "slug": "meditation-retreat" }
```

#### Implementation

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { pageSpecToBuilderContent } from '@/server/services/builder/pageSpecToBuilderContent';

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_API_KEY;
const BUILDER_PUBLIC_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

export async function POST(request: NextRequest) {
  const pageSpec = await request.json();

  // 1. Validate PageSpec schema (TODO: Add Zod validation)
  if (!pageSpec.slug || !pageSpec.title || !pageSpec.sections) {
    return NextResponse.json({ error: 'Invalid PageSpec' }, { status: 400 });
  }

  // 2. Convert PageSpec to Builder blocks
  const builderContent = pageSpecToBuilderContent(pageSpec);

  // 3. Write to Builder via Content API
  const response = await fetch(`https://builder.io/api/v1/write/page`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BUILDER_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: pageSpec.title,
      data: {
        url: `/${pageSpec.slug}`,
        blocks: builderContent,
      },
      published: 'draft',
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }

  return NextResponse.json({ slug: pageSpec.slug });
}
```

#### PageSpec to Builder Blocks Mapping

**TDD Workflow:**

1. ✅ Write tests in `pageSpecToBuilderContent.test.ts` (Section 3.3.1)
2. ❌ Run tests → FAIL (function doesn't exist)
3. ✅ Create implementation below
4. ✅ Run tests → PASS

**Create**: `src/server/services/builder/pageSpecToBuilderContent.ts`

```typescript
interface PageSpecSection {
  type: 'hero' | 'text' | 'cta' | 'features';
  [key: string]: unknown;
}

interface PageSpec {
  slug: string;
  title: string;
  sections: PageSpecSection[];
}

interface BuilderBlock {
  '@type': string;
  'component': {
    name: string;
    options: Record<string, unknown>;
  };
}

export function pageSpecToBuilderContent(pageSpec: PageSpec): BuilderBlock[] {
  return pageSpec.sections.map((section) => {
    switch (section.type) {
      case 'hero':
        return {
          '@type': '@builder.io/sdk:Element',
          'component': {
            name: 'Hero',
            options: {
              title: section.title,
              subtitle: section.subtitle,
              ctaLabel: section.ctaLabel,
            },
          },
        };
      case 'text':
        return {
          '@type': '@builder.io/sdk:Element',
          'component': {
            name: 'Text',
            options: {
              text: `<h2>${section.heading}</h2><p>${section.body}</p>`,
            },
          },
        };
      default:
        throw new Error(`Unknown section type: ${section.type}`);
    }
  });
}
```

---

### FR-5: Builder Preview Route

**TDD Workflow:**

1. ✅ Write tests in `page.test.tsx` (Section 3.3.2)
2. ❌ Run tests → FAIL (page doesn't exist)
3. ✅ Create implementation below
4. ✅ Run tests → PASS

#### Route

`GET /builder-preview/[slug]`

**Create**: `src/app/builder-preview/[slug]/page.tsx`

```typescript
import { builder } from '@builder.io/sdk';
import { RenderBuilderContent } from '@builder.io/sdk-react-nextjs';

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BuilderPreviewPage({ params }: PageProps) {
  const { slug } = await params;

  const content = await builder
    .get('page', {
      userAttributes: {
        urlPath: `/${slug}`,
      },
      options: {
        includeUnpublished: true, // Show draft pages
      },
    })
    .promise();

  if (!content) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Page Not Found</h1>
        <p>No Builder content found for: /{slug}</p>
      </div>
    );
  }

  return (
    <RenderBuilderContent
      content={content}
      model="page"
      apiKey={process.env.NEXT_PUBLIC_BUILDER_API_KEY!}
    />
  );
}
```

#### Layout (No Shell)

**Create**: `src/app/builder-preview/layout.tsx`

```typescript
export default function BuilderPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout - no LobeChat chrome
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
```

---

### FR-6: LangGraph Agent Integration

#### Node: designLandingPageNode

The LangGraph agent node that orchestrates page generation:

```typescript
async function designLandingPageNode(state: ConversationState) {
  // 1. Extract user requirements from conversation
  const requirements = extractRequirements(state.messages);

  // 2. Generate PageSpec via LLM
  const pageSpec = await generatePageSpec(requirements);

  // 3. Validate PageSpec
  if (!isValidPageSpec(pageSpec)) {
    return {
      artifact: {
        type: 'error',
        message: 'Failed to generate valid page specification',
      },
    };
  }

  // 4. Create page in Builder
  const response = await fetch('/api/builder/page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageSpec),
  });

  if (!response.ok) {
    return {
      artifact: {
        type: 'error',
        message: 'Failed to create page in Builder',
      },
    };
  }

  const { slug } = await response.json();

  // 5. Return artifact for LobeChat to render
  // The AI response should include this artifact tag:
  return {
    content: `I've created your landing page! Here's the preview:

<lobeArtifact identifier="${slug}" type="application/lobe.artifacts.builder" title="${pageSpec.title}">
{"slug": "${slug}", "builderUrl": "/builder-preview/${slug}"}
</lobeArtifact>

The page has been saved to Builder.io and you can edit it further in the Builder editor.`,
  };
}
```

---

## 7. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LobeChat UI                              │
│  ┌──────────────────┐    ┌────────────────────────────────────┐ │
│  │   Chat Panel     │    │      Artifact Portal               │ │
│  │                  │    │  ┌──────────────────────────────┐  │ │
│  │  User: Create a  │    │  │  BuilderRenderer             │  │ │
│  │  landing page... │    │  │  ┌──────────────────────┐    │  │ │
│  │                  │    │  │  │ <iframe>             │    │  │ │
│  │  AI: I've created│───▶│  │  │ src=/builder-preview │    │  │ │
│  │  your page!      │    │  │  │      /[slug]         │    │  │ │
│  │  <lobeArtifact>  │    │  │  └──────────────────────┘    │  │ │
│  │  ...             │    │  └──────────────────────────────┘  │ │
│  └──────────────────┘    └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LangGraph Agent                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  designLandingPageNode                                   │   │
│  │  1. Parse user requirements                              │   │
│  │  2. LLM generates PageSpec                               │   │
│  │  3. POST /api/builder/page                               │   │
│  │  4. Return <lobeArtifact> tag in response                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js API Routes                             │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │ POST /api/builder/  │    │ GET /builder-preview/[slug]    │ │
│  │      page           │    │                                 │ │
│  │                     │    │ • builder.get('page', {...})    │ │
│  │ • Validate PageSpec │    │ • includeUnpublished: true      │ │
│  │ • Convert to blocks │    │ • RenderBuilderContent          │ │
│  │ • Write to Builder  │    │                                 │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Builder.io                                   │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │ Content Write API   │    │ Content Delivery API            │ │
│  │ (Private Key)       │    │ (Public Key)                    │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Checklist (TDD Order)

### Phase T0: Write All Tests FIRST (Day 1)

- [ ] Create `pageSpecToBuilderContent.test.ts` with failing tests
- [ ] Create `Builder.test.tsx` with failing tests
- [ ] Create `route.test.ts` with failing tests
- [ ] Create `page.test.tsx` with failing tests
- [ ] Create `builder-landing-page.spec.ts` with failing E2E tests
- [ ] **Verify:** All tests FAIL (proving they test something)

### Phase 0: Builder Preview Route + Artifact Renderer (Days 2-3)

**RED Phase:**

- [ ] Run `Builder.test.tsx` → expect FAIL
- [ ] Run `page.test.tsx` → expect FAIL

**GREEN Phase:**

- [ ] Add `ArtifactType.Builder` to `packages/types/src/artifact.ts`
- [ ] Create `src/features/Portal/Artifacts/Body/Renderer/Builder.tsx`
- [ ] Update `src/features/Portal/Artifacts/Body/Renderer/index.tsx` with Builder case
- [ ] Create `src/app/builder-preview/[slug]/page.tsx`
- [ ] Create `src/app/builder-preview/layout.tsx` (minimal, no LobeChat shell)
- [ ] Run tests → expect PASS

**REFACTOR Phase:**

- [ ] Improve code quality (TypeScript types, error handling)
- [ ] Re-run tests → expect PASS

### Phase 1: Builder Write API + PageSpec Mapping (Days 4-5)

**RED Phase:**

- [ ] Run `pageSpecToBuilderContent.test.ts` → expect FAIL
- [ ] Run `route.test.ts` → expect FAIL

**GREEN Phase:**

- [ ] Create `src/server/services/builder/pageSpecToBuilderContent.ts`
- [ ] Create `src/app/(backend)/api/builder/page/route.ts`
- [ ] Add Zod schema validation for PageSpec
- [ ] Run tests → expect PASS

**REFACTOR Phase:**

- [ ] Extract magic strings to constants
- [ ] Improve error messages
- [ ] Re-run tests → expect PASS

### Phase 2: LangGraph Agent Integration (Days 6-7)

**RED Phase:**

- [ ] Run E2E tests → expect FAIL

**GREEN Phase:**

- [ ] Create `designLandingPageNode` in LangGraph
- [ ] Configure system prompt for PageSpec generation
- [ ] Wire up artifact tag output in AI response
- [ ] Run E2E tests → expect PASS

**REFACTOR Phase:**

- [ ] Optimize LLM prompt
- [ ] Add retry logic
- [ ] Re-run E2E tests → expect PASS

### Phase T1: Final Verification (Day 8)

- [ ] Run all unit tests → 100% PASS
- [ ] Run all integration tests → 100% PASS
- [ ] Run all E2E tests → 100% PASS
- [ ] Verify coverage meets requirements (Section 3.5)
- [ ] Manual smoke test (optional, final verification only)

---

## 9. Technical Constraints

- Must keep Builder write API keys private (server-side only via `BUILDER_PRIVATE_API_KEY`).
- Public key (`NEXT_PUBLIC_BUILDER_API_KEY`) is safe for client-side SDK calls.
- Must not break LobeChat conversations even if Builder write fails.
- Preview route must not require authentication.
- PageSpec must remain small & JSON-only (LLM-friendly).
- Iframe must not have `sandbox` attribute to allow Builder interactivity.

---

## 10. Open Questions (to refine later)

- How do we handle tenant-specific Builder Spaces?
- How do we handle versioning (draft vs published)?
- Should PageSpec allow more section types?
- Do we store PageSpecs in our DB? (Might want to for audit trails)
- Should we add a "Open in Builder Editor" button to the artifact?

---

## 11. Risks & Mitigations

| Risk                                               | Mitigation                                                           |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| LLM generates invalid PageSpec                     | Schema validation + retry + **test coverage**                        |
| Builder write API failure                          | Return user-friendly error artifact + **integration tests**          |
| LobeChat's artifact renderer breaks during reskins | Write isolated **unit tests** for renderer                           |
| Unexpected Builder downtime                        | Retry logic + Langfuse logging + **E2E tests verify error handling** |
| Complex layouts outgrowing MVP schema              | Add additional section types iteratively + **update tests first**    |
| Iframe security concerns                           | No sandbox needed; Builder pages are first-party                     |
| Tests become flaky                                 | Use proper mocking, avoid timeouts, follow Vitest best practices     |

---

## 12. Success Criteria

The MVP is considered complete when:

- [ ] User can prompt a landing page in LobeChat.
- [ ] A Builder page is created programmatically.
- [ ] Artifact iframe shows the Builder page inside LobeChat.
- [ ] **All unit tests pass (100% pass rate).**
- [ ] **All integration tests pass (100% pass rate).**
- [ ] **All E2E tests pass (100% pass rate).**
- [ ] **Test coverage meets requirements (Section 3.5).**
- [ ] No manual verification needed to trust the system.

---

## 13. Timeline (TDD-adjusted)

| Stage     | Deliverable                                   | Duration     | TDD Phase        |
| --------- | --------------------------------------------- | ------------ | ---------------- |
| T0        | Write all tests (failing)                     | 1 day        | RED              |
| 0         | Builder preview route + artifact iframe       | 2 days       | GREEN + REFACTOR |
| 1         | Builder write API endpoint + PageSpec mapping | 2 days       | GREEN + REFACTOR |
| 2         | LangGraph agent -> artifact integration       | 2-3 days     | GREEN + REFACTOR |
| T1        | Final verification (all tests passing)        | 0.5 days     | Verification     |
| **Total** |                                               | **\~1 week** |                  |

---

## Appendix A: File Structure

```
src/
├── app/
│   ├── (backend)/
│   │   └── api/
│   │       └── builder/
│   │           └── page/
│   │               ├── route.ts          # POST /api/builder/page
│   │               └── route.test.ts     # Integration tests
│   └── builder-preview/
│       ├── [slug]/
│       │   ├── page.tsx                  # GET /builder-preview/[slug]
│       │   └── page.test.tsx             # Integration tests
│       └── layout.tsx                    # Minimal layout (no LobeChat shell)
├── features/
│   └── Portal/
│       └── Artifacts/
│           └── Body/
│               └── Renderer/
│                   ├── Builder.tsx       # NEW: Builder iframe renderer
│                   ├── Builder.test.tsx  # Unit tests
│                   └── index.tsx         # Add Builder case to switch
├── server/
│   └── services/
│       └── builder/
│           ├── pageSpecToBuilderContent.ts      # PageSpec -> Builder blocks
│           └── pageSpecToBuilderContent.test.ts # Unit tests
packages/
└── types/
    └── src/
        └── artifact.ts                   # Add ArtifactType.Builder

tests/
└── e2e/
    └── builder-landing-page.spec.ts      # E2E tests (Playwright)
```

---

## Appendix B: TDD Cheat Sheet

### RED Phase

- Write a test that fails
- Run test → confirm it FAILS
- DO NOT write implementation yet

### GREEN Phase

- Write minimal code to make test pass
- Run test → confirm it PASSES
- Code doesn't need to be perfect yet

### REFACTOR Phase

- Improve code quality
- Run test after each change → confirm still PASSES
- Extract constants, improve names, reduce complexity

### Key TDD Rules

1. Never write production code without a failing test
2. Never write more test than needed to fail
3. Never write more production code than needed to pass
4. All tests must pass before moving to next feature

---

## Changelog

- **v1.0.1** (2025-11-27): TDD restructure
  - Moved testing requirements to Section 3 (before functional requirements)
  - Added complete test scaffolds with concrete test cases
  - Added TDD workflow section with RED-GREEN-REFACTOR
  - Added test file paths following LobeChat conventions
  - Updated implementation checklist to follow TDD phases
  - Added test coverage requirements
  - Added TDD cheat sheet appendix
  - Linked each user story to corresponding tests

- **v1.0.0** (2025-11-27): Initial PRD creation for AI-Powered Funnel Builder MVP
  - Added detailed LobeChat artifact system integration specs
  - Added BuilderRenderer component specification
  - Added Builder preview route implementation details
  - Added file structure appendix
  - Added implementation checklist
