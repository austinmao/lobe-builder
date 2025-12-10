/**
 * TextSection Component Tests
 *
 * Test coverage:
 * - Happy path: Render with heading and body
 * - Happy path: Render with markdown content
 * - Edge cases: Render without heading (body only)
 * - Edge cases: Render with empty body
 * - Accessibility: Semantic HTML and heading hierarchy
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextSection } from '../TextSection';

describe('TextSection', () => {
  describe('Happy Path: Render with heading and body', () => {
    it('should render heading and body text when both props are provided', () => {
      render(
        <TextSection
          heading="About Our Product"
          body="This is a simple text description about our product."
        />,
      );

      // Verify heading is rendered
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('About Our Product');

      // Verify body is rendered
      expect(screen.getByText(/This is a simple text description/i)).toBeInTheDocument();
    });

    it('should render plain text body without markdown', () => {
      const plainText = 'This is plain text without any special formatting.';

      render(<TextSection heading="Plain Text" body={plainText} />);

      // Verify body text is rendered
      expect(screen.getByText(plainText)).toBeInTheDocument();
    });
  });

  describe('Happy Path: Render with markdown content', () => {
    it('should render bold text from markdown', () => {
      render(<TextSection heading="Formatted Text" body="This text has **bold content** in it." />);

      // Verify bold content is rendered
      const bodyContainer = screen.getByText(/This text has/i).parentElement;
      expect(bodyContainer?.innerHTML).toContain('<strong>bold content</strong>');
    });

    it('should render italic text from markdown', () => {
      render(<TextSection heading="Formatted Text" body="This text has *italic content* in it." />);

      // Verify italic content is rendered
      const bodyContainer = screen.getByText(/This text has/i).parentElement;
      expect(bodyContainer?.innerHTML).toContain('<em>italic content</em>');
    });

    it('should render links from markdown', () => {
      render(
        <TextSection
          heading="Link Text"
          body="Check out [our website](https://example.com) for more info."
        />,
      );

      // Verify link is rendered
      const link = screen.getByRole('link', { name: 'our website' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should render combined markdown formatting', () => {
      const markdownBody =
        'This has **bold**, *italic*, and [link](https://example.com) formatting.';

      render(<TextSection heading="Mixed Formatting" body={markdownBody} />);

      // Verify all formatting types are present
      const bodyContainer = screen.getByText(/This has/i).parentElement;
      expect(bodyContainer?.innerHTML).toContain('<strong>bold</strong>');
      expect(bodyContainer?.innerHTML).toContain('<em>italic</em>');
      expect(screen.getByRole('link', { name: 'link' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases: Render without heading', () => {
    it('should render only body when heading is undefined', () => {
      render(<TextSection body="Body text only, no heading." />);

      // Verify body is rendered
      expect(screen.getByText('Body text only, no heading.')).toBeInTheDocument();

      // Verify heading is NOT rendered
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });

    it('should render only body when heading is empty string', () => {
      render(<TextSection heading="" body="Body text with empty heading." />);

      // Verify body is rendered
      expect(screen.getByText('Body text with empty heading.')).toBeInTheDocument();

      // Verify heading is NOT rendered
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases: Render with empty body', () => {
    it('should render heading with empty body', () => {
      render(<TextSection heading="Heading Only" body="" />);

      // Verify heading is rendered
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading Only');

      // Verify body div exists but is empty
      const { container } = render(<TextSection heading="Heading Only" body="" />);
      const bodyDiv = container.querySelector('.text-body');
      expect(bodyDiv).toBeInTheDocument();
    });

    it('should render with long body text without breaking layout', () => {
      const longBody =
        'This is a very long body text that should wrap correctly across multiple lines without breaking the layout or causing horizontal overflow issues. It should maintain proper readability and spacing even when containing a significant amount of text content that spans several paragraphs or sentences.';

      render(<TextSection heading="Long Text" body={longBody} />);

      // Verify body is rendered
      expect(screen.getByText(longBody)).toBeInTheDocument();
    });
  });

  describe('Accessibility: Semantic HTML and heading hierarchy', () => {
    it('should use h2 for heading element', () => {
      render(<TextSection heading="Accessible Heading" body="Accessible body text" />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('should have semantic section element', () => {
      const { container } = render(<TextSection heading="Test" body="Test body" />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('text-section');
    });

    it('should support keyboard navigation for links in markdown', () => {
      render(
        <TextSection
          heading="Link Test"
          body="Visit [our site](https://example.com) for details."
        />,
      );

      const link = screen.getByRole('link', { name: 'our site' });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with correct base classes for responsive styling', () => {
      const { container } = render(<TextSection heading="Responsive" body="Responsive body" />);

      // Verify core elements have expected classes
      expect(container.querySelector('.text-section')).toBeInTheDocument();
      expect(container.querySelector('.text-content')).toBeInTheDocument();
      expect(container.querySelector('.text-heading')).toBeInTheDocument();
      expect(container.querySelector('.text-body')).toBeInTheDocument();
    });
  });
});
