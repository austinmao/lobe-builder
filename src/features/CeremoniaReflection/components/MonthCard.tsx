/**
 * MonthCard Component
 *
 * Accordion card for each month's reflection.
 */
'use client';

import { useState } from 'react';

import { type Month, type MonthReflection, isMonthComplete } from '../types';

/**
 * MonthCard Component
 *
 * Accordion card for each month's reflection.
 */

interface MonthCardProps {
  data: MonthReflection;
  defaultOpen?: boolean;
  month: Month;
  onUpdate: (field: keyof MonthReflection, value: string) => void;
}

export function MonthCard({ month, data, onUpdate, defaultOpen = false }: MonthCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isComplete = isMonthComplete(data);

  return (
    <div
      id={`month-${month.toLowerCase()}`}
      style={{
        backgroundColor: 'white',
        border: '1px solid var(--color-border-primary)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <button
        aria-controls={`month-content-${month}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          alignItems: 'center',
          backgroundColor: isComplete ? 'rgba(101, 197, 178, 0.1)' : 'transparent',
          border: 'none',
          borderBottom: isOpen ? '1px solid var(--color-border-primary)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          fontSize: '18px',
          fontWeight: 600,
          gap: '12px',
          justifyContent: 'space-between',
          padding: '20px',
          textAlign: 'left',
          width: '100%',
        }}
        type="button"
      >
        <span style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
          {month}
          {isComplete && (
            <span
              aria-label="Complete"
              style={{
                backgroundColor: 'var(--ceremonia-tierra-teal)',
                borderRadius: '50%',
                color: 'white',
                display: 'inline-flex',
                fontSize: '12px',
                height: '20px',
                justifyContent: 'center',
                lineHeight: '20px',
                width: '20px',
              }}
            >
              ✓
            </span>
          )}
        </span>
        <span
          style={{
            fontSize: '16px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          id={`month-content-${month}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '24px',
          }}
        >
          <div>
            <label
              htmlFor={`${month}-stoodOut`}
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              What stood out this month?
            </label>
            <textarea
              id={`${month}-stoodOut`}
              onChange={(e) => onUpdate('stoodOut', e.target.value)}
              placeholder="Look at your photos, calendar, messages..."
              rows={3}
              style={{
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                fontSize: '16px',
                padding: '12px',
                resize: 'vertical',
                width: '100%',
              }}
              value={data.stoodOut}
            />
          </div>

          <div>
            <label
              htmlFor={`${month}-emotions`}
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              Dominant emotions or tone
            </label>
            <textarea
              id={`${month}-emotions`}
              onChange={(e) => onUpdate('emotions', e.target.value)}
              placeholder="How did this month feel overall?"
              rows={2}
              style={{
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                fontSize: '16px',
                padding: '12px',
                resize: 'vertical',
                width: '100%',
              }}
              value={data.emotions}
            />
          </div>

          <div>
            <label
              htmlFor={`${month}-innerState`}
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              What this reveals about my inner state
            </label>
            <textarea
              id={`${month}-innerState`}
              onChange={(e) => onUpdate('innerState', e.target.value)}
              placeholder="What patterns or truths emerge?"
              rows={3}
              style={{
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                fontSize: '16px',
                padding: '12px',
                resize: 'vertical',
                width: '100%',
              }}
              value={data.innerState}
            />
          </div>

          <div>
            <label
              htmlFor={`${month}-chapterTitle`}
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              Chapter title
            </label>
            <input
              id={`${month}-chapterTitle`}
              onChange={(e) => onUpdate('chapterTitle', e.target.value)}
              placeholder="If this month were a chapter, what would you call it?"
              style={{
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                fontSize: '16px',
                padding: '12px',
                width: '100%',
              }}
              type="text"
              value={data.chapterTitle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
