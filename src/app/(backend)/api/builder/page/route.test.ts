// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

// Mock environment variables
vi.stubEnv('BUILDER_PRIVATE_API_KEY', 'test-private-key');
vi.stubEnv('NEXT_PUBLIC_BUILDER_API_KEY', 'test-public-key');

describe('POST /api/builder/page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful page creation', () => {
    it('should create Builder page and return slug', async () => {
      // Mock Builder API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'builder-page-id' }),
      });

      const pageSpec = {
        slug: 'meditation-retreat',
        title: 'Meditation Retreat Landing Page',
        sections: [
          {
            type: 'hero',
            title: 'Find Inner Peace',
            subtitle: 'Join our 2025 retreat',
            ctaLabel: 'Apply Now',
          },
        ],
      };

      const request = new Request('http://localhost:3000/api/builder/page', {
        method: 'POST',
        body: JSON.stringify(pageSpec),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ slug: 'meditation-retreat' });

      // Verify Builder API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://builder.io/api/v1/write/page',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-private-key',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should send correct Builder block structure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'test-id' }),
      });

      const pageSpec = {
        slug: 'test',
        title: 'Test',
        sections: [{ type: 'hero', title: 'Hero', subtitle: 'Sub', ctaLabel: 'CTA' }],
      };

      const request = new Request('http://localhost:3000/api/builder/page', {
        method: 'POST',
        body: JSON.stringify(pageSpec),
      });

      await POST(request);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.data.blocks).toHaveLength(1);
      expect(body.data.blocks[0].component.name).toBe('Hero');
    });
  });

  describe('error handling', () => {
    it('should return 500 when Builder API fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const request = new Request('http://localhost:3000/api/builder/page', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test', title: 'Test', sections: [] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create page' });
    });

    it('should return 400 for invalid PageSpec schema', async () => {
      const request = new Request('http://localhost:3000/api/builder/page', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
