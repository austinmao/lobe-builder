# TASK-006 Implementation Plan

## Objective

Implement BuilderRenderer component (TDD GREEN phase)

## Pre-conditions

- TASK-002 completed (tests exist and fail)

## Implementation Steps

### Step 1: Verify tests fail (RED phase confirmed)

```bash
bunx vitest run --silent='passed-only' 'Builder.test.tsx'
```

Expected: Tests FAIL

### Step 2: Create BuilderRenderer component

Create `src/features/Portal/Artifacts/Body/Renderer/Builder.tsx`:

```typescript
import { memo, useMemo } from 'react';

interface BuilderRendererProps {
  content: string;
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

### Step 3: Run tests - verify PASS

```bash
bunx vitest run --silent='passed-only' 'Builder.test.tsx'
```

Expected: All tests PASS

## Verification

- [ ] Tests failed before implementation (RED confirmed)
- [ ] Component created
- [ ] All tests pass (GREEN confirmed)
