/**
 * HowToUse Component
 *
 * Collapsible instructions section.
 */
'use client';

import { useState } from 'react';

/**
 * HowToUse Component
 *
 * Collapsible instructions section.
 */

export function HowToUse() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      style={{
        margin: '0 auto 48px',
        maxWidth: '800px',
        padding: '0 24px',
      }}
    >
      <button
        aria-controls="how-to-use-content"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          alignItems: 'center',
          backgroundColor: 'white',
          border: '1px solid var(--color-border-primary)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          display: 'flex',
          fontSize: '16px',
          fontWeight: 600,
          gap: '12px',
          justifyContent: 'space-between',
          padding: '16px 20px',
          textAlign: 'left',
          transition: 'all 0.2s ease',
          width: '100%',
        }}
        type="button"
      >
        <span>How to Use This Reflection</span>
        <span
          style={{
            fontSize: '20px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          id="how-to-use-content"
          style={{
            backgroundColor: 'white',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '12px',
            borderTop: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            marginTop: '-1px',
            padding: '24px',
          }}
        >
          <p
            style={{
              color: 'var(--ceremonia-charcoal-light)',
              fontStyle: 'italic',
              lineHeight: 1.7,
              marginBottom: '20px',
            }}
          >
            This reflection is not about fixing yourself or optimizing your life. It&apos;s about
            noticing your inner state and remembering that you always have choice.
          </p>

          <p
            style={{
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            Before you begin, gather:
          </p>

          <ul
            style={{
              color: 'var(--ceremonia-charcoal-light)',
              lineHeight: 1.8,
              marginBottom: '20px',
              paddingLeft: '24px',
            }}
          >
            <li>Your photo library from the past year</li>
            <li>Any journals or notes you&apos;ve kept</li>
            <li>A quiet place with at least 45 minutes</li>
          </ul>

          <p
            style={{
              backgroundColor: 'var(--ceremonia-bg)',
              borderLeft: '4px solid var(--ceremonia-cielo-blue)',
              color: 'var(--ceremonia-charcoal)',
              fontWeight: 600,
              padding: '16px',
            }}
          >
            Photos first. Memory second. Interpretation last.
          </p>
        </div>
      )}
    </section>
  );
}
