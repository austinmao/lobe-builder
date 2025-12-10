# TASK-004 Implementation Plan

## Problem Analysis

### DISCOVER-INTERACT-011

Test uses step `I should be navigated to "/discover/mcp"` at lines 442-450:

```typescript
Then('I should be navigated to {string}', async function (this: CustomWorld, expectedPath: string) {
  const currentUrl = this.page.url();
  expect(currentUrl.includes(expectedPath)).toBeTruthy();
});
```

The actual URL may differ (e.g., `/discover/mcp/` with trailing slash, or query params).

### DISCOVER-INTERACT-012

Test clicks featured assistant card but may fail due to:

- Multiple "more" links on page
- Card overlay elements blocking interaction
- Wrong element being clicked

## Investigation Steps

1. **Check actual MCP URL**:
   - Navigate to MCP list manually and capture exact URL
   - Check if it includes trailing slash or query params

2. **Check "more" link selectors** at lines 223-240:
   - `I click on the "more" link in the featured MCP tools section`
   - Currently clicks `.nth(1)` assuming MCP is second "more" link

3. **Check featured assistant interaction** at lines 242-259:
   - `I click on the first featured assistant card`
   - Uses `[data-testid="assistant-item"]` which should work

## Implementation Steps

1. Update navigation assertion to be more flexible:

```typescript
Then('I should be navigated to {string}', async function (this: CustomWorld, expectedPath: string) {
  await this.page.waitForLoadState('networkidle', { timeout: 120_000 });
  const currentUrl = this.page.url();
  const pathname = new URL(currentUrl).pathname;
  expect(
    pathname.startsWith(expectedPath) || pathname.includes(expectedPath),
    `Expected URL path to contain "${expectedPath}", but got: ${pathname}`,
  ).toBeTruthy();
});
```

2. For featured assistant click, add force click option if needed:

```typescript
await firstCard.click({ force: true });
```

## Verification

```bash
pnpm --filter @lobechat/e2e-tests test -- --tags '@interactions'
```
