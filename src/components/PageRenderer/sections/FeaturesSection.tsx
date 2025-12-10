/**
 * FeaturesSection Component
 *
 * A responsive features section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a grid of feature cards with icons, titles, and descriptions.
 *
 * Features:
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3-4 col desktop)
 * - Icon support via lucide-react (referenced by string name)
 * - Flexible column count based on item count (2-4 columns)
 * - Theme CSS variables for colors and typography
 * - Accessible markup
 */

'use client';

import { getIcon } from './icons';

/**
 * FeaturesSection Component
 *
 * A responsive features section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a grid of feature cards with icons, titles, and descriptions.
 *
 * Features:
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3-4 col desktop)
 * - Icon support via lucide-react (referenced by string name)
 * - Flexible column count based on item count (2-4 columns)
 * - Theme CSS variables for colors and typography
 * - Accessible markup
 */

export interface FeatureItem {
  description: string;
  icon: string; // Icon name like "star", "shield", "zap"
  title: string;
}

export interface FeaturesSectionProps {
  heading?: string;
  items: FeatureItem[];
}

// Determine grid columns based on item count
// 2-3 items: 2 columns, 4-5 items: 3 columns, 6+ items: 4 columns
const getGridColumns = (count: number): number => {
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

export function FeaturesSection({ heading, items }: FeaturesSectionProps) {
  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  const columns = getGridColumns(items.length);

  return (
    <section className="features-section">
      <div className="features-container">
        {heading && <h2 className="features-heading">{heading}</h2>}

        <div className="features-grid" data-columns={columns}>
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);

            return (
              <div className="feature-card" key={`${item.title}-${index}`}>
                <div className="feature-icon-wrapper">
                  <Icon aria-hidden="true" className="feature-icon" />
                </div>
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-description">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .features-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          background-color: var(--color-bg-primary);
        }

        .features-container {
          display: flex;
          flex-direction: column;
          max-width: 1200px;
          width: 100%;
          gap: 32px;
        }

        .features-heading {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          text-align: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          border-radius: 12px;
          transition: all 0.2s ease-in-out;
        }

        .feature-card:hover {
          background-color: var(--color-bg-tertiary);
          border-color: var(--color-border-secondary);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .feature-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background-color: var(--color-brand-50);
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .feature-icon {
          width: 24px;
          height: 24px;
          color: var(--color-brand-600);
          stroke-width: 2;
        }

        .feature-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.4;
          color: var(--color-text-primary);
        }

        .feature-description {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-secondary);
        }

        /* Tablet and up - 2 columns */
        @media (min-width: 768px) {
          .features-section {
            padding: 64px 32px;
          }

          .features-container {
            gap: 40px;
          }

          .features-heading {
            font-size: 40px;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
          }

          .feature-card {
            padding: 28px;
          }

          .feature-title {
            font-size: 20px;
          }

          .feature-description {
            font-size: 15px;
          }
        }

        /* Desktop and up - responsive columns based on item count */
        @media (min-width: 1024px) {
          .features-section {
            padding: 80px 48px;
          }

          .features-container {
            gap: 48px;
          }

          .features-heading {
            font-size: 48px;
          }

          /* 2 columns for 2-3 items */
          .features-grid[data-columns='2'] {
            grid-template-columns: repeat(2, 1fr);
          }

          /* 3 columns for 4-5 items */
          .features-grid[data-columns='3'] {
            grid-template-columns: repeat(3, 1fr);
          }

          /* 4 columns for 6+ items */
          .features-grid[data-columns='4'] {
            grid-template-columns: repeat(4, 1fr);
          }

          .feature-card {
            padding: 32px;
          }

          .feature-icon-wrapper {
            width: 56px;
            height: 56px;
          }

          .feature-icon {
            width: 28px;
            height: 28px;
          }

          .feature-title {
            font-size: 22px;
          }

          .feature-description {
            font-size: 16px;
          }
        }
      `}</style>
    </section>
  );
}
