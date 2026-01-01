/**
 * StickyNav Component
 *
 * Sticky top bar with progress and jump-to-month dropdown.
 */
'use client';

import type { ChangeEvent } from 'react';

import { MONTHS } from '../types';

/**
 * StickyNav Component
 *
 * Sticky top bar with progress and jump-to-month dropdown.
 */

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function handleJumpToMonth(e: ChangeEvent<HTMLSelectElement>) {
  const month = e.target.value;
  if (month) {
    const element = document.getElementById(`month-${month.toLowerCase()}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    e.target.value = '';
  }
}

function handleJumpToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

interface StickyNavProps {
  completedMonths: number;
  isSaving: boolean;
  lastSaved: Date | null;
  onClearData: () => void;
  onExportJSON: () => void;
  onExportMarkdown: () => void;
  onPrint: () => void;
  totalMonths: number;
}

export function StickyNav({
  completedMonths,
  totalMonths,
  lastSaved,
  isSaving,
  onExportJSON,
  onExportMarkdown,
  onPrint,
  onClearData,
}: StickyNavProps) {
  return (
    <nav
      className="sticky-nav no-print"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid var(--color-border-primary)',
        left: 0,
        padding: '12px 24px',
        position: 'sticky',
        right: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          margin: '0 auto',
          maxWidth: '1200px',
        }}
      >
        {/* Left side: Progress and saved status */}
        <div style={{ alignItems: 'center', display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            {completedMonths}/{totalMonths} months
          </span>
          <span
            style={{
              color: isSaving ? 'var(--ceremonia-sol-orange)' : 'var(--color-text-secondary)',
              fontSize: '12px',
            }}
          >
            {isSaving ? 'Saving...' : lastSaved ? `Saved ${formatTime(lastSaved)}` : 'Not saved'}
          </span>
        </div>

        {/* Center: Jump to month */}
        <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
          <select
            aria-label="Jump to month"
            onChange={handleJumpToMonth}
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '6px 12px',
            }}
          >
            <option value="">Jump to month...</option>
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleJumpToSection('section-pendulums')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--ceremonia-cielo-blue)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 8px',
            }}
            type="button"
          >
            Pendulums
          </button>
          <button
            onClick={() => handleJumpToSection('section-importance')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--ceremonia-corazon-rose)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 8px',
            }}
            type="button"
          >
            Importance
          </button>
          <button
            onClick={() => handleJumpToSection('section-nextline')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--ceremonia-sol-orange)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 8px',
            }}
            type="button"
          >
            Next Line
          </button>
        </div>

        {/* Right side: Export buttons */}
        <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
          <button
            onClick={onExportJSON}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
            }}
            title="Export as JSON"
            type="button"
          >
            JSON
          </button>
          <button
            onClick={onExportMarkdown}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
            }}
            title="Export as Markdown"
            type="button"
          >
            MD
          </button>
          <button
            onClick={onPrint}
            style={{
              backgroundColor: 'var(--ceremonia-cielo-blue)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
            }}
            title="Print or save as PDF"
            type="button"
          >
            Print
          </button>
          <button
            onClick={onClearData}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-error-500)',
              borderRadius: '6px',
              color: 'var(--color-error-500)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
            }}
            title="Clear all data"
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
    </nav>
  );
}
