# TASK-003 Implementation Plan

## Problem Analysis

The test expects URL to contain `page=` or `p=` after clicking pagination. Looking at `src/app/[variants]/(main)/discover/(list)/features/Pagination.tsx:44`, the component does use `page=` parameter:

```typescript
searchParams.set('page', String(newPage));
navigate(`/discover/${tab}?${searchParams.toString()}`);
```

## Root Cause Investigation

The issue may be:

1. Test clicks "next" but pagination component may not have "Next" text - uses antd Pagination
2. The selector may not be finding the correct pagination button
3. There may be a race condition between click and URL update

## Implementation Steps

1. **Verify pagination button selector** at lines 79-81:

   ```typescript
   const nextButton = this.page.locator(
     'button:has-text("Next"), button[aria-label*="next" i], .pagination button:last-child',
   );
   ```

   The antd Pagination component uses different structure - update to:

   ```typescript
   const nextButton = this.page.locator(
     '[data-testid="pagination"] .ant-pagination-next, .ant-pagination-next',
   );
   ```

2. **Update URL assertion** at lines 316-322 to wait for URL to actually change:
   ```typescript
   // Wait for URL to update after pagination
   await this.page.waitForFunction(() => window.location.search.includes('page='), {
     timeout: 10000,
   });
   const currentUrl = this.page.url();
   expect(currentUrl.includes('page=')).toBeTruthy();
   ```

## Verification

```bash
pnpm --filter @lobechat/e2e-tests test -- --name 'Navigate to next page'
```
