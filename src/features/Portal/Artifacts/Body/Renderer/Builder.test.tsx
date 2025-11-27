/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BuilderRenderer from './Builder';

describe('<BuilderRenderer />', () => {
  describe('valid content rendering', () => {
    it('should render iframe with correct src when given valid JSON', () => {
      const content = JSON.stringify({
        slug: 'meditation-retreat',
        builderUrl: '/builder-preview/meditation-retreat',
      });

      render(<BuilderRenderer content={content} />);

      const iframe = screen.getByTitle('Builder Page Preview');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', '/builder-preview/meditation-retreat');
    });

    it('should render iframe with full width and height styles', () => {
      const content = JSON.stringify({
        slug: 'test',
        builderUrl: '/builder-preview/test',
      });

      render(<BuilderRenderer content={content} />);

      const iframe = screen.getByTitle('Builder Page Preview');
      expect(iframe).toHaveStyle({
        border: 'none',
        height: '100%',
        width: '100%',
      });
    });
  });

  describe('invalid content handling', () => {
    it('should display error message when content is invalid JSON', () => {
      render(<BuilderRenderer content="invalid json{" />);

      expect(screen.getByText('Invalid Builder artifact')).toBeInTheDocument();
      expect(screen.queryByTitle('Builder Page Preview')).not.toBeInTheDocument();
    });

    it('should display error message when builderUrl is missing', () => {
      const content = JSON.stringify({ slug: 'test' }); // Missing builderUrl

      render(<BuilderRenderer content={content} />);

      expect(screen.getByText('Invalid Builder artifact')).toBeInTheDocument();
    });

    it('should display error message when builderUrl is empty string', () => {
      const content = JSON.stringify({ slug: 'test', builderUrl: '' });

      render(<BuilderRenderer content={content} />);

      expect(screen.getByText('Invalid Builder artifact')).toBeInTheDocument();
    });
  });
});
