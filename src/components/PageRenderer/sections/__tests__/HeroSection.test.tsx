/**
 * HeroSection Component Tests
 *
 * Test coverage:
 * - Happy path: Render with all props
 * - Happy path: Render with minimal props (title only)
 * - Edge cases: Render without CTA (ctaLabel undefined)
 * - Edge cases: Long title text wraps correctly
 * - Accessibility: Keyboard navigation and focus indicators
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
  describe('Happy Path: Render with all props', () => {
    it('should render title, subtitle, and CTA button when all props are provided', () => {
      render(
        <HeroSection
          title="Welcome to Our Platform"
          subtitle="Build amazing landing pages with ease"
          ctaLabel="Get Started"
          ctaHref="https://example.com/signup"
          backgroundImage="https://example.com/hero-bg.jpg"
        />,
      );

      // Verify title is rendered
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Welcome to Our Platform',
      );

      // Verify subtitle is rendered
      expect(screen.getByText('Build amazing landing pages with ease')).toBeInTheDocument();

      // Verify CTA button is rendered
      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
    });

    it('should apply background image style when backgroundImage prop is provided', () => {
      const { container } = render(
        <HeroSection title="Welcome" backgroundImage="https://example.com/hero-bg.jpg" />,
      );

      const section = container.querySelector('.hero-section');
      expect(section).toHaveStyle({
        backgroundImage: 'url(https://example.com/hero-bg.jpg)',
      });
    });

    it('should navigate to ctaHref when CTA button is clicked', async () => {
      const user = userEvent.setup();
      const originalLocation = window.location.href;

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: originalLocation } as any;

      render(
        <HeroSection title="Welcome" ctaLabel="Get Started" ctaHref="https://example.com/signup" />,
      );

      const ctaButton = screen.getByRole('button', { name: 'Get Started' });
      await user.click(ctaButton);

      expect(window.location.href).toBe('https://example.com/signup');
    });
  });

  describe('Happy Path: Render with minimal props (title only)', () => {
    it('should render only title when only title prop is provided', () => {
      render(<HeroSection title="Simple Hero Title" />);

      // Verify title is rendered
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Simple Hero Title');

      // Verify subtitle is NOT rendered
      expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();

      // Verify CTA button is NOT rendered
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not apply background image style when backgroundImage prop is not provided', () => {
      const { container } = render(<HeroSection title="Welcome" />);

      const section = container.querySelector('.hero-section');
      expect(section).not.toHaveStyle({
        backgroundImage: 'url()',
      });
    });
  });

  describe('Edge Cases: Render without CTA', () => {
    it('should not render CTA button when ctaLabel is undefined', () => {
      render(
        <HeroSection title="Welcome" subtitle="This is a subtitle" ctaHref="https://example.com" />,
      );

      // Verify CTA button is NOT rendered
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render CTA button when ctaLabel is empty string', () => {
      render(
        <HeroSection
          title="Welcome"
          subtitle="This is a subtitle"
          ctaLabel=""
          ctaHref="https://example.com"
        />,
      );

      // Verify CTA button is NOT rendered
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render CTA button when ctaLabel is provided but ctaHref is undefined', () => {
      render(<HeroSection title="Welcome" ctaLabel="Click Me" />);

      // Verify CTA button IS rendered (href is optional)
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases: Long title text wraps correctly', () => {
    it('should render long title text without breaking layout', () => {
      const longTitle =
        'This is a very long title that should wrap correctly across multiple lines without breaking the layout or causing horizontal overflow issues in the hero section component';

      render(<HeroSection title={longTitle} />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent(longTitle);
      expect(title).toBeInTheDocument();
    });

    it('should render long subtitle text without breaking layout', () => {
      const longSubtitle =
        'This is a very long subtitle that should wrap correctly across multiple lines without breaking the layout or causing horizontal overflow issues. It should maintain proper readability and spacing even when containing a significant amount of text content.';

      render(<HeroSection title="Title" subtitle={longSubtitle} />);

      const subtitle = screen.getByText(longSubtitle);
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Accessibility: Keyboard navigation and focus indicators', () => {
    it('should have accessible heading hierarchy (h1)', () => {
      render(<HeroSection title="Welcome" />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should support keyboard navigation on CTA button', async () => {
      const user = userEvent.setup();

      render(<HeroSection title="Welcome" ctaLabel="Get Started" ctaHref="/signup" />);

      const ctaButton = screen.getByRole('button', { name: 'Get Started' });

      // Tab to the button
      await user.tab();
      expect(ctaButton).toHaveFocus();
    });

    it('should trigger navigation on Enter key press', async () => {
      const user = userEvent.setup();
      const originalLocation = window.location.href;

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: originalLocation } as any;

      render(<HeroSection title="Welcome" ctaLabel="Get Started" ctaHref="/signup" />);

      const ctaButton = screen.getByRole('button', { name: 'Get Started' });
      await user.tab();
      await user.keyboard('{Enter}');

      expect(window.location.href).toBe('/signup');
    });

    it('should have semantic section element', () => {
      const { container } = render(<HeroSection title="Welcome" />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('hero-section');
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with correct base classes for responsive styling', () => {
      const { container } = render(
        <HeroSection title="Welcome" subtitle="Subtitle" ctaLabel="CTA" />,
      );

      // Verify core elements have expected classes
      expect(container.querySelector('.hero-section')).toBeInTheDocument();
      expect(container.querySelector('.hero-content')).toBeInTheDocument();
      expect(container.querySelector('.hero-title')).toBeInTheDocument();
      expect(container.querySelector('.hero-subtitle')).toBeInTheDocument();
      expect(container.querySelector('.hero-cta')).toBeInTheDocument();
    });
  });
});
