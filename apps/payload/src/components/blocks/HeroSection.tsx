interface HeroBlock {
  blockType: 'hero';
  id?: string;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  backgroundImage?: any;
}

interface HeroSectionProps {
  block: HeroBlock;
}

export function HeroSection({ block }: HeroSectionProps) {
  const { title, subtitle, ctaLabel, ctaHref } = block;

  return (
    <section className="hero-section" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>{subtitle}</p>
        )}
        {ctaLabel && ctaHref && (
          <a
            href={ctaHref}
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
            {ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
