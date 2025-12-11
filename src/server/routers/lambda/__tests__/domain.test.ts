// @vitest-environment node
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VercelDomain } from '@/server/modules/VercelDomain';

import { domainRouter } from '../domain';

// Mock VercelDomain module
vi.mock('@/server/modules/VercelDomain', () => ({
  VercelDomain: vi.fn().mockImplementation(() => ({
    addDomain: vi.fn(),
    verifyDomain: vi.fn(),
    removeDomain: vi.fn(),
  })),
}));

// Mock database models/repositories
// Note: The actual implementation will need to use proper tenant repository
// For now, we'll mock the expected structure
const mockTenantRepository = {
  findById: vi.fn(),
  update: vi.fn(),
  findByDomain: vi.fn(),
};

vi.mock('@/database/repositories/tenant', () => ({
  TenantRepository: vi.fn().mockImplementation(() => mockTenantRepository),
}));

describe('domainRouter', () => {
  let mockVercelDomain: any;
  const mockUserId = 'user-123';
  const mockTenantId = 'ceremonia-123';

  beforeEach(() => {
    vi.clearAllMocks();

    mockVercelDomain = {
      addDomain: vi.fn(),
      verifyDomain: vi.fn(),
      removeDomain: vi.fn(),
    };

    vi.mocked(VercelDomain).mockImplementation(() => mockVercelDomain);
  });

  const createMockContext = (options?: {
    userId?: string;
    roles?: string[];
    tenants?: Array<{ tenant: string; roles: string[] }>;
  }) => ({
    userId: options?.userId || mockUserId,
    // Note: Actual implementation may need additional context fields
    // like roles, tenants, etc. for authorization
    roles: options?.roles || ['admin'],
    tenants: options?.tenants || [{ tenant: mockTenantId, roles: ['admin'] }],
  });

  describe('add', () => {
    it('should add domain and update tenant record', async () => {
      const mockTenant = {
        id: mockTenantId,
        slug: 'ceremonia',
        name: 'Ceremonia',
        domain: null,
        domainStatus: null,
      };

      mockTenantRepository.findById.mockResolvedValue(mockTenant);
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

      const updatedTenant = {
        id: mockTenantId,
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
      };

      mockTenantRepository.update.mockResolvedValue(updatedTenant);

      const caller = domainRouter.createCaller(createMockContext());
      const result = await caller.add({
        tenantId: mockTenantId,
        domain: 'ceremonia.example.com',
      });

      // Verify Vercel API called
      expect(mockVercelDomain.addDomain).toHaveBeenCalledWith('ceremonia.example.com');

      // Verify database updated
      expect(mockTenantRepository.update).toHaveBeenCalledWith(
        mockTenantId,
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
          id: mockTenantId,
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
      const caller = domainRouter.createCaller(createMockContext());

      await expect(
        caller.add({
          tenantId: mockTenantId,
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

      const caller = domainRouter.createCaller(createMockContext());

      await expect(
        caller.add({
          tenantId: mockTenantId,
          domain: 'taken.example.com',
        }),
      ).rejects.toThrow('Domain already in use');

      expect(mockVercelDomain.addDomain).not.toHaveBeenCalled();
    });

    it('should require admin role for tenant', async () => {
      const viewerContext = createMockContext({
        userId: 'user-456',
        roles: [],
        tenants: [{ tenant: mockTenantId, roles: ['viewer'] }],
      });

      const caller = domainRouter.createCaller(viewerContext);

      await expect(
        caller.add({
          tenantId: mockTenantId,
          domain: 'ceremonia.example.com',
        }),
      ).rejects.toThrow(/Insufficient permissions|Unauthorized/i);
    });

    it('should handle Vercel API errors gracefully (rollback on failure)', async () => {
      mockTenantRepository.findById.mockResolvedValue({
        id: mockTenantId,
        slug: 'ceremonia',
        domain: null,
        domainStatus: null,
      });

      mockTenantRepository.findByDomain.mockResolvedValue(null);

      mockVercelDomain.addDomain.mockRejectedValue(new Error('Vercel API rate limit exceeded'));

      const caller = domainRouter.createCaller(createMockContext());

      await expect(
        caller.add({
          tenantId: mockTenantId,
          domain: 'ceremonia.example.com',
        }),
      ).rejects.toThrow('Vercel API rate limit exceeded');

      // Database should not be updated on Vercel API failure
      expect(mockTenantRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    it('should verify domain and update tenant status', async () => {
      mockTenantRepository.findById.mockResolvedValue({
        id: mockTenantId,
        slug: 'ceremonia',
        domain: 'ceremonia.example.com',
        domainStatus: 'pending_verification',
      });

      mockVercelDomain.verifyDomain.mockResolvedValue({
        verified: true,
        domain: 'ceremonia.example.com',
      });

      mockTenantRepository.update.mockResolvedValue({
        id: mockTenantId,
        domain: 'ceremonia.example.com',
        domainStatus: 'verified',
        domainVerificationRecords: null,
      });

      const caller = domainRouter.createCaller(createMockContext());
      const result = await caller.verify({
        tenantId: mockTenantId,
      });

      expect(mockVercelDomain.verifyDomain).toHaveBeenCalledWith('ceremonia.example.com');

      expect(mockTenantRepository.update).toHaveBeenCalledWith(
        mockTenantId,
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
        id: mockTenantId,
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

      const caller = domainRouter.createCaller(createMockContext());
      const result = await caller.verify({
        tenantId: mockTenantId,
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

      // Status should remain pending (no update)
      expect(mockTenantRepository.update).not.toHaveBeenCalled();
    });

    it('should handle tenant without domain', async () => {
      mockTenantRepository.findById.mockResolvedValue({
        id: mockTenantId,
        domain: null,
        domainStatus: null,
      });

      const caller = domainRouter.createCaller(createMockContext());

      await expect(
        caller.verify({
          tenantId: mockTenantId,
        }),
      ).rejects.toThrow('No domain configured for this tenant');
    });
  });

  describe('remove', () => {
    it('should remove domain from Vercel and database', async () => {
      mockTenantRepository.findById.mockResolvedValue({
        id: mockTenantId,
        domain: 'old-domain.example.com',
        domainStatus: 'verified',
      });

      mockVercelDomain.removeDomain.mockResolvedValue(undefined);

      mockTenantRepository.update.mockResolvedValue({
        id: mockTenantId,
        domain: null,
        domainStatus: null,
        domainVerificationRecords: null,
      });

      const caller = domainRouter.createCaller(createMockContext());
      const result = await caller.remove({
        tenantId: mockTenantId,
      });

      expect(mockVercelDomain.removeDomain).toHaveBeenCalledWith('old-domain.example.com');

      expect(mockTenantRepository.update).toHaveBeenCalledWith(mockTenantId, {
        domain: null,
        domainStatus: null,
        domainVerificationRecords: null,
      });

      expect(result).toEqual({
        success: true,
        tenantId: mockTenantId,
      });
    });

    it('should handle already removed domain gracefully (idempotent)', async () => {
      mockTenantRepository.findById.mockResolvedValue({
        id: mockTenantId,
        domain: null,
        domainStatus: null,
      });

      const caller = domainRouter.createCaller(createMockContext());
      const result = await caller.remove({
        tenantId: mockTenantId,
      });

      // Vercel API should not be called if no domain configured
      expect(mockVercelDomain.removeDomain).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        tenantId: mockTenantId,
      });
    });

    it('should require admin permissions', async () => {
      const viewerContext = createMockContext({
        userId: 'user-789',
        roles: [],
        tenants: [{ tenant: mockTenantId, roles: ['viewer'] }],
      });

      const caller = domainRouter.createCaller(viewerContext);

      await expect(
        caller.remove({
          tenantId: mockTenantId,
        }),
      ).rejects.toThrow(/Insufficient permissions|Unauthorized/i);
    });
  });
});
