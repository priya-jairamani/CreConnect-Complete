import PropTypes from 'prop-types';

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const ACCENTS = {
  success: { color: 'var(--success)', bg: 'rgba(22,179,100,0.12)' },
  error:   { color: 'var(--danger)',  bg: 'rgba(240,68,95,0.12)' },
  warning: { color: 'var(--warning)', bg: 'rgba(245,166,35,0.12)' },
  info:    { color: 'var(--brand-400)', bg: 'rgba(109,92,255,0.12)' },
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(380px,calc(100vw-2.5rem))]">
      {toasts.map((t) => {
        const accent = ACCENTS[t.type] ?? ACCENTS.info;
        return (
          <div
            key={t.id}
            className="glass rounded-2xl p-4 flex items-start gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-fade-up"
            style={{ border: '1px solid var(--border)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: accent.bg, color: accent.color }}
            >
              {ICONS[t.type] ?? ICONS.info}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className="text-fg text-sm font-semibold mb-0.5" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {t.title}
                </p>
              )}
              <p className="text-fg-muted text-sm leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-fg-muted hover:text-fg transition-colors flex-shrink-0 text-sm leading-none mt-0.5"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.shape({
    id:      PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    type:    PropTypes.string,
    title:   PropTypes.string,
  })).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
