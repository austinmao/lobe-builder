/**
 * MonthProgress Component
 *
 * Shows completion progress for months.
 */
'use client';

interface MonthProgressProps {
  completed: number;
  total: number;
}

export function MonthProgress({ completed, total }: MonthProgressProps) {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div
      style={{
        margin: '0 auto 24px',
        maxWidth: '800px',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: '16px',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontWeight: 600 }}>
          {completed}/{total} months completed
        </span>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          {percentage}%
        </span>
      </div>
      <div
        style={{
          backgroundColor: 'var(--color-border-primary)',
          borderRadius: '4px',
          height: '8px',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--ceremonia-tierra-teal)',
            borderRadius: '4px',
            height: '100%',
            transition: 'width 0.3s ease',
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}
