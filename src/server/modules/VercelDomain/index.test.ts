// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as VercelDomainModule from './index';

// Mock fetch utility
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

describe('VercelDomain', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      expect(vercelDomain).toBeDefined();
      expect(vercelDomain).toBeInstanceOf(VercelDomainModule.VercelDomain);
    });

    it('should throw error when VERCEL_API_TOKEN is missing', () => {
      const spy = vi.spyOn(VercelDomainModule.envHelpers, 'getVercelEnv').mockReturnValue({
        VERCEL_API_TOKEN: '',
        VERCEL_PROJECT_ID: 'test-project',
        VERCEL_TEAM_ID: 'test-team',
      });

      try {
        expect(() => new VercelDomainModule.VercelDomain()).toThrow('VERCEL_API_TOKEN is required');
      } finally {
        spy.mockRestore();
      }
    });

    it('should throw error when VERCEL_PROJECT_ID is missing', () => {
      const spy = vi.spyOn(VercelDomainModule.envHelpers, 'getVercelEnv').mockReturnValue({
        VERCEL_API_TOKEN: 'test-token',
        VERCEL_PROJECT_ID: '',
        VERCEL_TEAM_ID: 'test-team',
      });

      try {
        expect(() => new VercelDomainModule.VercelDomain()).toThrow(
          'VERCEL_PROJECT_ID is required',
        );
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('addDomain', () => {
    it('should add domain to Vercel project successfully', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
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
        'https://api.vercel.com/v10/projects/test-project-456/domains?teamId=test-team-789',
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

    it('should handle domain already exists error (409)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

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

    it('should handle invalid domain format (400)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

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

      await expect(vercelDomain.addDomain('invalid domain')).rejects.toThrow(
        'Invalid domain format',
      );
    });

    it('should handle rate limiting (429)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

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

      await expect(vercelDomain.addDomain('test.example.com')).rejects.toThrow(
        'Rate limit exceeded',
      );
    });

    it('should handle network errors', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(vercelDomain.addDomain('test.example.com')).rejects.toThrow('Network error');
    });

    it('should handle forbidden error (403)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          error: {
            code: 'forbidden',
            message: 'Insufficient permissions to add domain',
          },
        }),
      });

      await expect(vercelDomain.addDomain('test.example.com')).rejects.toThrow(
        'Insufficient permissions',
      );
    });

    it('should handle unauthorized error (401)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            code: 'unauthorized',
            message: 'Invalid or expired API token',
          },
        }),
      });

      await expect(vercelDomain.addDomain('test.example.com')).rejects.toThrow(
        'Invalid or expired API token',
      );
    });
  });

  describe('verifyDomain', () => {
    it('should verify domain successfully when DNS is configured', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'ceremonia.example.com',
          verified: true,
          verification: [],
        }),
      });

      const result = await vercelDomain.verifyDomain('ceremonia.example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v9/projects/test-project-456/domains/ceremonia.example.com?teamId=test-team-789',
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
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
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

    it('should handle domain not found error (404)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

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

    it('should handle DNS verification failure with error reason', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'ceremonia.example.com',
          verified: false,
          verification: [
            {
              type: 'TXT',
              domain: '_vercel',
              value: 'vc-domain-verify=abc123',
              reason: 'DNS_RECORD_NOT_FOUND',
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

    it('should handle network errors during verification', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockRejectedValue(new Error('Network timeout'));

      await expect(vercelDomain.verifyDomain('ceremonia.example.com')).rejects.toThrow(
        'Network timeout',
      );
    });
  });

  describe('removeDomain', () => {
    it('should remove domain from Vercel successfully (204)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      await vercelDomain.removeDomain('old-domain.example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v9/projects/test-project-456/domains/old-domain.example.com?teamId=test-team-789',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        }),
      );
    });

    it('should handle domain not found during removal (idempotent)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

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

    it('should handle permission errors (403)', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

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

    it('should handle network errors during removal', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockRejectedValue(new Error('Connection refused'));

      await expect(vercelDomain.removeDomain('test.example.com')).rejects.toThrow(
        'Connection refused',
      );
    });

    it('should handle unauthorized errors during removal', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            code: 'unauthorized',
            message: 'Invalid API token',
          },
        }),
      });

      await expect(vercelDomain.removeDomain('test.example.com')).rejects.toThrow(
        'Invalid API token',
      );
    });
  });

  describe('getDomain', () => {
    it('should retrieve domain information successfully', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'ceremonia.example.com',
          verified: true,
          verification: [],
          gitBranch: null,
          redirect: null,
        }),
      });

      const result = await vercelDomain.getDomain('ceremonia.example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v9/projects/test-project-456/domains/ceremonia.example.com?teamId=test-team-789',
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result).toEqual({
        name: 'ceremonia.example.com',
        verified: true,
        verification: [],
        gitBranch: null,
        redirect: null,
      });
    });

    it('should handle domain not found', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

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

      await expect(vercelDomain.getDomain('nonexistent.example.com')).rejects.toThrow(
        'Domain not found',
      );
    });
  });

  describe('listDomains', () => {
    it('should list all domains in project', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          domains: [
            {
              name: 'ceremonia.example.com',
              verified: true,
              verification: [],
            },
            {
              name: 'other.example.com',
              verified: false,
              verification: [
                {
                  type: 'TXT',
                  domain: '_vercel',
                  value: 'vc-domain-verify=xyz789',
                  reason: 'PENDING',
                },
              ],
            },
          ],
          pagination: {
            count: 2,
            next: null,
            prev: null,
          },
        }),
      });

      const result = await vercelDomain.listDomains();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v9/projects/test-project-456/domains?teamId=test-team-789',
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result).toEqual({
        domains: [
          {
            name: 'ceremonia.example.com',
            verified: true,
            verification: [],
          },
          {
            name: 'other.example.com',
            verified: false,
            verification: [
              {
                type: 'TXT',
                domain: '_vercel',
                value: 'vc-domain-verify=xyz789',
                reason: 'PENDING',
              },
            ],
          },
        ],
        pagination: {
          count: 2,
          next: null,
          prev: null,
        },
      });
    });

    it('should handle empty domain list', async () => {
      const vercelDomain = new VercelDomainModule.VercelDomain();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          domains: [],
          pagination: {
            count: 0,
            next: null,
            prev: null,
          },
        }),
      });

      const result = await vercelDomain.listDomains();

      expect(result.domains).toEqual([]);
      expect(result.pagination.count).toBe(0);
    });
  });
});
