import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';

const SIZE_CLASSES = {
  sm:    'max-w-sm',
  md:    'max-w-md',
  lg:    'max-w-lg',
  xl:    'max-w-xl',
  '2xl': 'max-w-2xl',
  full:  'max-w-5xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', description, footer }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  /* Render directly into document.body so that ancestor CSS transforms
     (e.g. the page-enter animation on <main>) cannot create a new
     containing block that clips position:fixed and hides the overlay. */
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={clsx(
          'relative w-full rounded-2xl p-6 animate-fade-up',
          'border border-[var(--border)] shadow-[0_24px_80px_rgba(0,0,0,0.6)]',
          size === 'full' ? 'max-h-[92vh] flex flex-col' : '',
          SIZE_CLASSES[size] ?? SIZE_CLASSES.md
        )}
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5 flex-shrink-0">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-fg-muted text-sm mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-white/8 transition-colors flex-shrink-0 ml-4 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {size === 'full' ? (
          <div className="overflow-y-auto -mr-2 pr-2 flex-1 min-h-0">{children}</div>
        ) : children}

        {footer && (
          <div className="flex-shrink-0 pt-4 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

Modal.propTypes = {
  isOpen:      PropTypes.bool.isRequired,
  onClose:     PropTypes.func.isRequired,
  title:       PropTypes.string,
  description: PropTypes.string,
  children:    PropTypes.node,
  size:        PropTypes.oneOf(Object.keys(SIZE_CLASSES)),
  footer:      PropTypes.node,
};
