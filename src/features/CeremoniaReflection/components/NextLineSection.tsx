/**
 * NextLineSection Component
 *
 * Zoom Out section with Sol Orange accent and state selector chips.
 */
'use client';

import {
  NEXT_LINE_STATES,
  type NextLineSection as NextLineData,
  type NextLineState,
} from '../types';

/**
 * NextLineSection Component
 *
 * Zoom Out section with Sol Orange accent and state selector chips.
 */

interface NextLineSectionProps {
  data: NextLineData;
  onUpdate: (field: keyof NextLineData, value: NextLineData[keyof NextLineData]) => void;
}

export function NextLineSection({ data, onUpdate }: NextLineSectionProps) {
  return (
    <section
      id="section-nextline"
      style={{
        backgroundColor: 'white',
        border: '1px solid var(--color-border-primary)',
        borderLeft: '4px solid var(--ceremonia-sol-orange)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        margin: '0 auto 24px',
        maxWidth: '800px',
        padding: '32px',
      }}
    >
      <h2
        style={{
          color: 'var(--ceremonia-sol-orange)',
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 12px 0',
        }}
      >
        Zoom Out: Choosing Your Next Line
      </h2>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}
      >
        You don&apos;t force reality. You choose the line you step onto — and walk it with presence.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '12px' }}>
            Choose your state for the coming year
          </label>
          <div
            role="radiogroup"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {NEXT_LINE_STATES.map((state) => (
              <button
                aria-checked={data.state === state}
                key={state}
                onClick={() => onUpdate('state', state as NextLineState)}
                role="radio"
                style={{
                  backgroundColor:
                    data.state === state ? 'var(--ceremonia-sol-orange)' : 'var(--ceremonia-bg)',
                  border:
                    data.state === state
                      ? '2px solid var(--ceremonia-sol-orange)'
                      : '2px solid var(--color-border-primary)',
                  borderRadius: '20px',
                  color: data.state === state ? 'white' : 'var(--ceremonia-charcoal)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '8px 16px',
                  transition: 'all 0.2s ease',
                }}
                type="button"
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="nextline-feelsLike"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            My next line feels like
          </label>
          <input
            id="nextline-feelsLike"
            onChange={(e) => onUpdate('feelsLike', e.target.value)}
            placeholder="Describe the quality of presence you want to embody..."
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              width: '100%',
            }}
            type="text"
            value={data.feelsLike}
          />
        </div>

        <div>
          <label
            htmlFor="nextline-sentences"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            Three present-tense sentences describing this line
          </label>
          <textarea
            id="nextline-sentences"
            onChange={(e) => onUpdate('sentences', e.target.value)}
            placeholder="I am... I trust... I move through the world with..."
            rows={4}
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              resize: 'vertical',
              width: '100%',
            }}
            value={data.sentences}
          />
        </div>

        <div>
          <label
            htmlFor="nextline-action"
            style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}
          >
            One small alignment action
          </label>
          <input
            id="nextline-action"
            onChange={(e) => onUpdate('action', e.target.value)}
            placeholder="What's one thing you can do this week to step onto this line?"
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              width: '100%',
            }}
            type="text"
            value={data.action}
          />
        </div>
      </div>
    </section>
  );
}
