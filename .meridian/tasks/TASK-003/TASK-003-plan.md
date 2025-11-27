# TASK-003 Implementation Plan

## Objective

Write failing integration tests for Builder page API route (TDD RED phase)

## Implementation Steps

### Step 1: Create test file and directory

- Ensure directory exists: `src/app/(backend)/api/builder/page/`
- Create file: `route.test.ts`

### Step 2: Write test setup

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

vi.stubEnv('BUILDER_PRIVATE_API_KEY', 'test-private-key');
vi.stubEnv('NEXT_PUBLIC_BUILDER_API_KEY', 'test-public-key');
```

### Step 3: Write successful page creation test

- Mock fetch to return success
- Verify response status 200 and slug returned
- Verify Builder API called with correct auth header

### Step 4: Write block structure test

- Verify correct Builder block structure in request body
- Check component name is 'Hero'

### Step 5: Write error handling tests

- Test 500 response when Builder API fails
- Test 400 response for invalid PageSpec

### Step 6: Verify tests fail

- Run: `bunx vitest run --silent='passed-only' 'route.test.ts'`
- Expected: Tests should FAIL (route doesn't exist)

## Verification

- [ ] Test file created
- [ ] All 4 test cases written
- [ ] Environment variables mocked properly
- [ ] Tests fail when run (RED phase confirmed)
