# Tenant Domain Settings E2E Tests

## Overview

Comprehensive E2E test suite for the tenant domain settings feature, covering the complete user flow for managing custom domains in the LobeChat application.

## Test File Location

`/Users/austinmao/Documents/GitHub/lobe-builder/tests/e2e/ceremonia/tenant-domain-settings.spec.ts`

## Test Coverage

### 1. Navigation & Authentication (2 tests)

- **1.1**: Navigate to tenant settings page
  - Login flow
  - Page rendering verification
  - Authentication requirement

- **1.2**: Redirect unauthenticated users
  - Protected route behavior
  - Login redirect

### 2. Domain Status Display (4 tests)

- **2.1**: No domain configured state
  - Empty state message
  - "Add Custom Domain" button visibility

- **2.2**: Pending verification status
  - Domain name display
  - Status badge with `data-status="pending_verification"`
  - DNS verification instructions
  - "Verify Domain" button

- **2.3**: Verified status
  - Domain name display
  - Status badge with `data-status="verified"`
  - "Remove Domain" button
  - DNS instructions hidden

- **2.4**: Domain with null status (Edge Case)
  - **Bug Fix Verification**: Tests that `live.ceremoniacircle.org` is displayed, not `ceremoniacircle.org`
  - Status badge with `data-status="needs_verification"`
  - "Verify Domain" button available

### 3. Add Domain Flow (2 tests)

- **3.1**: Add domain successfully
  - Modal opens on button click
  - Form submission
  - Success feedback
  - Status transition to pending_verification

- **3.2**: Domain format validation
  - Protocol rejection (http\://, https\://)
  - Trailing slash rejection
  - Spaces rejection
  - localhost rejection
  - IP address rejection
  - Invalid format rejection
  - Error message display

### 4. Verify Domain Flow (2 tests)

- **4.1**: Verify domain successfully
  - Button triggers verification
  - Loading state
  - Success message
  - Status transition to verified
  - DNS instructions hidden

- **4.2**: Verification error - VERCEL_API_TOKEN missing
  - **Bug Fix Verification**: Tests error handling when Vercel API token is missing
  - Error display
  - Status remains pending
  - DNS instructions remain visible

### 5. Remove Domain Flow (1 test)

- **5.1**: Remove domain with confirmation
  - Confirmation modal
  - Cancel button (no changes)
  - Confirm button (removes domain)
  - Success message
  - State resets to "no domain"

### 6. Accessibility (1 test)

- **6.1**: Keyboard accessibility
  - Tab navigation
  - Enter key activation
  - Escape key closes modals
  - Focus management

## Total Tests: 12

## Issues Verified

### Issue 1: Domain Display Bug

**Test**: 2.4 - Domain with null status (Edge Case)

- **Problem**: Domain shows `ceremoniacircle.org` but should be `live.ceremoniacircle.org`
- **Verification**: Test ensures CORRECT_DOMAIN (`live.ceremoniacircle.org`) is displayed, not INCORRECT_DOMAIN (`ceremoniacircle.org`)
- **Status Indicator**: `data-status="needs_verification"`

### Issue 2: VERCEL_API_TOKEN Error

**Test**: 4.2 - Verification error handling

- **Problem**: "Verify Domain" fails with "VERCEL_API_TOKEN is required"
- **Verification**: Test mocks this error and verifies graceful error handling
- **Expected Behavior**:
  - Error doesn't crash UI
  - Status remains "pending_verification"
  - DNS instructions remain visible
  - User can retry

## Mock Strategy

### Vercel API Mocks (Network Level)

- `POST /domains` - Add domain response with verification records
- `GET /domains/:domain` - Get domain status (verified)
- `DELETE /domains/:domain` - Remove domain response

### tRPC Endpoint Mocks

- `domain.getTenant` - Returns tenant data with various domain states
- `domain.add` - Add domain mutation response
- `domain.verify` - Verify domain mutation response (success/error)
- `domain.remove` - Remove domain mutation response

### State Management

- Tests simulate state transitions (no domain → pending → verified → removed)
- Mocks update based on user actions to test realistic flows
- Page reloads verify persistent state changes

## Test Data

### Test Domain

`test-domain.example.com`

### Incorrect Domain (Bug)

`ceremoniacircle.org`

### Correct Domain (Expected)

`live.ceremoniacircle.org`

### Test User

- Email: `admin@ceremoniacircle.org`
- Password: `ceremonia_secure_password_123`
- Role: `user`
- Tenant: `ceremonia`

## Running the Tests

```bash
# Run all tenant domain settings tests
npx playwright test tests/e2e/ceremonia/tenant-domain-settings.spec.ts

# Run specific test by name
npx playwright test tests/e2e/ceremonia/tenant-domain-settings.spec.ts -g "should navigate to tenant settings page"

# Run with headed browser (visual debugging)
npx playwright test tests/e2e/ceremonia/tenant-domain-settings.spec.ts --headed

# Run with debug mode
npx playwright test tests/e2e/ceremonia/tenant-domain-settings.spec.ts --debug

# List all tests without running
npx playwright test tests/e2e/ceremonia/tenant-domain-settings.spec.ts --list
```

## Test Structure

Each test follows this pattern:

1. **Setup**: Mock API responses and initial state
2. **Login**: Authenticate as Ceremonia admin
3. **Navigate**: Go to `/settings/tenant`
4. **Action**: Perform user action (add domain, verify, remove, etc.)
5. **Verify**: Assert expected UI state and behavior
6. **Cleanup**: (implicit via Playwright test isolation)

## Accessibility Testing

Test 6.1 verifies:

- Tab navigation through interactive elements
- Enter key activates buttons
- Escape key closes modals
- Focus management on modal open/close

## Data Attributes for Testing

The following `data-status` attributes are used for reliable test selectors:

- `data-status="pending_verification"` - Domain awaiting DNS verification
- `data-status="verified"` - Domain successfully verified
- `data-status="needs_verification"` - Domain exists but status is null (legacy data)

## Notes

### Why Mock Vercel API?

- Avoid rate limits and external dependencies
- Consistent test behavior in CI/CD
- Faster test execution
- No accidental production changes

### Why Mock tRPC Endpoints?

- Avoid database dependencies
- Test UI behavior independently of backend
- Simulate error conditions easily
- Faster test execution

### Test Independence

- Each test uses fresh browser context
- Mocks are set up per test in `beforeEach`
- No shared state between tests
- Tests can run in any order

## Future Enhancements

Potential additions to test coverage:

- [ ] Test domain conflict error (domain already in use)
- [ ] Test rate limiting behavior
- [ ] Test concurrent verification attempts
- [ ] Test domain removal while verification pending
- [ ] Test permission checks (non-admin user)
- [ ] Visual regression testing for status indicators
- [ ] Test with slow network conditions
- [ ] Test with Vercel API timeout errors

## Related Files

- Implementation: `/Users/austinmao/Documents/GitHub/lobe-builder/src/features/TenantSettings/DomainSettings.tsx`
- Settings Page: `/Users/austinmao/Documents/GitHub/lobe-builder/src/app/[variants]/(main)/settings/tenant/index.tsx`
- tRPC Router: `/Users/austinmao/Documents/GitHub/lobe-builder/src/server/routers/lambda/domain.ts`
- Test Fixtures: `/Users/austinmao/Documents/GitHub/lobe-builder/tests/e2e/ceremonia/fixtures/user.ts`
- Playwright Config: `/Users/austinmao/Documents/GitHub/lobe-builder/playwright.config.ts`

## Documentation

For general testing guidelines, see:

- `/Users/austinmao/Documents/GitHub/lobe-builder/.cursor/rules/testing-guide/testing-guide.mdc`
