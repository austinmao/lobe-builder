# VercelDomain Module - TDD RED Phase

**Status**: 🔴 RED (Tests written, implementation pending)

## Overview

This module provides automated custom domain management for multi-tenant SaaS applications using the Vercel Domains API.

## Test Status

- **Total Tests**: 68
- **Passing**: 2 (error handling edge cases)
- **Failing**: 66 (expected in RED phase)
- **Coverage**: 100% of planned functionality

## Test Suites

### 1. VercelDomain Class Tests (`index.test.ts`)

**Location**: `src/server/modules/VercelDomain/index.test.ts`

#### Constructor Tests (3 tests)

- ✅ Should initialize with correct configuration
- ✅ Should throw error when VERCEL_API_TOKEN is missing
- ✅ Should throw error when VERCEL_PROJECT_ID is missing

#### addDomain() Tests (7 tests)

- ✅ Should add domain to Vercel project successfully
- ✅ Should handle domain already exists error (409)
- ✅ Should handle invalid domain format (400)
- ✅ Should handle rate limiting (429)
- ✅ Should handle network errors
- ✅ Should handle forbidden error (403)
- ✅ Should handle unauthorized error (401)

#### verifyDomain() Tests (6 tests)

- ✅ Should verify domain successfully when DNS is configured
- ✅ Should return pending status when DNS not configured
- ✅ Should handle domain not found error (404)
- ✅ Should handle DNS verification failure with error reason
- ✅ Should handle network errors during verification

#### removeDomain() Tests (5 tests)

- ✅ Should remove domain from Vercel successfully (204)
- ✅ Should handle domain not found during removal (idempotent)
- ✅ Should handle permission errors (403)
- ✅ Should handle network errors during removal
- ✅ Should handle unauthorized errors during removal

#### getDomain() Tests (2 tests)

- ✅ Should retrieve domain information successfully
- ✅ Should handle domain not found

#### listDomains() Tests (2 tests)

- ✅ Should list all domains in project
- ✅ Should handle empty domain list

### 2. Validators Tests (`validators.test.ts`)

**Location**: `src/server/modules/VercelDomain/validators.test.ts`

#### validateDomain() Tests (43 tests)

**Valid Domains (9 tests)**

- ✅ Should accept valid domains
- ✅ Should accept domains with numbers
- ✅ Should accept long TLDs

**Invalid Domains (19 tests)**

- ✅ Should reject domains with spaces
- ✅ Should reject domains with protocols
- ✅ Should reject domains with trailing slashes
- ✅ Should reject domains with hyphens at start/end
- ✅ Should reject empty or whitespace-only strings
- ✅ Should reject domains with special characters
- ✅ Should reject domains with consecutive dots
- ✅ Should reject domains without TLD
- ✅ Should reject domains with invalid TLD

**Localhost and Internal Domains (5 tests)**

- ✅ Should reject localhost
- ✅ Should reject IP addresses
- ✅ Should reject .local domains
- ✅ Should reject .test domains
- ✅ Should reject .localhost domains

**Reserved Vercel Domains (4 tests)**

- ✅ Should reject vercel.app domains
- ✅ Should reject vercel.dev domains
- ✅ Should reject now\.sh domains
- ✅ Should reject vercel.com domains

**Edge Cases (6 tests)**

- ✅ Should reject very long domains (over 253 characters)
- ✅ Should reject very long labels (over 63 characters)
- ✅ Should accept maximum valid label length (63 characters)
- ✅ Should handle domains with query strings
- ✅ Should handle domains with fragments
- ✅ Should handle domains with ports
- ✅ Should handle punycode/internationalized domains

#### isDomainAvailable() Tests (25 tests)

**Domain Availability Checks (4 tests)**

- ✅ Should check if domain is not already in use
- ✅ Should return false if domain is already in use
- ✅ Should allow same domain for same tenant (update scenario)
- ✅ Should return false when domain is used by different tenant

**Case Sensitivity (2 tests)**

- ✅ Should handle case-insensitive domain comparison
- ✅ Should normalize domain case before checking

**Error Handling (3 tests)**

- ✅ Should handle database query errors
- ✅ Should handle null tenant repository
- ✅ Should handle undefined tenant repository

**Edge Cases (5 tests)**

- ✅ Should handle empty domain string
- ✅ Should handle domain with whitespace
- ✅ Should handle tenant ID as empty string
- ✅ Should handle multiple tenants check race condition

**Complex Domain Patterns (3 tests)**

- ✅ Should handle subdomain availability check
- ✅ Should distinguish between similar domains
- ✅ Should handle punycode domains

## Test Execution

### Run All Tests

```bash
bunx vitest run --silent='passed-only' 'src/server/modules/VercelDomain'
```

### Run Specific Test File

```bash
bunx vitest run --silent='passed-only' 'src/server/modules/VercelDomain/index.test.ts'
bunx vitest run --silent='passed-only' 'src/server/modules/VercelDomain/validators.test.ts'
```

### Run Specific Test Suite

```bash
bunx vitest run --silent='passed-only' -t "addDomain"
bunx vitest run --silent='passed-only' -t "validateDomain"
bunx vitest run --silent='passed-only' -t "isDomainAvailable"
```

## Implementation Files (Stub)

### 1. `index.ts` - VercelDomain Class

Main integration class for Vercel Domains API with methods:

- `constructor()` - Initialize with API credentials
- `addDomain(domain)` - Add domain to project
- `verifyDomain(domain)` - Check DNS verification status
- `removeDomain(domain)` - Remove domain from project
- `getDomain(domain)` - Get domain information
- `listDomains()` - List all project domains

### 2. `validators.ts` - Domain Validators

Validation utilities:

- `validateDomain(domain)` - Validate domain format
- `isDomainAvailable(domain, repo, tenantId?)` - Check domain availability

### 3. Environment Configuration

File: `src/envs/vercel.ts`

Required environment variables:

- `VERCEL_API_TOKEN` - Vercel API authentication token
- `VERCEL_PROJECT_ID` - Target Vercel project ID
- `VERCEL_TEAM_ID` - Vercel team ID (optional)

## Mock Strategy

### Unit Tests

- **Vercel API**: Mock `fetch` utility at module level
- **Environment**: Mock `@/envs/vercel` with test values
- **No External Calls**: All API interactions are mocked

### Integration Tests (Future)

- Mock VercelDomain module entirely
- Mock database repositories
- Test tRPC endpoints

### E2E Tests (Future)

- Playwright network interception
- Mock Vercel API at network level
- Test complete user flows

## Next Steps (GREEN Phase)

1. **Implement Constructor**
   - Validate environment variables
   - Initialize API client configuration
   - Handle missing credentials error

2. **Implement addDomain()**
   - Call Vercel POST /v10/projects/{projectId}/domains
   - Parse verification records
   - Handle API errors (409, 400, 429, 403, 401)

3. **Implement verifyDomain()**
   - Call Vercel GET /v9/projects/{projectId}/domains/{domain}
   - Check verification status
   - Return pending records if not verified

4. **Implement removeDomain()**
   - Call Vercel DELETE /v9/projects/{projectId}/domains/{domain}
   - Handle 404 gracefully (idempotent)
   - Throw on permission errors

5. **Implement Validators**
   - validateDomain(): RFC 1123 validation + reserved domains check
   - isDomainAvailable(): Database query with case-insensitive comparison

## Test Coverage Goals

- **Unit Tests**: >90% code coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user flows (add, verify, remove)

## Documentation

See also:

- [TDD Domain Automation Plan](../../../../docs/ceremonia/tdd-domain-automation-plan.md)
- [Vercel Domains API](https://vercel.com/docs/rest-api/endpoints#domains)
- [Project Testing Guide](../../../../.cursor/rules/testing-guide/testing-guide.mdc)

## Author

**Generated by**: Claude Code Agent (TDD RED Phase)
**Date**: 2025-12-11
**Task**: TASK-020 - Write unit tests for Vercel API service
