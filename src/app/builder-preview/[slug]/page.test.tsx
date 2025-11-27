/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BuilderPreviewPage from './page';

// Mock Builder.io SDK
vi.mock('@builder.io/sdk', () => ({
  builder: {
    get: vi.fn(() => ({
      promise: vi.fn(),
    })),
    init: vi.fn(),
  },
}));

vi.mock('@builder.io/sdk-react-nextjs', () => ({
  RenderBuilderContent: ({ content }: any) => (
    <div data-testid="builder-content">{content?.data?.title || 'No title'}</div>
  ),
}));

describe('BuilderPreviewPage', () => {
  describe('successful content rendering', () => {
    it('should render Builder content when page exists', async () => {
      const { builder } = await import('@builder.io/sdk');
      (builder.get as any).mockReturnValue({
        promise: async () => ({
          data: { title: 'Meditation Retreat' },
        }),
      });

      const params = Promise.resolve({ slug: 'meditation-retreat' });
      const page = await BuilderPreviewPage({ params });

      render(page);

      expect(screen.getByTestId('builder-content')).toHaveTextContent('Meditation Retreat');
    });
  });

  describe('error handling', () => {
    it('should display 404 message when page not found', async () => {
      const { builder } = await import('@builder.io/sdk');
      (builder.get as any).mockReturnValue({
        promise: async () => null,
      });

      const params = Promise.resolve({ slug: 'non-existent' });
      const page = await BuilderPreviewPage({ params });

      render(page);

      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('No Builder content found for: /non-existent')).toBeInTheDocument();
    });
  });

  describe('Builder SDK configuration', () => {
    it('should fetch page with includeUnpublished option', async () => {
      const { builder } = await import('@builder.io/sdk');
      const mockGet = vi.fn().mockReturnValue({
        promise: async () => ({ data: {} }),
      });
      (builder.get as any) = mockGet;

      const params = Promise.resolve({ slug: 'test' });
      await BuilderPreviewPage({ params });

      expect(mockGet).toHaveBeenCalledWith('page', {
        options: { includeUnpublished: true },
        userAttributes: { urlPath: '/test' },
      });
    });
  });
});
