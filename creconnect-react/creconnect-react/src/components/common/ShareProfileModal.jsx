import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCopy } from '@/hooks/useCopy';
import Modal from '@/components/common/Modal';
import { seededRandom } from '@/utils/mockAnalytics';

/* ─── QR Code visual ─────────────────────────────────────────────────
   Generates a seeded pixel grid that resembles a QR code.
   Uses standard QR finder-pattern corners so it looks authentic.
   Not scannable — purely decorative until a real QR lib is wired in.
 */
function QRCodeDisplay({ value, size = 128 }) {
  const cells = 21;
  const cs    = size / cells;

  const grid = useMemo(() => {
    const rand = seededRandom(`qr-${value}`);
    const isCorner = (x, y) => {
      const inCorner = (cx, cy) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
      const inInner  = (cx, cy) => x >= cx + 2 && x < cx + 5 && y >= cy + 2 && y < cy + 5;
      const inRing   = (cx, cy) => inCorner(cx, cy) && !inInner(cx, cy);
      const corners  = [[0, 0], [cells - 7, 0], [0, cells - 7]];
      for (const [cx, cy] of corners) {
        if (inCorner(cx, cy)) return inRing(cx, cy) || inInner(cx, cy);
      }
      return false;
    };
    return Array.from({ length: cells }, (_, y) =>
      Array.from({ length: cells }, (_, x) => isCorner(x, y) ? true : rand() > 0.55)
    );
  }, [value, cells]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8, display: 'block' }}>
      <rect width={size} height={size} fill="white" rx="6" />
      {grid.map((row, y) =>
        row.map((dark, x) => dark && (
          <rect key={`${x}-${y}`} x={x * cs + 0.5} y={y * cs + 0.5} width={cs - 1} height={cs - 1} fill="#1a1a2e" rx={x < 7 || x >= cells - 7 || y < 7 || y >= cells - 7 ? 1 : 0.5} />
        ))
      )}
    </svg>
  );
}

/* ─── Social share actions ─────────────────────────────────────────── */

const SHARE_CHANNELS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    icon: '💬',
    getUrl: (url, name) => `https://wa.me/?text=${encodeURIComponent(`Check out ${name}'s creator profile: ${url}`)}`,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: '🔗',
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    color: '#000000',
    icon: '𝕏',
    getUrl: (url, name) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${name}'s creator profile on CreConnect`)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: 'f',
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: 'telegram',
    label: 'Telegram',
    color: '#2AABEE',
    icon: '✈',
    getUrl: (url, name) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${name}'s Creator Profile`)}`,
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    color: '#010101',
    icon: '♪',
    getUrl: null, // no web share API — show copy instruction
  },
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    icon: '◎',
    getUrl: null, // no web share API
  },
  {
    key: 'snapchat',
    label: 'Snapchat',
    color: '#FFFC00',
    textColor: '#000',
    icon: '👻',
    getUrl: (url) => `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`,
  },
];

export default function ShareProfileModal({ isOpen, onClose, profileUrl, displayName }) {
  const { copy, copied } = useCopy();
  const [linkClicks, setLinkClicks] = useState(() => {
    try { return Number(localStorage.getItem('cc-profile-link-clicks') ?? 0); } catch { return 0; }
  });
  const [shareMsg, setShareMsg] = useState('');

  const handleCopy = () => {
    copy(profileUrl);
    const next = linkClicks + 1;
    setLinkClicks(next);
    try { localStorage.setItem('cc-profile-link-clicks', String(next)); } catch { /* noop */ }
  };

  const handleShare = (channel) => {
    if (!channel.getUrl) {
      setShareMsg(`Copy the link below and paste it in ${channel.label} to share your profile.`);
      handleCopy();
      return;
    }
    const url = channel.getUrl(profileUrl, displayName);
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=450');
    const next = linkClicks + 1;
    setLinkClicks(next);
    try { localStorage.setItem('cc-profile-link-clicks', String(next)); } catch { /* noop */ }
  };

  const handleOpenProfile = () => {
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Your Creator Profile"
      description="Grow your reach — share your public portfolio with brands and collaborators."
      size="lg"
    >
      <div className="space-y-5">

        {/* Profile URL + QR side-by-side */}
        <div className="flex flex-col sm:flex-row gap-5">
          {/* URL card */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Public Profile URL</label>
              <div
                className="mt-2 flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <span className="flex-1 text-fg text-sm font-medium truncate" title={profileUrl}>
                  {profileUrl || 'creconnect.com/creator/' + (displayName?.toLowerCase().replace(/\s+/g, '-') || 'your-profile')}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                  style={copied
                    ? { background: 'rgba(22,179,100,0.15)', color: '#16b364', border: '1px solid rgba(22,179,100,0.3)' }
                    : { background: 'var(--surface)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                  }
                >
                  {copied ? '✓ Copied!' : '⎘ Copy'}
                </button>
              </div>
            </div>

            {/* Track visits */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span className="text-fg-muted text-xs">🔗 Link Shares</span>
                <span className="font-bold text-fg text-sm">{linkClicks}</span>
              </div>
              <button
                onClick={handleOpenProfile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:text-fg"
                style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
              >
                ↗ Open Profile
              </button>
            </div>

            {shareMsg && (
              <p className="text-xs text-fg-muted px-3 py-2 rounded-xl" style={{ background: 'rgba(109,92,255,0.08)', border: '1px solid rgba(109,92,255,0.2)' }}>
                {shareMsg}
              </p>
            )}
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wider self-start sm:self-auto">QR Code</label>
            <div className="p-2 rounded-xl" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <QRCodeDisplay value={profileUrl || displayName || 'creconnect'} size={120} />
            </div>
            <p className="text-[10px] text-fg-muted">Scan to view profile</p>
          </div>
        </div>

        {/* Social share grid */}
        <div>
          <label className="text-xs font-medium text-fg-muted uppercase tracking-wider block mb-3">Share via</label>
          <div className="grid grid-cols-4 gap-2">
            {SHARE_CHANNELS.map((ch) => (
              <button
                key={ch.key}
                onClick={() => handleShare(ch)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                title={`Share on ${ch.label}`}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold"
                  style={{ background: ch.color, color: ch.textColor ?? '#fff' }}
                >
                  {ch.icon}
                </span>
                <span className="text-[10px] text-fg-muted font-medium leading-tight text-center">{ch.label}</span>
              </button>
            ))}

            {/* Copy link tile */}
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={copied
                ? { background: 'rgba(22,179,100,0.1)', border: '1px solid rgba(22,179,100,0.3)' }
                : { background: 'var(--surface-2)', border: '1px solid var(--border)' }
              }
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all"
                style={{ background: copied ? '#16b364' : 'var(--brand-500)', color: '#fff' }}
              >
                {copied ? '✓' : '⎘'}
              </span>
              <span className="text-[10px] font-medium transition-colors" style={{ color: copied ? '#16b364' : 'var(--fg-muted)' }}>
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}

ShareProfileModal.propTypes = {
  isOpen:      PropTypes.bool.isRequired,
  onClose:     PropTypes.func.isRequired,
  profileUrl:  PropTypes.string.isRequired,
  displayName: PropTypes.string,
};
