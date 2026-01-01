/**
 * PendulumSection Component
 *
 * Zoom Out section with Cielo Blue accent.
 */
'use client';

import type { PendulumSection as PendulumData } from '../types';

/**
 * PendulumSection Component
 *
 * Zoom Out section with Cielo Blue accent.
 */

interface PendulumSectionProps {
  data: PendulumData;
  onUpdate: (field: keyof PendulumData, value: string) => void;
}

export function PendulumSection({ data, onUpdate }: PendulumSectionProps) {
  return (
    <section
      id="section-pendulums"
      style={{
        backgroundColor: 'white',
        border: '1px solid var(--color-border-primary)',
        borderLeft: '4px solid var(--ceremonia-cielo-blue)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        margin: '0 auto 24px',
        maxWidth: '800px',
        padding: '32px',
      }}
    >
      <h2
        style={{
          color: 'var(--ceremonia-cielo-blue)',
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 12px 0',
        }}
      >
        Zoom Out: Pendulums
      </h2>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}
      >
        A pendulum is any pattern that repeatedly pulled your energy through reaction — urgency,
        fear, obligation, proving, or control.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label
            htmlFor="pendulum-primary"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            My primary pendulum this year was
          </label>
          <input
            id="pendulum-primary"
            onChange={(e) => onUpdate('primary', e.target.value)}
            placeholder="e.g., proving my worth, seeking approval, avoiding conflict..."
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              width: '100%',
            }}
            type="text"
            value={data.primary}
          />
        </div>

        <div>
          <label
            htmlFor="pendulum-showedUp"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            How it showed up across the year
          </label>
          <textarea
            id="pendulum-showedUp"
            onChange={(e) => onUpdate('showedUp', e.target.value)}
            placeholder="In what situations, relationships, or decisions did this pattern appear?"
            rows={4}
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              resize: 'vertical',
              width: '100%',
            }}
            value={data.showedUp}
          />
        </div>

        <div>
          <label
            htmlFor="pendulum-cost"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            What it cost me
          </label>
          <textarea
            id="pendulum-cost"
            onChange={(e) => onUpdate('cost', e.target.value)}
            placeholder="Energy, time, relationships, peace of mind..."
            rows={3}
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              resize: 'vertical',
              width: '100%',
            }}
            value={data.cost}
          />
        </div>
      </div>
    </section>
  );
}
