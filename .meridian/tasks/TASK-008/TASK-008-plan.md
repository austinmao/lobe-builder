# TASK-008 Implementation Plan

## Objective

Create API route for Builder.io content preview

## Pre-conditions

- TASK-004 completed (integration tests exist and fail)
- Builder.io API keys configured in environment

## Implementation Steps

### Step 1: Verify tests fail (RED phase confirmed)

```bash
bunx vitest run --silent='passed-only' 'builder/preview'
```

Expected: Tests FAIL

### Step 2: Create directory structure

```bash
mkdir -p src/app/(backend)/api/builder/preview
```

### Step 3: Create route.ts

Create `src/app/(backend)/api/builder/preview/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const builderUrl = searchParams.get('builderUrl');

  if (!builderUrl) {
    return NextResponse.json({ error: 'Missing builderUrl parameter' }, { status: 400 });
  }

  try {
    // Validate URL format
    new URL(builderUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid builderUrl format' }, { status: 400 });
  }

  try {
    const response = await fetch(builderUrl);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Builder content' }, { status: 500 });
    }

    const html = await response.text();

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Builder.io API error' }, { status: 500 });
  }
}
```

### Step 4: Run tests - verify PASS

```bash
bunx vitest run --silent='passed-only' 'builder/preview'
```

Expected: All tests PASS

### Step 5: TypeScript check

```bash
bun run type-check
```

Expected: No errors

## Verification

- [ ] Tests failed before implementation (RED confirmed)
- [ ] API route created
- [ ] All tests pass (GREEN confirmed)
- [ ] TypeScript compilation passes
