/**
 * Header Component
 *
 * Hero section with title, subtitle, and intention.
 */
'use client';

interface HeaderProps {
  onExportClick: () => void;
  onPrintClick: () => void;
  onStartClick: () => void;
}

export function Header({ onStartClick, onExportClick, onPrintClick }: HeaderProps) {
  return (
    <header
      style={{
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          color: 'var(--ceremonia-charcoal)',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          margin: '0 0 8px 0',
        }}
      >
        Ceremonia Alumni Year Reflection
      </h1>
      <p
        style={{
          color: 'var(--ceremonia-cielo-blue)',
          fontSize: 'clamp(18px, 3vw, 24px)',
          fontWeight: 600,
          letterSpacing: '0.1em',
          margin: '0 0 24px 0',
          textTransform: 'uppercase',
        }}
      >
        Transcend Together
      </p>
      <p
        style={{
          color: 'var(--ceremonia-charcoal-light)',
          fontSize: '18px',
          fontStyle: 'italic',
          margin: '0 auto 16px',
          maxWidth: '600px',
        }}
      >
        A collective pause to see clearly, release gently, and choose what&apos;s next.
      </p>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
          margin: '0 auto 32px',
          maxWidth: '500px',
        }}
      >
        Designed to be completed in under one hour. Photos first. Honesty over perfection.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={onStartClick}
          style={{
            backgroundColor: 'var(--ceremonia-cielo-blue)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
            padding: '12px 24px',
            transition: 'all 0.2s ease',
          }}
          type="button"
        >
          Start Reflection
        </button>
        <button
          onClick={onExportClick}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid var(--color-border-primary)',
            borderRadius: '8px',
            color: 'var(--ceremonia-charcoal)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
            padding: '12px 24px',
            transition: 'all 0.2s ease',
          }}
          type="button"
        >
          Export
        </button>
        <button
          onClick={onPrintClick}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid var(--color-border-primary)',
            borderRadius: '8px',
            color: 'var(--ceremonia-charcoal)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
            padding: '12px 24px',
            transition: 'all 0.2s ease',
          }}
          type="button"
        >
          Print / PDF
        </button>
      </div>
    </header>
  );
}
