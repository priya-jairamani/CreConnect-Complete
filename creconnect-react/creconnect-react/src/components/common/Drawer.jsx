import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const WIDTH_CLASSES = {
  md:   'max-w-xl',
  lg:   'max-w-2xl',
  xl:   'max-w-3xl',
  '2xl':'max-w-4xl',
  full: 'max-w-6xl',
};

export default function Drawer({ isOpen, onClose, title, subtitle, icon, children, footer, headerExtra, size = 'xl' }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  /* Render directly into document.body so that ancestor CSS transforms
     (e.g. page-enter animation on <main>) cannot create a new containing
     block that constrains position:fixed and clips the overlay. */
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div
        className={`relative w-full ${WIDTH_CLASSES[size] ?? WIDTH_CLASSES.xl} h-full flex flex-col animate-drawer-in shadow-[0_24px_80px_rgba(0,0,0,0.6)]`}
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 p-5 flex-shrink-0 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2
                  className="text-lg font-semibold text-fg truncate"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-fg-muted text-sm mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerExtra}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-white/8 transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className="flex-shrink-0 p-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

Drawer.propTypes = {
  isOpen:      PropTypes.bool.isRequired,
  onClose:     PropTypes.func.isRequired,
  title:       PropTypes.string,
  subtitle:    PropTypes.string,
  icon:        PropTypes.node,
  children:    PropTypes.node,
  footer:      PropTypes.node,
  headerExtra: PropTypes.node,
  size:        PropTypes.oneOf(Object.keys(WIDTH_CLASSES)),
};
