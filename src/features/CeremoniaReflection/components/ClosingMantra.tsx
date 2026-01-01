/**
 * ClosingMantra Component
 *
 * Closing section with centered mantra.
 */
'use client';

export function ClosingMantra() {
  return (
    <section
      style={{
        backgroundColor: 'white',
        border: '1px solid var(--color-border-primary)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        margin: '48px auto',
        maxWidth: '800px',
        padding: '48px 32px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          color: 'var(--ceremonia-charcoal)',
          fontSize: '20px',
          fontStyle: 'italic',
          lineHeight: 2,
          margin: 0,
          whiteSpace: 'pre-line',
        }}
      >
        {`I don't need to force the future.
I see how I've been choosing.
And I choose again — together.`}
      </p>
    </section>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border-primary)',
        marginTop: '48px',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
          margin: 0,
        }}
      >
        Ceremonia · Transcend Together
      </p>
    </footer>
  );
}
