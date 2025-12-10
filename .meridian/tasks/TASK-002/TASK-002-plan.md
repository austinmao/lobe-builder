# TASK-002 Implementation Plan

## Problem Analysis

E2E tests expect `[data-testid="detail-content"]` selector but detail page components don't have this attribute. Tests check for `main` or `article` as fallbacks, but these may not be specific enough.

## Files to Modify

1. **Assistant Details**: `src/app/[variants]/(main)/discover/(detail)/assistant/features/Details/index.tsx`
   - Add `data-testid="detail-content"` to outer Flexbox at line 26

2. **Model Details**: `src/app/[variants]/(main)/discover/(detail)/model/features/Details/index.tsx`
   - Locate main wrapper and add data-testid

3. **Provider Details**: `src/app/[variants]/(main)/discover/(detail)/provider/features/Details/index.tsx`
   - Locate main wrapper and add data-testid

4. **MCP Details**: `src/app/[variants]/(main)/discover/(detail)/mcp/features/Details/index.tsx`
   - Locate main wrapper and add data-testid

## Implementation Steps

For each file:

1. Open the Details/index.tsx file
2. Find the outermost Flexbox or container component
3. Add `data-testid="detail-content"` prop
4. Save file

## Example Change (Assistant)

```tsx
// Before
<Flexbox gap={24}>

// After
<Flexbox data-testid="detail-content" gap={24}>
```

## Verification

```bash
pnpm --filter @lobechat/e2e-tests test -- --tags '@detail-pages'
```
