# TDD Plan: Domain Automation for Multi-Tenant SaaS

**Created**: 2025-12-11
**Status**: Planning Phase
**Test-Driven Development**: RED → GREEN → REFACTOR

---

## Table of Contents

1. [Overview](#overview)
2. [Test Execution Order](#test-execution-order)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [E2E Tests](#e2e-tests)
6. [Mock Strategies](#mock-strategies)
7. [CI/CD Considerations](#cicd-considerations)
8. [Success Criteria](#success-criteria)

---

## Overview

### Goal

Implement automated custom domain provisioning for multi-tenant landing pages using Test-Driven Development. All tests will be written BEFORE implementation (RED phase), then implementation follows to make tests pass (GREEN phase), followed by refactoring.

### Current State

- `apps/payload/src/collections/Tenants.ts` - Has `domain` field but no status tracking
- `src/proxy.ts` - Uses hardcoded `TENANT_DOMAINS` map (needs to be database-driven)
- Middleware already handles URL rewriting

### What We're Building

1. **Vercel API Integration Module** (`src/server/modules/VercelDomain`)
2. **Enhanced Tenant Schema** (domain status fields)
3. **Dynamic Middleware** (loads domains from database)
4. **Domain Management API** (tRPC endpoints)
5. **Self-Service Flow** (tenant admin interface)

---

## Test Execution Order

### Phase 1: Unit Tests (Foundation)

Write these tests FIRST, watch them FAIL, then implement:

1. Vercel API Service unit tests
2. Domain validation utilities
3. DNS verification logic

### Phase 2: Integration Tests (API Layer)

After unit tests pass:

4. tRPC domain management endpoints
5. Database operations (add/update/delete domains)
6. Webhook handling (Vercel domain events)

### Phase 3: E2E Tests (User Flows)

After integration tests pass:

7. Domain provisioning flow
8. DNS verification flow
9. Domain removal flow

---

## Unit Tests

### File: `src/server/modules/VercelDomain/index.test.ts`

**Environment**: `@vitest-environment node`

**Setup Strategy**:

```typescript
// Mock Vercel API HTTP client
vi.mock('@/utils/fetch', () => ({
  fetch: vi.fn(),
}));

// Mock environment variables
vi.mock('@/envs/vercel', () => ({
  vercelEnv: {
    VERCEL_API_TOKEN: 'test-token-123',
    VERCEL_PROJECT_ID: 'test-project-456',
    VERCEL_TEAM_ID: 'test-team-789',
  },
}));
```

#### Test Cases

##### 1.1: VercelDomain Constructor

**Test**: `should initialize with correct configuration`

```typescript
describe('VercelDomain', () => {
  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      const vercelDomain = new VercelDomain();

      expect(vercelDomain).toBeDefined();
      // Verify internal state (if accessible)
    });

    it('should throw error when VERCEL_API_TOKEN is missing', () => {
      vi.doMock('@/envs/vercel', () => ({
        vercelEnv: {
          VERCEL_API_TOKEN: '',
          VERCEL_PROJECT_ID: 'test-project',
          VERCEL_TEAM_ID: 'test-team',
        },
      }));

      expect(() => new VercelDomain()).toThrow('VERCEL_API_TOKEN is required');
    });
  });
});
```

**Assertions**:

- Service initializes without errors
- Missing API token throws descriptive error
- Configuration is stored correctly

---

##### 1.2: Add Domain to Vercel

**Test**: `addDomain() - successful addition`

```typescript
describe('addDomain', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.mocked(fetch).mockImplementation(mockFetch);
  });

  it('should add domain to Vercel project successfully', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'ceremonia.example.com',
        verified: false,
        verification: [
          {
            type: 'TXT',
            domain: '_vercel',
            value: 'vc-domain-verify=ceremonia-example-com-abc123',
            reason: 'PENDING',
          },
        ],
      }),
    });

    const result = await vercelDomain.addDomain('ceremonia.example.com');

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.vercel.com/v10/projects/test-project-456/domains',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token-123',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          name: 'ceremonia.example.com',
        }),
      }),
    );

    // Verify response
    expect(result).toEqual({
      success: true,
      domain: 'ceremonia.example.com',
      verified: false,
      verificationRecords: [
        {
          type: 'TXT',
          name: '_vercel',
          value: 'vc-domain-verify=ceremonia-example-com-abc123',
        },
      ],
    });
  });

  it('should handle domain already exists error', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: {
          code: 'domain_already_exists',
          message: 'Domain already exists in this project',
        },
      }),
    });

    await expect(vercelDomain.addDomain('existing.example.com')).rejects.toThrow(
      'Domain already exists',
    );
  });

  it('should handle invalid domain format', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          code: 'invalid_domain',
          message: 'Invalid domain format',
        },
      }),
    });

    await expect(vercelDomain.addDomain('invalid domain')).rejects.toThrow('Invalid domain format');
  });

  it('should handle rate limiting (429)', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({
        'Retry-After': '60',
      }),
      json: async () => ({
        error: {
          code: 'rate_limit_exceeded',
          message: 'Rate limit exceeded',
        },
      }),
    });

    await expect(vercelDomain.addDomain('test.example.com')).rejects.toThrow('Rate limit exceeded');
  });

  it('should handle network errors', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(vercelDomain.addDomain('test.example.com')).rejects.toThrow('Network error');
  });
});
```

**Assertions**:

- Correct API endpoint called with proper authentication
- Success response parsed correctly
- DNS verification records extracted
- Error cases handled gracefully (409, 400, 429, network errors)

---

##### 1.3: Verify Domain

**Test**: `verifyDomain() - check verification status`

```typescript
describe('verifyDomain', () => {
  it('should verify domain successfully when DNS is configured', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'ceremonia.example.com',
        verified: true,
        verification: [],
      }),
    });

    const result = await vercelDomain.verifyDomain('ceremonia.example.com');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.vercel.com/v9/projects/test-project-456/domains/ceremonia.example.com',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      }),
    );

    expect(result).toEqual({
      verified: true,
      domain: 'ceremonia.example.com',
    });
  });

  it('should return pending status when DNS not configured', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'ceremonia.example.com',
        verified: false,
        verification: [
          {
            type: 'TXT',
            domain: '_vercel',
            value: 'vc-domain-verify=abc123',
            reason: 'PENDING',
          },
        ],
      }),
    });

    const result = await vercelDomain.verifyDomain('ceremonia.example.com');

    expect(result).toEqual({
      verified: false,
      domain: 'ceremonia.example.com',
      pendingRecords: [
        {
          type: 'TXT',
          name: '_vercel',
          value: 'vc-domain-verify=abc123',
        },
      ],
    });
  });

  it('should handle domain not found error', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        error: {
          code: 'domain_not_found',
          message: 'Domain not found',
        },
      }),
    });

    await expect(vercelDomain.verifyDomain('nonexistent.example.com')).rejects.toThrow(
      'Domain not found',
    );
  });
});
```

**Assertions**:

- Verification status retrieved correctly
- Pending DNS records returned when not verified
- 404 errors handled appropriately

---

##### 1.4: Remove Domain

**Test**: `removeDomain() - delete from Vercel`

```typescript
describe('removeDomain', () => {
  it('should remove domain from Vercel successfully', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
    });

    await vercelDomain.removeDomain('old-domain.example.com');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.vercel.com/v9/projects/test-project-456/domains/old-domain.example.com',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      }),
    );
  });

  it('should handle domain not found during removal', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        error: {
          code: 'domain_not_found',
          message: 'Domain not found',
        },
      }),
    });

    // Should not throw - idempotent operation
    await expect(vercelDomain.removeDomain('nonexistent.example.com')).resolves.not.toThrow();
  });

  it('should handle permission errors', async () => {
    const vercelDomain = new VercelDomain();

    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        error: {
          code: 'forbidden',
          message: 'Insufficient permissions',
        },
      }),
    });

    await expect(vercelDomain.removeDomain('protected.example.com')).rejects.toThrow(
      'Insufficient permissions',
    );
  });
});
```

**Assertions**:

- Domain removed successfully (204 status)
- 404 errors handled gracefully (idempotent)
- Permission errors throw appropriately

---

### File: `src/server/modules/VercelDomain/validators.test.ts`

#### Test Cases

##### 1.5: Domain Validation

**Test**: `validateDomain() - validate domain format`

```typescript
import { describe, expect, it } from 'vitest';

import { isDomainAvailable, validateDomain } from './validators';

describe('validateDomain', () => {
  it('should accept valid domains', () => {
    expect(validateDomain('example.com')).toBe(true);
    expect(validateDomain('subdomain.example.com')).toBe(true);
    expect(validateDomain('multi.level.subdomain.example.com')).toBe(true);
    expect(validateDomain('ceremoniacircle.org')).toBe(true);
  });

  it('should reject invalid domains', () => {
    expect(validateDomain('invalid domain')).toBe(false);
    expect(validateDomain('http://example.com')).toBe(false);
    expect(validateDomain('example.com/')).toBe(false);
    expect(validateDomain('-example.com')).toBe(false);
    expect(validateDomain('example-.com')).toBe(false);
    expect(validateDomain('')).toBe(false);
  });

  it('should reject localhost and internal domains', () => {
    expect(validateDomain('localhost')).toBe(false);
    expect(validateDomain('127.0.0.1')).toBe(false);
    expect(validateDomain('internal.local')).toBe(false);
  });

  it('should reject reserved domains', () => {
    expect(validateDomain('vercel.app')).toBe(false);
    expect(validateDomain('vercel.dev')).toBe(false);
  });
});

describe('isDomainAvailable', () => {
  it('should check if domain is not already in use by another tenant', async () => {
    // Mock database query
    const mockTenantRepository = {
      findByDomain: vi.fn().mockResolvedValue(null),
    };

    const available = await isDomainAvailable('newdomain.example.com', mockTenantRepository);

    expect(available).toBe(true);
    expect(mockTenantRepository.findByDomain).toHaveBeenCalledWith('newdomain.example.com');
  });

  it('should return false if domain is already in use', async () => {
    const mockTenantRepository = {
      findByDomain: vi.fn().mockResolvedValue({
        id: 'other-tenant-123',
        slug: 'other-tenant',
        domain: 'existing.example.com',
      }),
    };

    const available = await isDomainAvailable('existing.example.com', mockTenantRepository);

    expect(available).toBe(false);
  });

  it('should allow same domain for same tenant (update scenario)', async () => {
    const mockTenantRepository = {
      findByDomain: vi.fn().mockResolvedValue({
        id: 'ceremonia-123',
        slug: 'ceremonia',
        domain: 'ceremonia.example.com',
      }),
    };

    const available = await isDomainAvailable(
      'ceremonia.example.com',
      mockTenantRepository,
      'ceremonia-123', // same tenant ID
    );

    expect(available).toBe(true);
  });
});
```

**Assertions**:

- Valid domain formats accepted
- Invalid formats rejected
- Reserved/localhost domains rejected
- Database uniqueness checked
- Same tenant can update their own domain

---

## Integration Tests

### File: `src/server/routers/lambda/domain.test.ts`

**Environment**: `@vitest-environment node`

**Setup Strategy**:

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appRouter } from '@/server/routers';
import { createCallerFactory } from '@/server/routers/utils';

// Mock VercelDomain module
vi.mock('@/server/modules/VercelDomain', () => ({
  VercelDomain: vi.fn().mockImplementation(() => ({
    addDomain: vi.fn(),
    verifyDomain: vi.fn(),
    removeDomain: vi.fn(),
  })),
}));

// Mock database
vi.mock('@/database', () => ({
  serverDB: mockServerDB,
}));
```

#### Test Cases

##### 2.1: Add Domain Endpoint

**Test**: `domain.add - successful domain addition`

```typescript
describe('domain.add', () => {
  let caller: ReturnType<typeof createCallerFactory>;
  let mockVercelDomain: any;
  let mockTenantRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockVercelDomain = {
      addDomain: vi.fn(),
      verifyDomain: vi.fn(),
      removeDomain: vi.fn(),
    };

    mockTenantRepository = {
      findById: vi.fn(),
      update: vi.fn(),
      findByDomain: vi.fn(),
    };

    vi.mocked(VercelDomain).mockImplementation(() => mockVercelDomain);

    const createCaller = createCallerFactory(appRouter);
    caller = createCaller({
      user: {
        id: 'user-123',
        roles: ['admin'],
        tenants: [{ tenant: 'ceremonia-123', roles: ['admin'] }],
      },
    });
  });

  it('should add domain and update tenant record', async () => {
    mockTenantRepository.findById.mockResolvedValue({
      id: 'ceremonia-123',
      slug: 'ceremonia',
      name: 'Ceremonia',
      domain: null,
      domainStatus: null,
    });

    mockTenantRepository.findByDomain.mockResolvedValue(null);

    mockVercelDomain.addDomain.mockResolvedValue({
      success: true,
      domain: 'ceremonia.example.com',
      verified: false,
      verificationRecords: [
        {
          type: 'TXT',
          name: '_vercel',
          value: 'vc-domain-verify=abc123',
        },
      ],
    });

    mockTenantRepository.update.mockResolvedValue({
      id: 'ceremonia-123',
      slug: 'ceremonia',
      domain: 'ceremonia.example.com',
      domainStatus: 'pending_verification',
      domainVerificationRecords: [
        {
          type: 'TXT',
          name: '_vercel',
          value: 'vc-domain-verify=abc123',
        },
      ],
    });

    const result = await caller.domain.add({
      tenantId: 'ceremonia-123',
      domain: 'ceremonia.example.com',
    });

    // Verify Vercel API called
    expect(mockVercelDomain.addDomain).toHaveBeenCalledWith('ceremonia.example.com');

    // Verify database updated
    expect(mockTenantRepository.update).toHaveBeenCalledWith(
      'ceremonia-123',
      expect.objectContaining({
        domain: 'ceremonia.example.com',
        domainStatus: 'pending_verification',
        domainVerificationRecords: expect.arrayContaining([
          expect.objectContaining({
            type: 'TXT',
            name: '_vercel',
          }),
        ]),
      }),
    );

    // Verify response
    expect(result).toEqual({
      success: true,
      tenant: expect.objectContaining({
        id: 'ceremonia-123',
        domain: 'ceremonia.example.com',
        domainStatus: 'pending_verification',
      }),
      verificationRecords: expect.arrayContaining([
        expect.objectContaining({
          type: 'TXT',
          name: '_vercel',
        }),
      ]),
    });
  });

  it('should reject invalid domain format', async () => {
    await expect(
      caller.domain.add({
        tenantId: 'ceremonia-123',
        domain: 'invalid domain with spaces',
      }),
    ).rejects.toThrow('Invalid domain format');

    // Vercel API should not be called
    expect(mockVercelDomain.addDomain).not.toHaveBeenCalled();
  });

  it('should reject domain already in use by another tenant', async () => {
    mockTenantRepository.findByDomain.mockResolvedValue({
      id: 'other-tenant-456',
      slug: 'other-tenant',
      domain: 'taken.example.com',
    });

    await expect(
      caller.domain.add({
        tenantId: 'ceremonia-123',
        domain: 'taken.example.com',
      }),
    ).rejects.toThrow('Domain already in use');

    expect(mockVercelDomain.addDomain).not.toHaveBeenCalled();
  });

  it('should require admin role for tenant', async () => {
    const nonAdminCaller = createCaller({
      user: {
        id: 'user-456',
        roles: [],
        tenants: [{ tenant: 'ceremonia-123', roles: ['viewer'] }],
      },
    });

    await expect(
      nonAdminCaller.domain.add({
        tenantId: 'ceremonia-123',
        domain: 'ceremonia.example.com',
      }),
    ).rejects.toThrow('Insufficient permissions');
  });

  it('should handle Vercel API errors gracefully', async () => {
    mockTenantRepository.findById.mockResolvedValue({
      id: 'ceremonia-123',
      slug: 'ceremonia',
    });

    mockTenantRepository.findByDomain.mockResolvedValue(null);

    mockVercelDomain.addDomain.mockRejectedValue(new Error('Vercel API rate limit exceeded'));

    await expect(
      caller.domain.add({
        tenantId: 'ceremonia-123',
        domain: 'ceremonia.example.com',
      }),
    ).rejects.toThrow('Vercel API rate limit exceeded');

    // Database should not be updated
    expect(mockTenantRepository.update).not.toHaveBeenCalled();
  });
});
```

**Assertions**:

- Domain validated before Vercel API call
- Vercel API integration works
- Database updated with verification records
- Permissions enforced
- Error handling works correctly
- No partial updates on failure

---

##### 2.2: Verify Domain Endpoint

**Test**: `domain.verify - check verification status`

```typescript
describe('domain.verify', () => {
  it('should verify domain and update tenant status', async () => {
    mockTenantRepository.findById.mockResolvedValue({
      id: 'ceremonia-123',
      slug: 'ceremonia',
      domain: 'ceremonia.example.com',
      domainStatus: 'pending_verification',
    });

    mockVercelDomain.verifyDomain.mockResolvedValue({
      verified: true,
      domain: 'ceremonia.example.com',
    });

    mockTenantRepository.update.mockResolvedValue({
      id: 'ceremonia-123',
      domain: 'ceremonia.example.com',
      domainStatus: 'verified',
      domainVerificationRecords: null,
    });

    const result = await caller.domain.verify({
      tenantId: 'ceremonia-123',
    });

    expect(mockVercelDomain.verifyDomain).toHaveBeenCalledWith('ceremonia.example.com');

    expect(mockTenantRepository.update).toHaveBeenCalledWith(
      'ceremonia-123',
      expect.objectContaining({
        domainStatus: 'verified',
        domainVerificationRecords: null,
      }),
    );

    expect(result).toEqual({
      verified: true,
      domain: 'ceremonia.example.com',
    });
  });

  it('should return pending status if DNS not configured', async () => {
    mockTenantRepository.findById.mockResolvedValue({
      id: 'ceremonia-123',
      domain: 'ceremonia.example.com',
      domainStatus: 'pending_verification',
    });

    mockVercelDomain.verifyDomain.mockResolvedValue({
      verified: false,
      domain: 'ceremonia.example.com',
      pendingRecords: [
        {
          type: 'TXT',
          name: '_vercel',
          value: 'vc-domain-verify=abc123',
        },
      ],
    });

    const result = await caller.domain.verify({
      tenantId: 'ceremonia-123',
    });

    expect(result).toEqual({
      verified: false,
      domain: 'ceremonia.example.com',
      pendingRecords: expect.arrayContaining([
        expect.objectContaining({
          type: 'TXT',
        }),
      ]),
    });

    // Status should remain pending
    expect(mockTenantRepository.update).not.toHaveBeenCalled();
  });

  it('should handle tenant without domain', async () => {
    mockTenantRepository.findById.mockResolvedValue({
      id: 'ceremonia-123',
      domain: null,
      domainStatus: null,
    });

    await expect(
      caller.domain.verify({
        tenantId: 'ceremonia-123',
      }),
    ).rejects.toThrow('No domain configured for this tenant');
  });
});
```

**Assertions**:

- Verification status checked via Vercel API
- Database updated when verified
- Pending status handled correctly
- Error when no domain configured

---

##### 2.3: Remove Domain Endpoint

**Test**: `domain.remove - delete domain`

```typescript
describe('domain.remove', () => {
  it('should remove domain from Vercel and database', async () => {
    mockTenantRepository.findById.mockResolvedValue({
      id: 'ceremonia-123',
      domain: 'old-domain.example.com',
      domainStatus: 'verified',
    });

    mockVercelDomain.removeDomain.mockResolvedValue(undefined);

    mockTenantRepository.update.mockResolvedValue({
      id: 'ceremonia-123',
      domain: null,
      domainStatus: null,
      domainVerificationRecords: null,
    });

    const result = await caller.domain.remove({
      tenantId: 'ceremonia-123',
    });

    expect(mockVercelDomain.removeDomain).toHaveBeenCalledWith('old-domain.example.com');

    expect(mockTenantRepository.update).toHaveBeenCalledWith('ceremonia-123', {
      domain: null,
      domainStatus: null,
      domainVerificationRecords: null,
    });

    expect(result).toEqual({
      success: true,
      tenantId: 'ceremonia-123',
    });
  });

  it('should handle already removed domain gracefully', async () => {
    mockTenantRepository.findById.mockResolvedValue({
      id: 'ceremonia-123',
      domain: null,
      domainStatus: null,
    });

    const result = await caller.domain.remove({
      tenantId: 'ceremonia-123',
    });

    expect(mockVercelDomain.removeDomain).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      tenantId: 'ceremonia-123',
    });
  });

  it('should require admin permissions', async () => {
    const viewerCaller = createCaller({
      user: {
        id: 'user-789',
        roles: [],
        tenants: [{ tenant: 'ceremonia-123', roles: ['viewer'] }],
      },
    });

    await expect(
      viewerCaller.domain.remove({
        tenantId: 'ceremonia-123',
      }),
    ).rejects.toThrow('Insufficient permissions');
  });
});
```

**Assertions**:

- Domain removed from Vercel
- Database cleared
- Idempotent operation (already removed)
- Permissions enforced

---

### File: `src/server/routers/lambda/domain-webhooks.test.ts`

#### Test Cases

##### 2.4: Webhook Handler

**Test**: `handleVercelWebhook - domain verification events`

```typescript
describe('handleVercelWebhook', () => {
  it('should update tenant status when domain verified via webhook', async () => {
    const webhookPayload = {
      type: 'domain.verified',
      payload: {
        domain: 'ceremonia.example.com',
        verified: true,
        projectId: 'test-project-456',
      },
    };

    mockTenantRepository.findByDomain.mockResolvedValue({
      id: 'ceremonia-123',
      domain: 'ceremonia.example.com',
      domainStatus: 'pending_verification',
    });

    mockTenantRepository.update.mockResolvedValue({
      id: 'ceremonia-123',
      domain: 'ceremonia.example.com',
      domainStatus: 'verified',
    });

    await handleVercelWebhook(webhookPayload);

    expect(mockTenantRepository.findByDomain).toHaveBeenCalledWith('ceremonia.example.com');
    expect(mockTenantRepository.update).toHaveBeenCalledWith(
      'ceremonia-123',
      expect.objectContaining({
        domainStatus: 'verified',
        domainVerificationRecords: null,
      }),
    );
  });

  it('should ignore webhook for unknown domain', async () => {
    const webhookPayload = {
      type: 'domain.verified',
      payload: {
        domain: 'unknown.example.com',
        verified: true,
      },
    };

    mockTenantRepository.findByDomain.mockResolvedValue(null);

    await handleVercelWebhook(webhookPayload);

    expect(mockTenantRepository.update).not.toHaveBeenCalled();
  });

  it('should verify webhook signature', async () => {
    const webhookPayload = {
      type: 'domain.verified',
      payload: { domain: 'test.example.com' },
    };

    const invalidSignature = 'invalid-signature-123';

    await expect(handleVercelWebhook(webhookPayload, invalidSignature)).rejects.toThrow(
      'Invalid webhook signature',
    );
  });
});
```

**Assertions**:

- Webhook events processed correctly
- Database updated on verification
- Unknown domains ignored
- Signature verification enforced

---

## E2E Tests

### File: `tests/e2e/ceremonia/domain-automation.spec.ts`

**Setup Strategy**:

```typescript
import { expect, test } from '@playwright/test';

// Mock Vercel API at network level using Playwright's route interception
test.beforeEach(async ({ page, context }) => {
  // Intercept Vercel API calls
  await context.route('https://api.vercel.com/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/domains') && route.request().method() === 'POST') {
      // Mock add domain response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'ceremonia-e2e.example.com',
          verified: false,
          verification: [
            {
              type: 'TXT',
              domain: '_vercel',
              value: 'vc-domain-verify=e2e-test-123',
              reason: 'PENDING',
            },
          ],
        }),
      });
    }

    // ... other route mocks
  });
});
```

#### Test Cases

##### 3.1: Domain Provisioning Flow (Happy Path)

**Test**: `should complete full domain provisioning flow`

```typescript
test.describe('Domain Provisioning Flow', () => {
  test('should provision custom domain from tenant settings', async ({ page, request }) => {
    // Step 1: Login as Ceremonia admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@ceremoniacircle.org');
    await page.getByLabel(/password/i).fill('ceremonia-password');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Step 2: Navigate to tenant settings
    await page.goto('/settings/tenant');
    await expect(page.getByRole('heading', { name: /tenant settings/i })).toBeVisible();

    // Step 3: Click "Add Custom Domain"
    await page.getByRole('button', { name: /add custom domain/i }).click();

    // Step 4: Enter domain
    await page.getByLabel(/domain name/i).fill('ceremonia-e2e.example.com');
    await page.getByRole('button', { name: /add domain/i }).click();

    // Step 5: Verify DNS instructions displayed
    await expect(page.getByText(/configure dns records/i)).toBeVisible();
    await expect(page.getByText(/TXT/i)).toBeVisible();
    await expect(page.getByText(/_vercel/i)).toBeVisible();
    await expect(page.getByText(/vc-domain-verify=e2e-test-123/i)).toBeVisible();

    // Step 6: Verify domain status
    await expect(page.getByText(/pending verification/i)).toBeVisible();

    // Step 7: Verify database updated
    const loginResponse = await request.post('/api/users/login', {
      data: {
        email: 'admin@ceremoniacircle.org',
        password: 'ceremonia-password',
      },
    });
    const { token } = await loginResponse.json();

    const tenantResponse = await request.get('/api/tenants?where[slug][equals]=ceremonia', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { docs } = await tenantResponse.json();
    const tenant = docs[0];

    expect(tenant.domain).toBe('ceremonia-e2e.example.com');
    expect(tenant.domainStatus).toBe('pending_verification');
    expect(tenant.domainVerificationRecords).toBeDefined();
    expect(tenant.domainVerificationRecords.length).toBeGreaterThan(0);
  });
});
```

**Assertions**:

- User can navigate to domain settings
- Domain input validates format
- DNS instructions displayed
- Database updated with pending status
- Verification records stored

---

##### 3.2: DNS Verification Flow

**Test**: `should verify domain after DNS configuration`

```typescript
test('should verify domain and update middleware', async ({ page, request }) => {
  // Prerequisites: Domain already added (pending verification)

  // Step 1: Login as admin
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@ceremoniacircle.org');
  await page.getByLabel(/password/i).fill('ceremonia-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Step 2: Navigate to tenant settings
  await page.goto('/settings/tenant');

  // Step 3: Click "Verify Domain"
  await page.getByRole('button', { name: /verify domain/i }).click();

  // Mock Vercel API to return verified status
  await page.context().route('https://api.vercel.com/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/domains/ceremonia-e2e.example.com') && route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'ceremonia-e2e.example.com',
          verified: true,
          verification: [],
        }),
      });
    }
  });

  // Step 4: Wait for verification success
  await expect(page.getByText(/domain verified/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/verified/i)).toBeVisible();

  // Step 5: Verify database updated
  const loginResponse = await request.post('/api/users/login', {
    data: {
      email: 'admin@ceremoniacircle.org',
      password: 'ceremonia-password',
    },
  });
  const { token } = await loginResponse.json();

  const tenantResponse = await request.get('/api/tenants?where[slug][equals]=ceremonia', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { docs } = await tenantResponse.json();
  const tenant = docs[0];

  expect(tenant.domainStatus).toBe('verified');
  expect(tenant.domainVerificationRecords).toBeNull();

  // Step 6: Verify custom domain works (middleware routing)
  const customDomainResponse = await page.goto('http://ceremonia-e2e.example.com/', {
    waitUntil: 'domcontentloaded',
  });

  expect(customDomainResponse?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /ceremonia/i })).toBeVisible();
});
```

**Assertions**:

- Verification can be triggered manually
- Verified status reflected in UI
- Database updated to "verified"
- Middleware routes custom domain correctly
- Homepage accessible via custom domain

---

##### 3.3: Domain Removal Flow

**Test**: `should remove domain and clean up resources`

```typescript
test('should remove custom domain', async ({ page, request }) => {
  // Prerequisites: Domain verified

  // Step 1: Login and navigate to settings
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@ceremoniacircle.org');
  await page.getByLabel(/password/i).fill('ceremonia-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.goto('/settings/tenant');

  // Step 2: Click "Remove Domain" (with confirmation)
  await page.getByRole('button', { name: /remove domain/i }).click();

  // Confirm removal
  await expect(page.getByText(/are you sure/i)).toBeVisible();
  await page.getByRole('button', { name: /confirm/i }).click();

  // Step 3: Verify success message
  await expect(page.getByText(/domain removed/i)).toBeVisible();

  // Step 4: Verify database cleared
  const loginResponse = await request.post('/api/users/login', {
    data: {
      email: 'admin@ceremoniacircle.org',
      password: 'ceremonia-password',
    },
  });
  const { token } = await loginResponse.json();

  const tenantResponse = await request.get('/api/tenants?where[slug][equals]=ceremonia', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { docs } = await tenantResponse.json();
  const tenant = docs[0];

  expect(tenant.domain).toBeNull();
  expect(tenant.domainStatus).toBeNull();
  expect(tenant.domainVerificationRecords).toBeNull();

  // Step 5: Verify custom domain no longer accessible
  const removedDomainResponse = await page.goto('http://ceremonia-e2e.example.com/', {
    waitUntil: 'domcontentloaded',
  });

  expect(removedDomainResponse?.status()).toBe(404);
});
```

**Assertions**:

- Domain removal requires confirmation
- Database cleared completely
- Custom domain returns 404
- Vercel domain removed (via mock verification)

---

##### 3.4: Error Handling - Invalid Domain

**Test**: `should handle invalid domain submission`

```typescript
test('should reject invalid domain formats', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@ceremoniacircle.org');
  await page.getByLabel(/password/i).fill('ceremonia-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.goto('/settings/tenant');
  await page.getByRole('button', { name: /add custom domain/i }).click();

  // Test invalid formats
  const invalidDomains = [
    'http://example.com',
    'example.com/',
    'invalid domain',
    'localhost',
    '127.0.0.1',
  ];

  for (const invalidDomain of invalidDomains) {
    await page.getByLabel(/domain name/i).fill(invalidDomain);
    await page.getByRole('button', { name: /add domain/i }).click();

    await expect(page.getByText(/invalid domain format/i)).toBeVisible();
  }
});
```

**Assertions**:

- Invalid domains rejected client-side
- Clear error messages displayed
- No API calls made for invalid formats

---

##### 3.5: Error Handling - Domain Already Taken

**Test**: `should handle domain already in use by another tenant`

```typescript
test('should reject domain already in use', async ({ page }) => {
  // Mock API to return conflict error
  await page.context().route('**/trpc/domain.add*', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          message: 'Domain already in use by another tenant',
          code: 'DOMAIN_CONFLICT',
        },
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@ceremoniacircle.org');
  await page.getByLabel(/password/i).fill('ceremonia-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.goto('/settings/tenant');
  await page.getByRole('button', { name: /add custom domain/i }).click();

  await page.getByLabel(/domain name/i).fill('taken.example.com');
  await page.getByRole('button', { name: /add domain/i }).click();

  await expect(page.getByText(/already in use/i)).toBeVisible();
});
```

**Assertions**:

- Conflict error displayed
- Database not modified
- User informed clearly

---

##### 3.6: Permission Checks

**Test**: `should enforce tenant admin permissions`

```typescript
test('should prevent non-admin from adding domain', async ({ page }) => {
  // Login as viewer (non-admin)
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('viewer@ceremoniacircle.org');
  await page.getByLabel(/password/i).fill('viewer-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.goto('/settings/tenant');

  // Verify "Add Domain" button is disabled or hidden
  const addDomainButton = page.getByRole('button', { name: /add custom domain/i });

  // Either not visible or disabled
  const isDisabled = await addDomainButton.isDisabled().catch(() => true);
  const isHidden = await addDomainButton.isHidden().catch(() => true);

  expect(isDisabled || isHidden).toBe(true);
});
```

**Assertions**:

- Non-admin users cannot add domains
- UI reflects permission restrictions
- API calls rejected with 403

---

## Mock Strategies

### 1. Vercel API Mocking (Unit & Integration Tests)

**Strategy**: Mock HTTP client at module level

```typescript
// In unit tests
vi.mock('@/utils/fetch', () => ({
  fetch: vi.fn(),
}));

// In integration tests
vi.mock('@/server/modules/VercelDomain', () => ({
  VercelDomain: vi.fn().mockImplementation(() => ({
    addDomain: vi.fn(),
    verifyDomain: vi.fn(),
    removeDomain: vi.fn(),
  })),
}));
```

**Rationale**:

- Avoids actual Vercel API calls
- Fast test execution
- No rate limiting issues
- Deterministic responses

---

### 2. Database Mocking (Unit & Integration Tests)

**Strategy**: Mock repository layer

```typescript
const mockTenantRepository = {
  findById: vi.fn(),
  findByDomain: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
};

vi.mock('@/database/repositories/tenant', () => ({
  tenantRepository: mockTenantRepository,
}));
```

**Rationale**:

- Isolates business logic from data layer
- Fast tests without database roundtrips
- Easy to test edge cases (not found, conflicts)

---

### 3. Playwright Network Interception (E2E Tests)

**Strategy**: Intercept network requests

```typescript
await page.context().route('https://api.vercel.com/**', async (route) => {
  const url = route.request().url();
  const method = route.request().method();

  if (url.includes('/domains') && method === 'POST') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        /* mock response */
      }),
    });
  }
});
```

**Rationale**:

- Tests complete user flows
- No external API dependencies
- Can simulate API errors (rate limits, timeouts)
- Works in CI without credentials

---

### 4. Environment Variable Mocking

**Strategy**: Mock environment config modules

```typescript
vi.mock('@/envs/vercel', () => ({
  vercelEnv: {
    VERCEL_API_TOKEN: 'test-token-123',
    VERCEL_PROJECT_ID: 'test-project-456',
    VERCEL_TEAM_ID: 'test-team-789',
  },
}));
```

**Rationale**:

- No need for real credentials in tests
- Consistent test environment
- Safe for CI/CD

---

## CI/CD Considerations

### 1. Environment Variables

**Required for CI**:

```bash
# .env.test
VERCEL_API_TOKEN=mock-token-for-ci
VERCEL_PROJECT_ID=mock-project-id
VERCEL_TEAM_ID=mock-team-id
BASE_URL=http://localhost:3010
```

**Note**: These are mock values - real Vercel API calls are mocked in tests

---

### 2. Test Execution in CI

**GitHub Actions Example**:

```yaml
name: Domain Automation Tests

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bunx vitest run --silent='passed-only' 'VercelDomain'

      - name: Run integration tests
        run: bunx vitest run --silent='passed-only' 'domain.test.ts'

      - name: Run E2E tests
        run: bunx playwright test domain-automation.spec.ts
```

---

### 3. Test Isolation

**Principles**:

- Each test suite runs independently
- Database mocked (no shared state)
- Network mocked (no external dependencies)
- Tests can run in parallel

---

## Success Criteria

### Unit Tests (Phase 1)

- [ ] All `VercelDomain` module tests pass (100%)
- [ ] All validator tests pass (100%)
- [ ] Coverage: >80% for Vercel integration module
- [ ] No actual Vercel API calls made
- [ ] Tests complete in <5 seconds

---

### Integration Tests (Phase 2)

- [ ] All tRPC endpoint tests pass (100%)
- [ ] Database operations tested (add, verify, remove)
- [ ] Webhook handling tested
- [ ] Permission checks enforced
- [ ] Error scenarios covered
- [ ] Tests complete in <10 seconds

---

### E2E Tests (Phase 3)

- [ ] Domain provisioning flow works end-to-end
- [ ] DNS verification flow tested
- [ ] Domain removal flow tested
- [ ] Error handling tested (invalid domains, conflicts)
- [ ] Permission checks enforced in UI
- [ ] Custom domain routing verified
- [ ] Tests complete in <30 seconds

---

### Overall Quality Gates

- [ ] **ALL tests pass** before implementation merge
- [ ] **No flaky tests** (100% pass rate on 3 consecutive runs)
- [ ] **CI passes** on all test suites
- [ ] **Code coverage** >75% for new code
- [ ] **Type safety** - no TypeScript errors
- [ ] **Linting** - no ESLint warnings
- [ ] **Documentation** - all public APIs documented

---

## Test Execution Commands

### Run Unit Tests

```bash
# All unit tests
bunx vitest run --silent='passed-only' 'src/server/modules/VercelDomain'

# Specific test file
bunx vitest run --silent='passed-only' 'src/server/modules/VercelDomain/index.test.ts'

# With coverage
bunx vitest run --silent='passed-only' --coverage 'VercelDomain'
```

### Run Integration Tests

```bash
# All integration tests
bunx vitest run --silent='passed-only' 'src/server/routers/lambda/domain'

# Specific endpoint
bunx vitest run --silent='passed-only' -t "domain.add"
```

### Run E2E Tests

```bash
# All E2E tests
bunx playwright test tests/e2e/ceremonia/domain-automation.spec.ts

# Specific test
bunx playwright test tests/e2e/ceremonia/domain-automation.spec.ts -g "should provision custom domain"

# With UI mode (debugging)
bunx playwright test --ui tests/e2e/ceremonia/domain-automation.spec.ts
```

---

## Next Steps

1. **Review this plan** with team
2. **Write unit tests FIRST** (RED phase)
3. **Run tests** - verify they fail
4. **Implement Vercel module** - make tests pass (GREEN phase)
5. **Write integration tests** - verify they fail
6. **Implement tRPC endpoints** - make tests pass
7. **Write E2E tests** - verify they fail
8. **Implement UI flows** - make tests pass
9. **Refactor** - improve code quality while keeping tests green
10. **Deploy** - all tests passing

---

## References

- [Vercel Domains API Documentation](https://vercel.com/docs/rest-api/endpoints#domains)
- [Vitest Testing Guide](https://vitest.dev/guide/)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [tRPC Testing Patterns](https://trpc.io/docs/server/testing)
- [Project Testing Guide](/.cursor/rules/testing-guide/testing-guide.mdc)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-11
**Author**: Claude Code Agent
**Review Status**: Pending Team Review
