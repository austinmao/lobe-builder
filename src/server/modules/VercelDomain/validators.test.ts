// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isDomainAvailable, validateDomain } from './validators';

describe('validateDomain', () => {
  describe('valid domains', () => {
    it('should accept valid domains', () => {
      expect(validateDomain('example.com')).toBe(true);
      expect(validateDomain('subdomain.example.com')).toBe(true);
      expect(validateDomain('multi.level.subdomain.example.com')).toBe(true);
      expect(validateDomain('ceremoniacircle.org')).toBe(true);
      expect(validateDomain('test-site.com')).toBe(true);
      expect(validateDomain('my-app.io')).toBe(true);
    });

    it('should accept domains with numbers', () => {
      expect(validateDomain('app123.example.com')).toBe(true);
      expect(validateDomain('123example.com')).toBe(true);
      expect(validateDomain('test1.test2.example.com')).toBe(true);
    });

    it('should accept long TLDs', () => {
      expect(validateDomain('example.technology')).toBe(true);
      expect(validateDomain('site.photography')).toBe(true);
      expect(validateDomain('app.international')).toBe(true);
    });
  });

  describe('invalid domains', () => {
    it('should reject domains with spaces', () => {
      expect(validateDomain('invalid domain')).toBe(false);
      expect(validateDomain('my site.com')).toBe(false);
      expect(validateDomain(' example.com')).toBe(false);
      expect(validateDomain('example.com ')).toBe(false);
    });

    it('should reject domains with protocols', () => {
      expect(validateDomain('http://example.com')).toBe(false);
      expect(validateDomain('https://example.com')).toBe(false);
      expect(validateDomain('ftp://example.com')).toBe(false);
    });

    it('should reject domains with trailing slashes', () => {
      expect(validateDomain('example.com/')).toBe(false);
      expect(validateDomain('example.com/path')).toBe(false);
    });

    it('should reject domains with hyphens at start or end of labels', () => {
      expect(validateDomain('-example.com')).toBe(false);
      expect(validateDomain('example-.com')).toBe(false);
      expect(validateDomain('sub-domain-.com')).toBe(false);
    });

    it('should reject empty or whitespace-only strings', () => {
      expect(validateDomain('')).toBe(false);
      expect(validateDomain('   ')).toBe(false);
      expect(validateDomain('\t')).toBe(false);
      expect(validateDomain('\n')).toBe(false);
    });

    it('should reject domains with special characters', () => {
      expect(validateDomain('example@.com')).toBe(false);
      expect(validateDomain('example#.com')).toBe(false);
      expect(validateDomain('example$.com')).toBe(false);
      expect(validateDomain('example%.com')).toBe(false);
      expect(validateDomain('example&.com')).toBe(false);
    });

    it('should reject domains with consecutive dots', () => {
      expect(validateDomain('example..com')).toBe(false);
      expect(validateDomain('subdomain..example.com')).toBe(false);
    });

    it('should reject domains without TLD', () => {
      expect(validateDomain('example')).toBe(false);
      expect(validateDomain('single-label')).toBe(false);
    });

    it('should reject domains with invalid TLD', () => {
      expect(validateDomain('example.123')).toBe(false);
      expect(validateDomain('example.-com')).toBe(false);
    });
  });

  describe('localhost and internal domains', () => {
    it('should reject localhost', () => {
      expect(validateDomain('localhost')).toBe(false);
      expect(validateDomain('localhost.localdomain')).toBe(false);
    });

    it('should reject IP addresses', () => {
      expect(validateDomain('127.0.0.1')).toBe(false);
      expect(validateDomain('192.168.1.1')).toBe(false);
      expect(validateDomain('10.0.0.1')).toBe(false);
      expect(validateDomain('172.16.0.1')).toBe(false);
    });

    it('should reject .local domains', () => {
      expect(validateDomain('internal.local')).toBe(false);
      expect(validateDomain('mycomputer.local')).toBe(false);
    });

    it('should reject .test domains', () => {
      expect(validateDomain('example.test')).toBe(false);
      expect(validateDomain('test.test')).toBe(false);
    });

    it('should reject .localhost domains', () => {
      expect(validateDomain('app.localhost')).toBe(false);
    });
  });

  describe('reserved Vercel domains', () => {
    it('should reject vercel.app domains', () => {
      expect(validateDomain('vercel.app')).toBe(false);
      expect(validateDomain('myapp.vercel.app')).toBe(false);
      expect(validateDomain('subdomain.myapp.vercel.app')).toBe(false);
    });

    it('should reject vercel.dev domains', () => {
      expect(validateDomain('vercel.dev')).toBe(false);
      expect(validateDomain('myapp.vercel.dev')).toBe(false);
    });

    it('should reject now.sh domains', () => {
      expect(validateDomain('now.sh')).toBe(false);
      expect(validateDomain('myapp.now.sh')).toBe(false);
    });

    it('should reject vercel.com domains', () => {
      expect(validateDomain('vercel.com')).toBe(false);
      expect(validateDomain('app.vercel.com')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should reject very long domains (over 253 characters)', () => {
      const longDomain = 'a'.repeat(240) + '.example.com'; // Total > 253 characters
      expect(validateDomain(longDomain)).toBe(false);
    });

    it('should reject very long labels (over 63 characters)', () => {
      const longLabel = 'a'.repeat(64) + '.example.com';
      expect(validateDomain(longLabel)).toBe(false);
    });

    it('should accept maximum valid label length (63 characters)', () => {
      const maxLabel = 'a'.repeat(63) + '.example.com';
      expect(validateDomain(maxLabel)).toBe(true);
    });

    it('should handle domains with query strings (should reject)', () => {
      expect(validateDomain('example.com?query=value')).toBe(false);
    });

    it('should handle domains with fragments (should reject)', () => {
      expect(validateDomain('example.com#fragment')).toBe(false);
    });

    it('should handle domains with ports (should reject)', () => {
      expect(validateDomain('example.com:8080')).toBe(false);
    });

    it('should handle punycode/internationalized domains', () => {
      expect(validateDomain('xn--e1afmkfd.xn--p1ai')).toBe(true); // пример.рф in punycode
    });
  });
});

describe('isDomainAvailable', () => {
  let mockTenantRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTenantRepository = {
      findByDomain: vi.fn(),
    };
  });

  describe('domain availability checks', () => {
    it('should check if domain is not already in use by another tenant', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue(null);

      const available = await isDomainAvailable('newdomain.example.com', mockTenantRepository);

      expect(available).toBe(true);
      expect(mockTenantRepository.findByDomain).toHaveBeenCalledWith('newdomain.example.com');
    });

    it('should return false if domain is already in use', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue({
        id: 'other-tenant-123',
        slug: 'other-tenant',
        domain: 'existing.example.com',
      });

      const available = await isDomainAvailable('existing.example.com', mockTenantRepository);

      expect(available).toBe(false);
    });

    it('should allow same domain for same tenant (update scenario)', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue({
        id: 'ceremonia-123',
        slug: 'ceremonia',
        domain: 'ceremonia.example.com',
      });

      const available = await isDomainAvailable(
        'ceremonia.example.com',
        mockTenantRepository,
        'ceremonia-123', // same tenant ID
      );

      expect(available).toBe(true);
    });

    it('should return false when domain is used by different tenant', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue({
        id: 'other-tenant-456',
        slug: 'other-tenant',
        domain: 'taken.example.com',
      });

      const available = await isDomainAvailable(
        'taken.example.com',
        mockTenantRepository,
        'ceremonia-123', // different tenant ID
      );

      expect(available).toBe(false);
    });
  });

  describe('case sensitivity', () => {
    it('should handle case-insensitive domain comparison', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue({
        id: 'other-tenant-123',
        slug: 'other-tenant',
        domain: 'Example.COM',
      });

      const available = await isDomainAvailable('example.com', mockTenantRepository);

      expect(available).toBe(false);
    });

    it('should normalize domain case before checking', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue(null);

      await isDomainAvailable('UPPERCASE.EXAMPLE.COM', mockTenantRepository);

      // Should query with lowercase
      expect(mockTenantRepository.findByDomain).toHaveBeenCalledWith(
        expect.stringMatching(/^[a-z0-9.-]+$/),
      );
    });
  });

  describe('error handling', () => {
    it('should handle database query errors', async () => {
      mockTenantRepository.findByDomain.mockRejectedValue(new Error('Database connection failed'));

      await expect(isDomainAvailable('test.example.com', mockTenantRepository)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle null tenant repository', async () => {
      await expect(isDomainAvailable('test.example.com', null as any)).rejects.toThrow();
    });

    it('should handle undefined tenant repository', async () => {
      await expect(isDomainAvailable('test.example.com', undefined as any)).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty domain string', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue(null);

      const available = await isDomainAvailable('', mockTenantRepository);

      expect(mockTenantRepository.findByDomain).toHaveBeenCalledWith('');
      expect(available).toBe(true);
    });

    it('should handle domain with whitespace', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue(null);

      await isDomainAvailable('  example.com  ', mockTenantRepository);

      // Should trim whitespace
      expect(mockTenantRepository.findByDomain).toHaveBeenCalledWith(
        expect.not.stringMatching(/^\s|\s$/),
      );
    });

    it('should handle tenant ID as empty string', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue({
        id: '',
        slug: 'tenant',
        domain: 'test.example.com',
      });

      const available = await isDomainAvailable(
        'test.example.com',
        mockTenantRepository,
        '', // empty tenant ID
      );

      expect(available).toBe(false);
    });

    it('should handle multiple tenants check race condition', async () => {
      // First call: domain is available
      mockTenantRepository.findByDomain.mockResolvedValueOnce(null);

      const result1 = await isDomainAvailable('race.example.com', mockTenantRepository);
      expect(result1).toBe(true);

      // Second call: domain is now taken
      mockTenantRepository.findByDomain.mockResolvedValueOnce({
        id: 'other-tenant',
        slug: 'other',
        domain: 'race.example.com',
      });

      const result2 = await isDomainAvailable('race.example.com', mockTenantRepository);
      expect(result2).toBe(false);
    });
  });

  describe('complex domain patterns', () => {
    it('should handle subdomain availability check', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue(null);

      const available = await isDomainAvailable('sub.domain.example.com', mockTenantRepository);

      expect(available).toBe(true);
      expect(mockTenantRepository.findByDomain).toHaveBeenCalledWith('sub.domain.example.com');
    });

    it('should distinguish between similar domains', async () => {
      // test.example.com is taken
      mockTenantRepository.findByDomain.mockImplementation((domain: string) => {
        if (domain === 'test.example.com') {
          return Promise.resolve({
            id: 'tenant-1',
            slug: 'tenant1',
            domain: 'test.example.com',
          });
        }
        return Promise.resolve(null);
      });

      const taken = await isDomainAvailable('test.example.com', mockTenantRepository);
      expect(taken).toBe(false);

      const available = await isDomainAvailable('test2.example.com', mockTenantRepository);
      expect(available).toBe(true);
    });

    it('should handle punycode domains', async () => {
      mockTenantRepository.findByDomain.mockResolvedValue(null);

      const available = await isDomainAvailable('xn--e1afmkfd.xn--p1ai', mockTenantRepository);

      expect(available).toBe(true);
    });
  });
});
