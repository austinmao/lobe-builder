interface FeatureItem {
  title: string;
  description?: string | null;
  icon?: string | null;
  id?: string;
}

interface FeaturesBlock {
  blockType: 'features';
  id?: string;
  heading?: string | null;
  items: FeatureItem[];
}

interface FeaturesSectionProps {
  block: FeaturesBlock;
}

export function FeaturesSection({ block }: FeaturesSectionProps) {
  const { heading, items } = block;

  return (
    <section className="features-section" style={{ padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {heading && (
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '3rem',
              textAlign: 'center',
            }}
          >
            {heading}
          </h2>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {items.map((item, index) => (
            <div key={item.id || index} style={{ padding: '1.5rem' }}>
              {item.icon && (
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
              )}
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {item.title}
              </h3>
              {item.description && (
                <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.6' }}>
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
