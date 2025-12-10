/**
 * PageRenderer Tests
 *
 * Test suite for PageRenderer component covering:
 * - Happy path: Render page with mixed section types
 * - Happy path: Render with designSystem='untitledui'
 * - Error paths: Unknown blockType logs warning, doesn't crash
 * - Edge cases: Empty sections array renders empty page
 * - Edge cases: Missing designSystem defaults to untitledui
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageRenderer } from './index';
import type { PageData } from './types';

describe('PageRenderer', () => {
  // Spy on console.warn to verify warning messages
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Happy Path', () => {
    it('should render page with mixed section types', () => {
      const page: PageData = {
        designSystem: 'untitledui',
        sections: [
          {
            blockType: 'hero',
            ctaHref: '/get-started',
            ctaLabel: 'Get Started',
            subtitle: 'Build amazing landing pages',
            title: 'Welcome to Page Builder',
          },
          {
            blockType: 'text',
            body: 'This is a text section with some content.',
            heading: 'About Us',
          },
          {
            blockType: 'cta',
            description: 'Start building today',
            heading: 'Ready to get started?',
            primaryButton: { href: '/signup', label: 'Sign Up' },
            secondaryButton: { href: '/learn-more', label: 'Learn More' },
          },
          {
            blockType: 'features',
            heading: 'Features',
            items: [
              {
                description: 'Fast and efficient',
                icon: 'zap',
                title: 'Lightning Fast',
              },
              {
                description: 'Enterprise-grade security',
                icon: 'shield',
                title: 'Secure',
              },
            ],
          },
        ],
        slug: 'home',
        title: 'Home Page',
      };

      render(<PageRenderer page={page} />);

      // Verify all sections are rendered
      expect(screen.getByText('Welcome to Page Builder')).toBeInTheDocument();
      expect(screen.getByText('Build amazing landing pages')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();

      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('This is a text section with some content.')).toBeInTheDocument();

      expect(screen.getByText('Ready to get started?')).toBeInTheDocument();
      expect(screen.getByText('Start building today')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();

      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
      expect(screen.getByText('Fast and efficient')).toBeInTheDocument();
      expect(screen.getByText('Secure')).toBeInTheDocument();
      expect(screen.getByText('Enterprise-grade security')).toBeInTheDocument();
    });

    it('should render with designSystem=untitledui', () => {
      const page: PageData = {
        designSystem: 'untitledui',
        sections: [
          {
            blockType: 'hero',
            title: 'Untitled UI Hero',
          },
        ],
        slug: 'test',
        title: 'Test Page',
      };

      render(<PageRenderer page={page} />);

      expect(screen.getByText('Untitled UI Hero')).toBeInTheDocument();
      expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
    });

    it('should render with designSystem=shadcn (placeholder)', () => {
      const page: PageData = {
        designSystem: 'shadcn',
        sections: [
          {
            blockType: 'hero',
            title: 'Shadcn Hero',
          },
        ],
        slug: 'test',
        title: 'Test Page',
      };

      render(<PageRenderer page={page} />);

      // Shadcn components are placeholders
      expect(screen.getByText('Shadcn Hero (Coming Soon)')).toBeInTheDocument();
    });
  });

  describe('Error Paths', () => {
    it('should log warning and skip render for unknown blockType', () => {
      const page: PageData = {
        designSystem: 'untitledui',
        sections: [
          {
            blockType: 'hero',
            title: 'Valid Hero',
          },
          {
            blockType: 'unknown',
            someData: 'test',
          } as any,
          {
            blockType: 'text',
            body: 'Valid Text',
          },
        ],
        slug: 'test',
        title: 'Test Page',
      };

      render(<PageRenderer page={page} />);

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[PageRenderer] Unknown blockType: "unknown" at index 1. Skipping render.',
      );

      // Verify valid sections still render
      expect(screen.getByText('Valid Hero')).toBeInTheDocument();
      expect(screen.getByText('Valid Text')).toBeInTheDocument();

      // Verify unknown section doesn't crash and doesn't render
      expect(screen.queryByText('test')).not.toBeInTheDocument();
    });

    it('should not crash when all sections are unknown blockTypes', () => {
      const page: PageData = {
        designSystem: 'untitledui',
        sections: [
          {
            blockType: 'invalid1',
            data: 'test1',
          } as any,
          {
            blockType: 'invalid2',
            data: 'test2',
          } as any,
        ],
        slug: 'test',
        title: 'Test Page',
      };

      render(<PageRenderer page={page} />);

      // Verify warnings were logged
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[PageRenderer] Unknown blockType: "invalid1" at index 0. Skipping render.',
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[PageRenderer] Unknown blockType: "invalid2" at index 1. Skipping render.',
      );

      // Verify component doesn't crash (renders empty container)
      expect(screen.queryByText('test1')).not.toBeInTheDocument();
      expect(screen.queryByText('test2')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render null for empty sections array', () => {
      const page: PageData = {
        designSystem: 'untitledui',
        sections: [],
        slug: 'empty',
        title: 'Empty Page',
      };

      const { container } = render(<PageRenderer page={page} />);

      // Verify component renders null (no DOM nodes)
      expect(container.firstChild).toBeNull();
    });

    it('should default to untitledui when designSystem is missing', () => {
      const page: PageData = {
        // designSystem is undefined
        sections: [
          {
            blockType: 'hero',
            title: 'Default Design System',
          },
        ],
        slug: 'test',
        title: 'Test Page',
      };

      render(<PageRenderer page={page} />);

      // Verify Untitled UI component is used (not Shadcn placeholder)
      expect(screen.getByText('Default Design System')).toBeInTheDocument();
      expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
    });

    it('should handle sections with minimal required fields', () => {
      const page: PageData = {
        designSystem: 'untitledui',
        sections: [
          {
            blockType: 'hero',
            title: 'Minimal Hero',
            // No optional fields
          },
          {
            blockType: 'text',
            body: 'Minimal text',
            // No heading
          },
          {
            blockType: 'cta',
            heading: 'Minimal CTA',
            primaryButton: { href: '/test', label: 'Test' },
            // No description or secondaryButton
          },
          {
            blockType: 'features',
            items: [
              {
                description: 'Feature desc',
                icon: 'star',
                title: 'Feature',
              },
            ],
            // No heading
          },
        ],
        slug: 'minimal',
        title: 'Minimal Page',
      };

      render(<PageRenderer page={page} />);

      // Verify all sections render with minimal data
      expect(screen.getByText('Minimal Hero')).toBeInTheDocument();
      expect(screen.getByText('Minimal text')).toBeInTheDocument();
      expect(screen.getByText('Minimal CTA')).toBeInTheDocument();
      expect(screen.getByText('Feature')).toBeInTheDocument();
    });

    it('should handle multiple sections of the same blockType', () => {
      const page: PageData = {
        designSystem: 'untitledui',
        sections: [
          {
            blockType: 'text',
            body: 'First text section',
            heading: 'Section 1',
          },
          {
            blockType: 'text',
            body: 'Second text section',
            heading: 'Section 2',
          },
          {
            blockType: 'text',
            body: 'Third text section',
            heading: 'Section 3',
          },
        ],
        slug: 'multiple',
        title: 'Multiple Sections',
      };

      render(<PageRenderer page={page} />);

      // Verify all sections render with unique keys
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('First text section')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Second text section')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
      expect(screen.getByText('Third text section')).toBeInTheDocument();
    });
  });
});
