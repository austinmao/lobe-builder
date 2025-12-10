/**
 * CTASection Component
 *
 * A responsive call-to-action section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a CTA section with heading, description, and buttons.
 *
 * Features:
 * - Responsive layout (mobile-first)
 * - Primary and optional secondary buttons
 * - Theme CSS variables for colors and typography
 * - Accessible markup and keyboard navigation
 */

'use client';

import { Button } from 'react-aria-components';

/**
 * CTASection Component
 *
 * A responsive call-to-action section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a CTA section with heading, description, and buttons.
 *
 * Features:
 * - Responsive layout (mobile-first)
 * - Primary and optional secondary buttons
 * - Theme CSS variables for colors and typography
 * - Accessible markup and keyboard navigation
 */

interface CTASectionProps {
  description?: string;
  heading: string;
  primaryButton: {
    href: string;
    label: string;
  };
  secondaryButton?: {
    href: string;
    label: string;
  };
}

export function CTASection({
  heading,
  description,
  primaryButton,
  secondaryButton,
}: CTASectionProps) {
  const handlePrimaryClick = () => {
    if (primaryButton.href) {
      window.location.href = primaryButton.href;
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryButton?.href) {
      window.location.href = secondaryButton.href;
    }
  };

  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-heading">{heading}</h2>
        {description && <p className="cta-description">{description}</p>}

        <div className="cta-buttons">
          <Button className="cta-button cta-button-primary" onPress={handlePrimaryClick}>
            {primaryButton.label}
          </Button>

          {secondaryButton && (
            <Button className="cta-button cta-button-secondary" onPress={handleSecondaryClick}>
              {secondaryButton.label}
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        .cta-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          background-color: var(--color-bg-secondary);
        }

        .cta-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 768px;
          gap: 24px;
        }

        .cta-heading {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
        }

        .cta-description {
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          max-width: 600px;
        }

        .cta-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          border: none;
        }

        .cta-button-primary {
          color: white;
          background-color: var(--color-brand-500);
          box-shadow: var(--shadow-sm);
        }

        .cta-button-primary:hover {
          background-color: var(--color-brand-600);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .cta-button-primary:active {
          transform: translateY(0);
          box-shadow: var(--shadow-sm);
        }

        .cta-button-primary:focus-visible {
          outline: 2px solid var(--color-brand-500);
          outline-offset: 2px;
        }

        .cta-button-secondary {
          color: var(--color-text-primary);
          background-color: transparent;
          border: 2px solid var(--color-border-primary);
        }

        .cta-button-secondary:hover {
          background-color: var(--color-bg-tertiary);
          border-color: var(--color-border-secondary);
          transform: translateY(-1px);
        }

        .cta-button-secondary:active {
          transform: translateY(0);
        }

        .cta-button-secondary:focus-visible {
          outline: 2px solid var(--color-brand-500);
          outline-offset: 2px;
        }

        /* Tablet and up */
        @media (min-width: 768px) {
          .cta-section {
            padding: 64px 32px;
          }

          .cta-heading {
            font-size: 40px;
          }

          .cta-description {
            font-size: 18px;
          }

          .cta-buttons {
            flex-direction: row;
            gap: 16px;
            width: auto;
          }

          .cta-button {
            padding: 14px 28px;
            font-size: 18px;
          }
        }

        /* Desktop and up */
        @media (min-width: 1024px) {
          .cta-section {
            padding: 80px 48px;
          }

          .cta-heading {
            font-size: 48px;
          }

          .cta-description {
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
