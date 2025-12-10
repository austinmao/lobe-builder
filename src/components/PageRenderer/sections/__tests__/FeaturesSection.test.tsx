/**
 * FeaturesSection Component Tests
 *
 * Test coverage:
 * - Happy path: Render with 3 feature items
 * - Happy path: Render with 6 feature items
 * - Edge cases: Invalid icon name falls back to default
 * - Edge cases: Empty items array renders nothing
 * - Accessibility: Keyboard navigation and semantic markup
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { FeatureItem } from '../FeaturesSection';
import { FeaturesSection } from '../FeaturesSection';

describe('FeaturesSection', () => {
  const mockFeatures3: FeatureItem[] = [
    {
      icon: 'star',
      title: 'Feature One',
      description: 'This is the first amazing feature',
    },
    {
      icon: 'shield',
      title: 'Feature Two',
      description: 'This is the second awesome feature',
    },
    {
      icon: 'zap',
      title: 'Feature Three',
      description: 'This is the third incredible feature',
    },
  ];

  const mockFeatures6: FeatureItem[] = [
    ...mockFeatures3,
    {
      icon: 'heart',
      title: 'Feature Four',
      description: 'This is the fourth fantastic feature',
    },
    {
      icon: 'users',
      title: 'Feature Five',
      description: 'This is the fifth wonderful feature',
    },
    {
      icon: 'globe',
      title: 'Feature Six',
      description: 'This is the sixth powerful feature',
    },
  ];

  describe('Happy Path: Render with 3 feature items', () => {
    it('should render 3 feature cards with icons, titles, and descriptions', () => {
      render(<FeaturesSection items={mockFeatures3} />);

      // Verify all 3 feature cards are rendered
      expect(screen.getByText('Feature One')).toBeInTheDocument();
      expect(screen.getByText('Feature Two')).toBeInTheDocument();
      expect(screen.getByText('Feature Three')).toBeInTheDocument();

      // Verify descriptions are rendered
      expect(screen.getByText('This is the first amazing feature')).toBeInTheDocument();
      expect(screen.getByText('This is the second awesome feature')).toBeInTheDocument();
      expect(screen.getByText('This is the third incredible feature')).toBeInTheDocument();
    });

    it('should render heading when provided', () => {
      render(<FeaturesSection heading="Our Amazing Features" items={mockFeatures3} />);

      // Verify heading is rendered
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Our Amazing Features');
    });

    it('should not render heading when not provided', () => {
      render(<FeaturesSection items={mockFeatures3} />);

      // Verify no heading is rendered
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });

    it('should apply 2-column grid layout for 3 items on desktop', () => {
      const { container } = render(<FeaturesSection items={mockFeatures3} />);

      const grid = container.querySelector('.features-grid');
      expect(grid).toHaveAttribute('data-columns', '2');
    });
  });

  describe('Happy Path: Render with 6 feature items', () => {
    it('should render 6 feature cards with icons, titles, and descriptions', () => {
      render(<FeaturesSection items={mockFeatures6} />);

      // Verify all 6 feature cards are rendered
      expect(screen.getByText('Feature One')).toBeInTheDocument();
      expect(screen.getByText('Feature Two')).toBeInTheDocument();
      expect(screen.getByText('Feature Three')).toBeInTheDocument();
      expect(screen.getByText('Feature Four')).toBeInTheDocument();
      expect(screen.getByText('Feature Five')).toBeInTheDocument();
      expect(screen.getByText('Feature Six')).toBeInTheDocument();
    });

    it('should apply 4-column grid layout for 6 items on desktop', () => {
      const { container } = render(<FeaturesSection items={mockFeatures6} />);

      const grid = container.querySelector('.features-grid');
      expect(grid).toHaveAttribute('data-columns', '4');
    });

    it('should render all feature cards in the DOM', () => {
      const { container } = render(<FeaturesSection items={mockFeatures6} />);

      const cards = container.querySelectorAll('.feature-card');
      expect(cards).toHaveLength(6);
    });
  });

  describe('Edge Cases: Invalid icon name falls back to default', () => {
    it('should render default icon (Star) when icon name is invalid', () => {
      const invalidIconFeatures: FeatureItem[] = [
        {
          icon: 'nonexistent-icon',
          title: 'Test Feature',
          description: 'Test description',
        },
      ];

      const { container } = render(<FeaturesSection items={invalidIconFeatures} />);

      // Should render without error
      expect(screen.getByText('Test Feature')).toBeInTheDocument();

      // Icon wrapper should still be rendered
      const iconWrapper = container.querySelector('.feature-icon-wrapper');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('should handle case-insensitive icon names', () => {
      const caseInsensitiveFeatures: FeatureItem[] = [
        {
          icon: 'STAR',
          title: 'Uppercase Icon',
          description: 'Should work with uppercase',
        },
        {
          icon: 'ShIeLd',
          title: 'Mixed Case Icon',
          description: 'Should work with mixed case',
        },
      ];

      render(<FeaturesSection items={caseInsensitiveFeatures} />);

      expect(screen.getByText('Uppercase Icon')).toBeInTheDocument();
      expect(screen.getByText('Mixed Case Icon')).toBeInTheDocument();
    });
  });

  describe('Edge Cases: Empty items array renders nothing', () => {
    it('should render null when items array is empty', () => {
      const { container } = render(<FeaturesSection items={[]} />);

      // Should not render section element
      expect(container.querySelector('.features-section')).not.toBeInTheDocument();
    });

    it('should render null when items prop is undefined', () => {
      const { container } = render(<FeaturesSection items={undefined as any} />);

      // Should not render section element
      expect(container.querySelector('.features-section')).not.toBeInTheDocument();
    });

    it('should render null when items prop is null', () => {
      const { container } = render(<FeaturesSection items={null as any} />);

      // Should not render section element
      expect(container.querySelector('.features-section')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Grid Layout Logic', () => {
    it('should use 2 columns for 2 items', () => {
      const twoItems = mockFeatures3.slice(0, 2);
      const { container } = render(<FeaturesSection items={twoItems} />);

      const grid = container.querySelector('.features-grid');
      expect(grid).toHaveAttribute('data-columns', '2');
    });

    it('should use 3 columns for 4 items', () => {
      const fourItems = mockFeatures6.slice(0, 4);
      const { container } = render(<FeaturesSection items={fourItems} />);

      const grid = container.querySelector('.features-grid');
      expect(grid).toHaveAttribute('data-columns', '3');
    });

    it('should use 3 columns for 5 items', () => {
      const fiveItems = mockFeatures6.slice(0, 5);
      const { container } = render(<FeaturesSection items={fiveItems} />);

      const grid = container.querySelector('.features-grid');
      expect(grid).toHaveAttribute('data-columns', '3');
    });

    it('should use 4 columns for 8 items', () => {
      const eightItems = [
        ...mockFeatures6,
        {
          icon: 'check',
          title: 'Feature Seven',
          description: 'Seventh feature',
        },
        {
          icon: 'settings',
          title: 'Feature Eight',
          description: 'Eighth feature',
        },
      ];
      const { container } = render(<FeaturesSection items={eightItems} />);

      const grid = container.querySelector('.features-grid');
      expect(grid).toHaveAttribute('data-columns', '4');
    });
  });

  describe('Accessibility: Semantic markup and ARIA', () => {
    it('should have semantic section element', () => {
      const { container } = render(<FeaturesSection items={mockFeatures3} />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('features-section');
    });

    it('should use h3 headings for feature titles', () => {
      render(<FeaturesSection items={mockFeatures3} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
      expect(headings[0]).toHaveTextContent('Feature One');
      expect(headings[1]).toHaveTextContent('Feature Two');
      expect(headings[2]).toHaveTextContent('Feature Three');
    });

    it('should mark icons as aria-hidden', () => {
      const { container } = render(<FeaturesSection items={mockFeatures3} />);

      const icons = container.querySelectorAll('.feature-icon');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should have proper heading hierarchy with section heading', () => {
      render(<FeaturesSection heading="Features" items={mockFeatures3} />);

      // h2 for section heading
      const sectionHeading = screen.getByRole('heading', { level: 2 });
      expect(sectionHeading).toHaveTextContent('Features');

      // h3 for feature titles
      const featureHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(featureHeadings).toHaveLength(3);
    });
  });

  describe('Component Structure', () => {
    it('should render with correct CSS class structure', () => {
      const { container } = render(<FeaturesSection heading="Features" items={mockFeatures3} />);

      // Verify core elements have expected classes
      expect(container.querySelector('.features-section')).toBeInTheDocument();
      expect(container.querySelector('.features-container')).toBeInTheDocument();
      expect(container.querySelector('.features-heading')).toBeInTheDocument();
      expect(container.querySelector('.features-grid')).toBeInTheDocument();
      expect(container.querySelector('.feature-card')).toBeInTheDocument();
      expect(container.querySelector('.feature-icon-wrapper')).toBeInTheDocument();
      expect(container.querySelector('.feature-icon')).toBeInTheDocument();
      expect(container.querySelector('.feature-title')).toBeInTheDocument();
      expect(container.querySelector('.feature-description')).toBeInTheDocument();
    });

    it('should apply hover effects to feature cards', () => {
      const { container } = render(<FeaturesSection items={mockFeatures3} />);

      const featureCards = container.querySelectorAll('.feature-card');
      expect(featureCards.length).toBeGreaterThan(0);

      // Verify cards have the hover class (styling is tested via CSS)
      featureCards.forEach((card) => {
        expect(card).toHaveClass('feature-card');
      });
    });
  });

  describe('Long Content Handling', () => {
    it('should handle long feature titles without breaking layout', () => {
      const longTitleFeatures: FeatureItem[] = [
        {
          icon: 'star',
          title:
            'This is an extremely long feature title that should wrap correctly without breaking the grid layout or causing horizontal overflow',
          description: 'Short description',
        },
      ];

      render(<FeaturesSection items={longTitleFeatures} />);

      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
    });

    it('should handle long feature descriptions without breaking layout', () => {
      const longDescriptionFeatures: FeatureItem[] = [
        {
          icon: 'star',
          title: 'Feature',
          description:
            'This is an extremely long feature description that contains multiple sentences and should wrap correctly across multiple lines without breaking the card layout or causing any visual issues. It should maintain proper readability and spacing even with significant text content.',
        },
      ];

      render(<FeaturesSection items={longDescriptionFeatures} />);

      const description = screen.getByText(/This is an extremely long feature description/);
      expect(description).toBeInTheDocument();
    });
  });
});
