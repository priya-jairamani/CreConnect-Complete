import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/common/Button';
import { getPlatformMeta } from '@/components/common/PlatformIcon';

const PLATFORM_PERMISSIONS = {
  INSTAGRAM:  ['View your profile & username', 'Read follower count & engagement', 'Access public media & insights'],
  TIKTOK:     ['View your profile & username', 'Read follower count & video stats', 'Access public content analytics'],
  YOUTUBE:    ['View your channel & subscriber count', 'Read video analytics & reach', 'Access public channel insights'],
  LINKEDIN:   ['View your profile & connections', 'Read follower count & post reach', 'Access company page analytics'],
  FACEBOOK:   ['View your page & profile', 'Read follower & engagement data', 'Access public post insights'],
  TWITTER:    ['View your profile & username', 'Read follower count & tweet analytics', 'Access public tweet insights'],
  SNAPCHAT:   ['View your profile & username', 'Read subscriber count', 'Access story view analytics'],
};

const PLATFORM_URLS = {
  INSTAGRAM: (h) => `https://instagram.com/${h.replace(/^@/, '')}`,
  TIKTOK:    (h) => `https://tiktok.com/@${h.replace(/^@/, '')}`,
  YOUTUBE:   (h) => `https://youtube.com/@${h.replace(/^@/, '')}`,
  LINKEDIN:  (h) => `https://linkedin.com/in/${h.replace(/^@/, '')}`,
  FACEBOOK:  (h) => `https://facebook.com/${h.replace(/^@/, '')}`,
  TWITTER:   (h) => `https://x.com/${h.replace(/^@/, '')}`,
  SNAPCHAT:  (h) => `https://snapchat.com/add/${h.replace(/^@/, '')}`,
};

export default function SocialConnectModal({ platform, handle, isOpen, onClose, onConnect }) {
  const [step,    setStep]    = useState('auth');   // auth | loading | done
  const [err,     setErr]     = useState('');

  if (!isOpen) return null;

  const meta        = getPlatformMeta(platform);
  const Icon        = meta.Icon;
  const permissions = PLATFORM_PERMISSIONS[platform] ?? ['Access your public profile data'];
  const displayHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '';

  const handleAuthorize = async () => {
    if (!handle?.trim()) {
      setErr('Please enter a handle in the Social Links section first.');
      return;
    }
    setErr('');
    setStep('loading');

    await new Promise((r) => setTimeout(r, 1600));

    const urlFn = PLATFORM_URLS[platform] ?? ((h) => `https://${platform.toLowerCase()}.com/${h.replace(/^@/, '')}`);
    setStep('done');

    // Brief pause so the ✓ is visible, then fire onConnect — the parent will
    // unmount this modal, so we must not touch state after this call.
    await new Promise((r) => setTimeout(r, 700));
    onConnect({
      name:         platform,
      handle:       handle.startsWith('@') ? handle : `@${handle}`,
      url:          urlFn(handle),
      isConnected:  true,
      followerCount: 0,
    });
  };

  const handleClose = () => {
    setStep('auth');
    setErr('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar with platform colour */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: `${meta.color}18`, borderBottom: `1px solid ${meta.color}30` }}
        >
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${meta.color}22` }}
          >
            <Icon size={22} color={meta.color} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Connect {meta.label}
            </p>
            {displayHandle && (
              <p className="text-fg-muted text-xs truncate">{displayHandle}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-fg-muted hover:text-fg text-lg leading-none flex-shrink-0 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${meta.color}40`, borderTopColor: meta.color }}
              />
              <p className="text-fg-muted text-sm">Connecting to {meta.label}…</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                style={{ background: '#16b364' }}
              >
                ✓
              </div>
              <p className="text-fg text-sm font-semibold">Connected!</p>
            </div>
          )}

          {step === 'auth' && (
            <>
              <div className="space-y-2">
                <p className="text-fg text-sm font-medium">
                  CreConnect would like to access your {meta.label} account.
                </p>
                <p className="text-fg-muted text-xs">
                  This connection allows brands to verify your audience and performance metrics.
                </p>
              </div>

              {/* Permissions list */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <p className="text-fg-muted text-[11px] font-semibold uppercase tracking-wide mb-2">
                  Permissions requested
                </p>
                {permissions.map((perm) => (
                  <div key={perm} className="flex items-start gap-2">
                    <span className="text-success text-xs mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-fg text-xs">{perm}</span>
                  </div>
                ))}
              </div>

              {err && (
                <p className="text-xs text-danger px-1">⚠ {err}</p>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" size="md" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button variant="secondary" size="md" onClick={handleAuthorize} className="flex-1">
                  Authorize & Connect
                </Button>
              </div>

              <p className="text-[10px] text-fg-muted text-center leading-relaxed">
                Read-only access only. CreConnect cannot post or modify your account.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

SocialConnectModal.propTypes = {
  platform: PropTypes.string.isRequired,
  handle:   PropTypes.string,
  isOpen:   PropTypes.bool.isRequired,
  onClose:  PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
};
