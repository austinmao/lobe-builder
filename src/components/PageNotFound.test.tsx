/**
 * Tests for PageNotFound Component
 *
 * Covers:
 * - Happy path: Render 404 message
 * - Accessibility: Semantic HTML, keyboard navigation
 * - Edge cases: Link navigation
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageNotFound } from './PageNotFound';

describe('PageNotFound', () => {
  describe('Happy Path: Render 404 message', () => {
    it('should render 404 title', () => {
      render(<PageNotFound />);

      expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    });

    it('should render helpful message', () => {
      render(<PageNotFound />);

      expect(
        screen.getByText(/The page you are looking for does not exist or has been removed/),
      ).toBeInTheDocument();
    });

    it('should render link to home', () => {
      render(<PageNotFound />);

      const homeLink = screen.getByRole('link', { name: /go back to home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Accessibility', () => {
    it('should use semantic HTML with heading', () => {
      render(<PageNotFound />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('404 - Page Not Found');
    });

    it('should have accessible link with proper role', () => {
      render(<PageNotFound />);

      const homeLink = screen.getByRole('link');
      expect(homeLink).toBeInTheDocument();
    });

    it('should have keyboard-accessible link', () => {
      const { container } = render(<PageNotFound />);

      const homeLink = screen.getByRole('link');
      homeLink.focus();

      expect(document.activeElement).toBe(homeLink);
    });
  });

  describe('Styling', () => {
    it('should apply centered layout styles', () => {
      const { container } = render(<PageNotFound />);

      const pageDiv = container.querySelector('.page-not-found');
      expect(pageDiv).toBeInTheDocument();
    });

    it('should have styled home link', () => {
      const { container } = render(<PageNotFound />);

      const homeLink = container.querySelector('.home-link');
      expect(homeLink).toBeInTheDocument();
    });
  });
});
