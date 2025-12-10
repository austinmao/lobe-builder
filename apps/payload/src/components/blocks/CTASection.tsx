interface CTABlock {
  blockType: 'cta';
  id?: string;
  heading: string;
  description?: string | null;
  primaryButton?: {
    label: string;
    href: string;
  } | null;
  secondaryButton?: {
    label?: string | null;
    href?: string | null;
  } | null;
}

interface CTASectionProps {
  block: CTABlock;
}

export function CTASection({ block }: CTASectionProps) {
  const { heading, description, primaryButton, secondaryButton } = block;

  return (
    <section
      className="cta-section"
      style={{
        padding: '4rem 2rem',
        backgroundColor: '#f9fafb',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{heading}</h2>
        {description && (
          <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '2rem' }}>{description}</p>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {primaryButton && (
            <a
              href={primaryButton.href}
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#000',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
              }}
            >
              {primaryButton.label}
            </a>
          )}
          {secondaryButton?.label && secondaryButton?.href && (
            <a
              href={secondaryButton.href}
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fff',
                color: '#000',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: '1px solid #ddd',
              }}
            >
              {secondaryButton.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
