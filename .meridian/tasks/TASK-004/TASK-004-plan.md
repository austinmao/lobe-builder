# TASK-004 Implementation Plan

## Objective

Write failing integration tests for Builder preview route (TDD RED phase)

## Implementation Steps

### Step 1: Create test file and directory

- Ensure directory exists: `src/app/builder-preview/[slug]/`
- Create file: `page.test.tsx`

### Step 2: Write test setup with SDK mocks

```typescript
/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BuilderPreviewPage from './page';

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
```

### Step 3: Write success test

- Mock builder.get to return page content
- Verify RenderBuilderContent is rendered

### Step 4: Write 404 test

- Mock builder.get to return null
- Verify "Page Not Found" message displayed

### Step 5: Write SDK configuration test

- Verify builder.get called with includeUnpublished: true

### Step 6: Verify tests fail

- Run: `bunx vitest run --silent='passed-only' 'page.test.tsx'`
- Expected: Tests should FAIL (page doesn't exist)

## Verification

- [ ] Test file created with SDK mocks
- [ ] All 3 test cases written
- [ ] Tests fail when run (RED phase confirmed)
