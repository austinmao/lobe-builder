# TASK-002 Implementation Plan

## Objective

Write failing unit tests for BuilderRenderer component (TDD RED phase)

## Implementation Steps

### Step 1: Create test file

- Create file: `src/features/Portal/Artifacts/Body/Renderer/Builder.test.tsx`

### Step 2: Write test setup with vitest-environment comment

```typescript
/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BuilderRenderer from './Builder';
```

### Step 3: Write valid content rendering tests

- Test iframe renders with correct src
- Test iframe has correct styles (border: none, 100% dimensions)

### Step 4: Write error handling tests

- Test invalid JSON displays error message
- Test missing builderUrl displays error message
- Test empty builderUrl displays error message

### Step 5: Verify tests fail

- Run: `bunx vitest run --silent='passed-only' 'Builder.test.tsx'`
- Expected: Tests should FAIL (component doesn't exist)

## Verification

- [ ] Test file created with @vitest-environment happy-dom
- [ ] All 5 test cases written
- [ ] Tests fail when run (RED phase confirmed)
