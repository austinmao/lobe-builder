# TASK-001 Implementation Plan

## Objective

Write failing unit tests for pageSpecToBuilderContent function (TDD RED phase)

## Implementation Steps

### Step 1: Create test file structure

- Create directory: `src/server/services/builder/`
- Create file: `pageSpecToBuilderContent.test.ts`

### Step 2: Write test imports and setup

```typescript
import type { PageSpec } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { pageSpecToBuilderContent } from './pageSpecToBuilderContent';
```

### Step 3: Write hero section test

- Test that hero section converts to Builder block with correct '@type', component name, and options

### Step 4: Write text section test

- Test that text section converts to HTML content with h2 and p tags

### Step 5: Write error handling test

- Test that unknown section type throws specific error message

### Step 6: Write multiple sections test

- Test that multiple sections convert in correct order

### Step 7: Verify tests fail

- Run: `bunx vitest run --silent='passed-only' 'pageSpecToBuilderContent.test.ts'`
- Expected: Tests should FAIL (implementation doesn't exist)

## Verification

- [ ] Test file created
- [ ] All 4 test cases written
- [ ] Tests fail when run (RED phase confirmed)
