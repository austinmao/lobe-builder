/**
 * CTASection Component Tests
 *
 * Test coverage:
 * - Happy path: Render with primary and secondary buttons
 * - Happy path: Render with primary button only
 * - Edge cases: Render without description
 * - Edge cases: Render without secondary button
 * - Accessibility: Keyboard navigation and focus indicators
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { CTASection } from '../CTASection';

describe('CTASection', () => {
  describe('Happy Path: Render with primary and secondary buttons', () => {
    it('should render heading, description, and both buttons when all props are provided', () => {
      render(
        <CTASection
          heading="Ready to Get Started?"
          description="Join thousands of satisfied customers today."
          primaryButton={{ label: 'Sign Up Now', href: 'https://example.com/signup' }}
          secondaryButton={{ label: 'Learn More', href: 'https://example.com/learn' }}
        />,
      );

      // Verify heading is rendered
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Ready to Get Started?');

      // Verify description is rendered
      expect(screen.getByText('Join thousands of satisfied customers today.')).toBeInTheDocument();

      // Verify primary button is rendered
      expect(screen.getByRole('button', { name: 'Sign Up Now' })).toBeInTheDocument();

      // Verify secondary button is rendered
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
    });

    it('should navigate to primaryButton href when primary button is clicked', async () => {
      const user = userEvent.setup();
      const originalLocation = window.location.href;

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: originalLocation } as any;

      render(
        <CTASection
          heading="Get Started"
          primaryButton={{ label: 'Sign Up', href: 'https://example.com/signup' }}
        />,
      );

      const primaryButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(primaryButton);

      expect(window.location.href).toBe('https://example.com/signup');
    });

    it('should navigate to secondaryButton href when secondary button is clicked', async () => {
      const user = userEvent.setup();
      const originalLocation = window.location.href;

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: originalLocation } as any;

      render(
        <CTASection
          heading="Get Started"
          primaryButton={{ label: 'Sign Up', href: 'https://example.com/signup' }}
          secondaryButton={{ label: 'Learn More', href: 'https://example.com/learn' }}
        />,
      );

      const secondaryButton = screen.getByRole('button', { name: 'Learn More' });
      await user.click(secondaryButton);

      expect(window.location.href).toBe('https://example.com/learn');
    });
  });

  describe('Happy Path: Render with primary button only', () => {
    it('should render heading and primary button without description and secondary button', () => {
      render(
        <CTASection
          heading="Start Your Journey"
          primaryButton={{ label: 'Get Started', href: '/start' }}
        />,
      );

      // Verify heading is rendered
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Start Your Journey');

      // Verify primary button is rendered
      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();

      // Verify description is NOT rendered
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();

      // Verify secondary button is NOT rendered (only one button)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });
  });

  describe('Edge Cases: Render without description', () => {
    it('should not render description when description is undefined', () => {
      render(
        <CTASection
          heading="Join Us"
          primaryButton={{ label: 'Sign Up', href: '/signup' }}
          secondaryButton={{ label: 'Contact', href: '/contact' }}
        />,
      );

      // Verify heading is rendered
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Join Us');

      // Verify both buttons are rendered
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Contact' })).toBeInTheDocument();

      // Verify description is NOT rendered
      const { container } = render(
        <CTASection heading="Join Us" primaryButton={{ label: 'Sign Up', href: '/signup' }} />,
      );
      expect(container.querySelector('.cta-description')).not.toBeInTheDocument();
    });

    it('should not render description when description is empty string', () => {
      render(
        <CTASection
          heading="Join Us"
          description=""
          primaryButton={{ label: 'Sign Up', href: '/signup' }}
        />,
      );

      // Verify description is NOT rendered
      const { container } = render(
        <CTASection
          heading="Join Us"
          description=""
          primaryButton={{ label: 'Sign Up', href: '/signup' }}
        />,
      );
      expect(container.querySelector('.cta-description')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases: Render without secondary button', () => {
    it('should not render secondary button when secondaryButton is undefined', () => {
      render(
        <CTASection
          heading="Get Started Today"
          description="Start your free trial now."
          primaryButton={{ label: 'Start Free Trial', href: '/trial' }}
        />,
      );

      // Verify primary button is rendered
      expect(screen.getByRole('button', { name: 'Start Free Trial' })).toBeInTheDocument();

      // Verify only one button exists
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    it('should render with long heading text without breaking layout', () => {
      const longHeading =
        'This is a very long CTA heading that should wrap correctly across multiple lines without breaking the layout';

      render(
        <CTASection
          heading={longHeading}
          primaryButton={{ label: 'Click Here', href: '/click' }}
        />,
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(longHeading);
      expect(heading).toBeInTheDocument();
    });

    it('should render with long description text without breaking layout', () => {
      const longDescription =
        'This is a very long description that should wrap correctly across multiple lines without breaking the layout or causing horizontal overflow issues. It should maintain proper readability and spacing even when containing a significant amount of text content.';

      render(
        <CTASection
          heading="Heading"
          description={longDescription}
          primaryButton={{ label: 'Action', href: '/action' }}
        />,
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe('Accessibility: Keyboard navigation and focus indicators', () => {
    it('should have accessible heading hierarchy (h2)', () => {
      render(
        <CTASection
          heading="Accessible CTA"
          primaryButton={{ label: 'Action', href: '/action' }}
        />,
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('should support keyboard navigation on primary button', async () => {
      const user = userEvent.setup();

      render(<CTASection heading="CTA" primaryButton={{ label: 'Primary', href: '/primary' }} />);

      const primaryButton = screen.getByRole('button', { name: 'Primary' });

      // Tab to the button
      await user.tab();
      expect(primaryButton).toHaveFocus();
    });

    it('should support keyboard navigation on both buttons', async () => {
      const user = userEvent.setup();

      render(
        <CTASection
          heading="CTA"
          primaryButton={{ label: 'Primary', href: '/primary' }}
          secondaryButton={{ label: 'Secondary', href: '/secondary' }}
        />,
      );

      const primaryButton = screen.getByRole('button', { name: 'Primary' });
      const secondaryButton = screen.getByRole('button', { name: 'Secondary' });

      // Tab to first button
      await user.tab();
      expect(primaryButton).toHaveFocus();

      // Tab to second button
      await user.tab();
      expect(secondaryButton).toHaveFocus();
    });

    it('should trigger navigation on Enter key press for primary button', async () => {
      const user = userEvent.setup();
      const originalLocation = window.location.href;

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: originalLocation } as any;

      render(<CTASection heading="CTA" primaryButton={{ label: 'Primary', href: '/primary' }} />);

      const primaryButton = screen.getByRole('button', { name: 'Primary' });
      await user.tab();
      await user.keyboard('{Enter}');

      expect(window.location.href).toBe('/primary');
    });

    it('should trigger navigation on Enter key press for secondary button', async () => {
      const user = userEvent.setup();
      const originalLocation = window.location.href;

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: originalLocation } as any;

      render(
        <CTASection
          heading="CTA"
          primaryButton={{ label: 'Primary', href: '/primary' }}
          secondaryButton={{ label: 'Secondary', href: '/secondary' }}
        />,
      );

      await user.tab(); // Focus primary
      await user.tab(); // Focus secondary
      await user.keyboard('{Enter}');

      expect(window.location.href).toBe('/secondary');
    });

    it('should have semantic section element', () => {
      const { container } = render(
        <CTASection heading="CTA" primaryButton={{ label: 'Action', href: '/action' }} />,
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('cta-section');
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with correct base classes for responsive styling', () => {
      const { container } = render(
        <CTASection
          heading="CTA"
          description="Description"
          primaryButton={{ label: 'Primary', href: '/primary' }}
          secondaryButton={{ label: 'Secondary', href: '/secondary' }}
        />,
      );

      // Verify core elements have expected classes
      expect(container.querySelector('.cta-section')).toBeInTheDocument();
      expect(container.querySelector('.cta-content')).toBeInTheDocument();
      expect(container.querySelector('.cta-heading')).toBeInTheDocument();
      expect(container.querySelector('.cta-description')).toBeInTheDocument();
      expect(container.querySelector('.cta-buttons')).toBeInTheDocument();
      expect(container.querySelector('.cta-button-primary')).toBeInTheDocument();
      expect(container.querySelector('.cta-button-secondary')).toBeInTheDocument();
    });
  });
});
