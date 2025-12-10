interface TextBlock {
  blockType: 'text';
  id?: string;
  heading?: string | null;
  body: any; // Rich text field
}

interface TextSectionProps {
  block: TextBlock;
}

export function TextSection({ block }: TextSectionProps) {
  const { heading, body } = block;

  return (
    <section className="text-section" style={{ padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {heading && (
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            {heading}
          </h2>
        )}
        {/* For now, render rich text as plain object - will need proper rich text renderer */}
        <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#333' }}>
          {typeof body === 'string' ? body : JSON.stringify(body)}
        </div>
      </div>
    </section>
  );
}
