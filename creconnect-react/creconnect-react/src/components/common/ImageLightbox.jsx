import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/** Full-screen image preview — renders above drawers/modals (z-index 10050). */
export default function ImageLightbox({ isOpen, onClose, src, title, alt }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Image preview'}
    >
      <div className="absolute inset-0 bg-black/92 backdrop-blur-md animate-fade-in" />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl leading-none bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        ×
      </button>

      <div
        className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <p
            className="text-white text-sm font-semibold mb-4 text-center px-4"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {title}
          </p>
        )}

        <div className="flex-1 flex items-center justify-center w-full min-h-0 overflow-hidden">
          <img
            src={src}
            alt={alt || title || 'Document'}
            className="max-w-full max-h-[calc(92vh-5rem)] object-contain rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
          />
        </div>

        <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-white px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            Close
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/80 hover:text-white underline underline-offset-2"
          >
            Open in new tab ↗
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}

ImageLightbox.propTypes = {
  isOpen:  PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  src:     PropTypes.string,
  title:   PropTypes.string,
  alt:     PropTypes.string,
};
