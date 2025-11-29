import type { PageSpec } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { pageSpecToBuilderContent } from './pageSpecToBuilderContent';

describe('pageSpecToBuilderContent', () => {
  describe('hero section mapping', () => {
    it('should convert hero section to Builder block with correct structure', () => {
      const pageSpec: PageSpec = {
        tenantId: 'test-tenant',
        slug: 'test-page',
        title: 'Test Page',
        sections: [
          {
            type: 'hero',
            title: 'Hero Title',
            subtitle: 'Hero Subtitle',
            ctaLabel: 'Click Me',
          },
        ],
      };

      const result = pageSpecToBuilderContent(pageSpec);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        '@type': '@builder.io/sdk:Element',
        'component': {
          name: 'Hero',
          options: {
            title: 'Hero Title',
            subtitle: 'Hero Subtitle',
            ctaLabel: 'Click Me',
          },
        },
      });
    });
  });

  describe('text section mapping', () => {
    it('should convert text section to Builder block with HTML content', () => {
      const pageSpec: PageSpec = {
        tenantId: 'test-tenant',
        slug: 'test-page',
        title: 'Test Page',
        sections: [
          {
            type: 'text',
            heading: 'About Us',
            body: 'We are awesome',
          },
        ],
      };

      const result = pageSpecToBuilderContent(pageSpec);

      expect(result).toHaveLength(1);
      expect(result[0].component.options.text).toBe('<h2>About Us</h2><p>We are awesome</p>');
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown section type', () => {
      const pageSpec: PageSpec = {
        tenantId: 'test-tenant',
        slug: 'test-page',
        title: 'Test Page',
        sections: [{ type: 'unknown' as any }],
      };

      expect(() => pageSpecToBuilderContent(pageSpec)).toThrow('Unknown section type: unknown');
    });
  });

  describe('multiple sections', () => {
    it('should convert multiple sections in correct order', () => {
      const pageSpec: PageSpec = {
        tenantId: 'test-tenant',
        slug: 'test-page',
        title: 'Test Page',
        sections: [
          { type: 'hero', title: 'Hero', subtitle: 'Sub', ctaLabel: 'CTA' },
          { type: 'text', heading: 'Text', body: 'Body' },
        ],
      };

      const result = pageSpecToBuilderContent(pageSpec);

      expect(result).toHaveLength(2);
      expect(result[0].component.name).toBe('Hero');
      expect(result[1].component.name).toBe('Text');
    });
  });
});
