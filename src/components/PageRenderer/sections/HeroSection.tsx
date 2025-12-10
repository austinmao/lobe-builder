/**
 * HeroSection Component
 *
 * A responsive hero section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a hero section with title, subtitle, and CTA button.
 *
 * Features:
 * - Responsive layout (mobile-first)
 * - Optional background image
 * - Theme CSS variables for colors and typography
 * - Accessible markup and keyboard navigation
 */

'use client';

import { Button } from 'react-aria-components';

/**
 * HeroSection Component
 *
 * A responsive hero section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a hero section with title, subtitle, and CTA button.
 *
 * Features:
 * - Responsive layout (mobile-first)
 * - Optional background image
 * - Theme CSS variables for colors and typography
 * - Accessible markup and keyboard navigation
 */

/**
 * HeroSection Component
 *
 * A responsive hero section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a hero section with title, subtitle, and CTA button.
 *
 * Features:
 * - Responsive layout (mobile-first)
 * - Optional background image
 * - Theme CSS variables for colors and typography
 * - Accessible markup and keyboard navigation
 */

interface HeroSectionProps {
  backgroundImage?: string;
  ctaHref?: string;
  ctaLabel?: string;
  subtitle?: string;
  title: string;
}

export function HeroSection({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  backgroundImage,
}: HeroSectionProps) {
  const handleCtaClick = () => {
    if (ctaHref) {
      window.location.href = ctaHref;
    }
  };

  return (
    <section
      className="hero-section"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {ctaLabel && (
          <Button className="hero-cta" onPress={handleCtaClick}>
            {ctaLabel}
          </Button>
        )}
      </div>

      <style jsx>{`
        .hero-section {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          padding: 48px 24px;
          background-color: var(--color-bg-primary);
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 768px;
          gap: 24px;
        }

        .hero-title {
          margin: 0;
          font-size: 36px;
          font-weight: 700;
          line-height: 1.2;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          margin: 0;
          font-size: 18px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          max-width: 600px;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background-color: var(--color-brand-500);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          box-shadow: var(--shadow-sm);
        }

        .hero-cta:hover {
          background-color: var(--color-brand-600);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .hero-cta:active {
          transform: translateY(0);
          box-shadow: var(--shadow-sm);
        }

        .hero-cta:focus-visible {
          outline: 2px solid var(--color-brand-500);
          outline-offset: 2px;
        }

        /* Tablet and up */
        @media (min-width: 768px) {
          .hero-section {
            min-height: 600px;
            padding: 64px 32px;
          }

          .hero-title {
            font-size: 48px;
          }

          .hero-subtitle {
            font-size: 20px;
          }

          .hero-cta {
            padding: 14px 28px;
            font-size: 18px;
          }
        }

        /* Desktop and up */
        @media (min-width: 1024px) {
          .hero-section {
            min-height: 700px;
            padding: 80px 48px;
          }

          .hero-title {
            font-size: 56px;
          }

          .hero-subtitle {
            font-size: 22px;
          }
        }
      `}</style>
    </section>
  );
}
