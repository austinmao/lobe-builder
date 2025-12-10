/**
 * TextSection Component
 *
 * A responsive text section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a text section with heading and body content.
 *
 * Features:
 * - Responsive layout (mobile-first)
 * - Basic markdown support in body text (bold, italic, links)
 * - Theme CSS variables for colors and typography
 * - Accessible markup
 */

'use client';

import { useMemo } from 'react';

/**
 * TextSection Component
 *
 * A responsive text section component for the page builder using Untitled UI design patterns.
 * Receives props from Payload block data and renders a text section with heading and body content.
 *
 * Features:
 * - Responsive layout (mobile-first)
 * - Basic markdown support in body text (bold, italic, links)
 * - Theme CSS variables for colors and typography
 * - Accessible markup
 */

interface TextSectionProps {
  body: string; // Plain text or markdown
  heading?: string;
}

export function TextSection({ heading, body }: TextSectionProps) {
  // Simple markdown parsing for basic formatting
  const htmlContent = useMemo(() => {
    if (!body) return '';

    let html = body;

    // Convert **bold** to <strong>
    html = html.replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    html = html.replaceAll(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert [text](url) to <a href="url">text</a>
    html = html.replaceAll(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return html;
  }, [body]);

  return (
    <section className="text-section">
      <div className="text-content">
        {heading && <h2 className="text-heading">{heading}</h2>}
        <div className="text-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>

      <style jsx>{`
        .text-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          background-color: var(--color-bg-primary);
        }

        .text-content {
          display: flex;
          flex-direction: column;
          max-width: 768px;
          gap: 16px;
        }

        .text-heading {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.3;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
        }

        .text-body {
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          white-space: pre-wrap;
        }

        .text-body :global(strong) {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .text-body :global(em) {
          font-style: italic;
        }

        .text-body :global(a) {
          color: var(--color-brand-500);
          text-decoration: none;
          transition: color 0.2s ease-in-out;
        }

        .text-body :global(a:hover) {
          color: var(--color-brand-600);
          text-decoration: underline;
        }

        .text-body :global(a:focus-visible) {
          outline: 2px solid var(--color-brand-500);
          outline-offset: 2px;
          border-radius: 2px;
        }

        /* Tablet and up */
        @media (min-width: 768px) {
          .text-section {
            padding: 64px 32px;
          }

          .text-heading {
            font-size: 32px;
          }

          .text-body {
            font-size: 18px;
          }

          .text-content {
            gap: 20px;
          }
        }

        /* Desktop and up */
        @media (min-width: 1024px) {
          .text-section {
            padding: 80px 48px;
          }

          .text-heading {
            font-size: 36px;
          }

          .text-body {
            font-size: 20px;
          }

          .text-content {
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}
