# TASK-007 Implementation Plan

## Objective

Register BuilderRenderer in the Renderer component's routing logic

## Pre-conditions

- TASK-005 completed (ArtifactType.Builder exists)
- TASK-006 completed (BuilderRenderer component exists)

## Implementation Steps

### Step 1: Read current Renderer/index.tsx

- File: `src/features/Portal/Artifacts/Body/Renderer/index.tsx`
- Understand existing switch statement pattern
- Note import style (lazy/dynamic or direct)

### Step 2: Add BuilderRenderer import

```typescript
import BuilderRenderer from './Builder';
// OR if lazy:
const BuilderRenderer = dynamic(() => import('./Builder'));
```

### Step 3: Add Builder case to switch statement

```typescript
case ArtifactType.Builder:
  return <BuilderRenderer content={content} />;
```

### Step 4: Verify TypeScript compiles

```bash
bun run type-check
```

Expected: No errors

### Step 5: Run existing renderer tests

```bash
bunx vitest run --silent='passed-only' 'Renderer'
```

Expected: All tests pass

## Verification

- [ ] BuilderRenderer imported
- [ ] Switch case added for ArtifactType.Builder
- [ ] TypeScript compilation passes
- [ ] Existing tests pass
