/**
 * ClearDataModal Component
 *
 * Confirmation modal for clearing all data.
 */
'use client';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearDataModal({ isOpen, onClose, onConfirm }: ClearDataModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      onClick={onClose}
      role="dialog"
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        left: 0,
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: '400px',
          padding: '32px',
          width: '90%',
        }}
      >
        <h2
          id="modal-title"
          style={{
            color: 'var(--ceremonia-charcoal)',
            fontSize: '20px',
            fontWeight: 700,
            margin: '0 0 16px 0',
          }}
        >
          Clear All Data?
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          This will permanently delete all your reflection data. This action cannot be undone.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              padding: '10px 20px',
            }}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              backgroundColor: 'var(--color-error-500)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              padding: '10px 20px',
            }}
            type="button"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
