/**
 * ImportanceSection Component
 *
 * Zoom Out section with Corazón Rose accent.
 */
'use client';

import type { ImportanceSection as ImportanceData } from '../types';

/**
 * ImportanceSection Component
 *
 * Zoom Out section with Corazón Rose accent.
 */

interface ImportanceSectionProps {
  data: ImportanceData;
  onUpdate: (field: keyof ImportanceData, value: string) => void;
}

export function ImportanceSection({ data, onUpdate }: ImportanceSectionProps) {
  return (
    <section
      id="section-importance"
      style={{
        backgroundColor: 'white',
        border: '1px solid var(--color-border-primary)',
        borderLeft: '4px solid var(--ceremonia-corazon-rose)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        margin: '0 auto 24px',
        maxWidth: '800px',
        padding: '32px',
      }}
    >
      <h2
        style={{
          color: 'var(--ceremonia-corazon-rose)',
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 12px 0',
        }}
      >
        Zoom Out: Importance
      </h2>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}
      >
        When something feels heavy or defining, it often creates resistance. This step is about
        softening — not giving up.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label
            htmlFor="importance-meanTooMuch"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            I made this mean too much
          </label>
          <textarea
            id="importance-meanTooMuch"
            onChange={(e) => onUpdate('meanTooMuch', e.target.value)}
            placeholder="What outcome, achievement, or validation did you over-attach to?"
            rows={3}
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              resize: 'vertical',
              width: '100%',
            }}
            value={data.meanTooMuch}
          />
        </div>

        <div>
          <label
            htmlFor="importance-withoutIt"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            I believed I wouldn&apos;t be okay without it
          </label>
          <textarea
            id="importance-withoutIt"
            onChange={(e) => onUpdate('withoutIt', e.target.value)}
            placeholder="What did you think you needed to be happy, worthy, or safe?"
            rows={3}
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              resize: 'vertical',
              width: '100%',
            }}
            value={data.withoutIt}
          />
        </div>

        <div>
          <label
            htmlFor="importance-reactedBy"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            When it felt threatened, I reacted by
          </label>
          <textarea
            id="importance-reactedBy"
            onChange={(e) => onUpdate('reactedBy', e.target.value)}
            placeholder="Controlling, withdrawing, overworking, pleasing..."
            rows={3}
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              resize: 'vertical',
              width: '100%',
            }}
            value={data.reactedBy}
          />
        </div>

        <div>
          <label
            htmlFor="importance-reframe"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            Gentler reframe (with trust)
          </label>
          <textarea
            id="importance-reframe"
            onChange={(e) => onUpdate('reframe', e.target.value)}
            placeholder="How might you hold this more lightly? What's still true even without it?"
            rows={4}
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              resize: 'vertical',
              width: '100%',
            }}
            value={data.reframe}
          />
        </div>
      </div>
    </section>
  );
}
