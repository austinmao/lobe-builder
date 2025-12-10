# TASK-001 Implementation Plan

## Problem Analysis

The E2E test uses selector `[data-testid="category-filter"]` in `e2e/src/steps/discover/interactions.steps.ts:52-54` but the actual CategoryMenu component at `src/app/[variants]/(main)/discover/components/CategoryMenu.tsx:37` uses `[data-testid="category-menu"]`.

## Implementation Steps

1. Open `e2e/src/steps/discover/interactions.steps.ts`
2. Locate lines 52-54 in the `I click on a category in the category filter` step
3. Change the selector from:
   ```typescript
   const categoryItems = this.page.locator(
     '[data-testid="category-filter"] button, [data-testid="category-menu"] button',
   );
   ```
   To:
   ```typescript
   const categoryItems = this.page.locator(
     '[data-testid="category-menu"] button, [role="menu"] button',
   );
   ```
4. Run tests to verify fix

## Verification

```bash
# Start dev server
bun run dev &

# Wait for server
sleep 30

# Run specific interaction tests
pnpm --filter @lobechat/e2e-tests test -- --tags '@interactions'

# Run smoke tests to verify no regressions
pnpm --filter @lobechat/e2e-tests test:smoke
```
