import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { TYPE_META } from '@/components/notifications/NotificationItem';
import { ROUTES } from '@/constants/routes';

const AUTO_DISMISS_MS = 5000;

export default function NotificationBanner({ notification, onDismiss }) {
  const navigate  = useNavigate();
  const timerRef  = useRef(null);
  const [leaving, setLeaving] = useState(false);

  // Determine which notifications page to go to based on route
  const viewPath = window.location.pathname.startsWith('/brand')
    ? ROUTES.BRAND_NOTIFICATIONS
    : ROUTES.CREATOR_NOTIFS;

  const dismiss = () => {
    setLeaving(true);
    clearTimeout(timerRef.current);
    setTimeout(onDismiss, 300); // wait for exit animation
  };

  const handleView = () => {
    dismiss();
    navigate(viewPath);
  };

  // Auto-dismiss
  useEffect(() => {
    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.id]);

  const meta    = TYPE_META[notification.type] ?? TYPE_META.SYSTEM;
  const message = notification.message ?? notification.body ?? '';

  return (
    <div
      style={{
        position:   'fixed',
        top:        '1.25rem',
        right:      '1.25rem',
        zIndex:     9999,
        width:      'min(360px, calc(100vw - 2.5rem))',
        animation:  leaving
          ? 'notif-out .3s ease-in forwards'
          : 'notif-in .35s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      <div
        style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderLeft:   `3px solid ${resolveColor(meta.color)}`,
          borderRadius: 16,
          boxShadow:    '0 16px 48px rgba(0,0,0,0.45)',
          padding:      '0.875rem 1rem',
          display:      'flex',
          alignItems:   'flex-start',
          gap:          '0.75rem',
        }}
        onMouseEnter={() => clearTimeout(timerRef.current)}
        onMouseLeave={() => { timerRef.current = setTimeout(dismiss, 2000); }}
      >
        {/* Icon */}
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background:    meta.color,
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            fontSize:      '1rem',
            flexShrink:    0,
          }}
        >
          {meta.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin:     0,
              color:      'var(--fg)',
              fontSize:   '0.8125rem',
              fontWeight: 500,
              lineHeight: 1.4,
              display:    '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow:   'hidden',
            }}
          >
            {message}
          </p>
          <button
            onClick={handleView}
            style={{
              marginTop:  '0.375rem',
              background: 'none',
              border:     'none',
              padding:    0,
              color:      'var(--brand-400)',
              fontSize:   '0.75rem',
              fontWeight: 600,
              cursor:     'pointer',
              fontFamily: 'inherit',
            }}
          >
            View →
          </button>
        </div>

        {/* Progress bar + close */}
        <button
          onClick={dismiss}
          style={{
            background: 'none',
            border:     'none',
            color:      'var(--fg-muted)',
            fontSize:   '1rem',
            cursor:     'pointer',
            lineHeight: 1,
            flexShrink: 0,
            padding:    '0.125rem',
            marginTop:  '-0.125rem',
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      {!leaving && (
        <div
          style={{
            position:     'absolute',
            bottom:       0,
            left:         3,        // align with border-left
            right:        0,
            height:       3,
            borderRadius: '0 0 16px 16px',
            overflow:     'hidden',
          }}
        >
          <div
            style={{
              height:    '100%',
              background:'var(--brand-500)',
              animation: `notif-progress ${AUTO_DISMISS_MS}ms linear forwards`,
              transformOrigin: 'left',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes notif-in {
          from { opacity: 0; transform: translateX(110%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)   scale(1);    }
        }
        @keyframes notif-out {
          from { opacity: 1; transform: translateX(0)    scale(1);    }
          to   { opacity: 0; transform: translateX(110%) scale(0.95); }
        }
        @keyframes notif-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

function resolveColor(cssValue) {
  // Strip rgba wrappers to get a solid border colour
  if (!cssValue) return 'var(--brand-500)';
  const m = cssValue.match(/rgba\((\d+),(\d+),(\d+)/);
  if (m) return `rgb(${m[1]},${m[2]},${m[3]})`;
  return cssValue;
}

NotificationBanner.propTypes = {
  notification: PropTypes.shape({
    id:      PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type:    PropTypes.string,
    message: PropTypes.string,
    body:    PropTypes.string,
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
