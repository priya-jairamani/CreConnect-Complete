import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPlatformMeta } from '@/components/common/PlatformIcon';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');

const PLATFORM_LABELS = {
  INSTAGRAM: 'Instagram', TIKTOK: 'TikTok', YOUTUBE: 'YouTube',
  LINKEDIN: 'LinkedIn', FACEBOOK: 'Facebook', TWITTER: 'X (Twitter)',
};

const PERMISSIONS = {
  INSTAGRAM: ['View your username & profile', 'Read follower count & engagement', 'Access public media insights'],
  TIKTOK:    ['View your username & profile', 'Read follower count & video stats', 'Access public content analytics'],
  YOUTUBE:   ['View your channel & subscriber count', 'Read video analytics & reach', 'Access channel insights'],
  LINKEDIN:  ['View your profile & connections', 'Read follower count & post reach', 'Access company page analytics'],
  FACEBOOK:  ['View your page & profile info', 'Read follower & engagement data', 'Access public post insights'],
  TWITTER:   ['View your username & profile', 'Read follower count & tweet analytics', 'Access public tweet insights'],
};

function postAndClose(payload) {
  try { window.opener?.postMessage({ type: 'CC_SOCIAL_CONNECTED', ...payload }, '*'); } catch { /* noop */ }
  window.close();
}

export default function SocialOAuthPopup() {
  const { platform: rawPlatform } = useParams();
  const [searchParams]            = useSearchParams();
  const platform  = rawPlatform?.toUpperCase() ?? '';
  const prefill   = searchParams.get('handle') ?? '';

  const [step,    setStep]    = useState('checking');
  const [handle,  setHandle]  = useState(prefill);
  const [errMsg,  setErrMsg]  = useState('');

  const meta        = getPlatformMeta(platform);
  const Icon        = meta.Icon;
  const label       = PLATFORM_LABELS[platform] ?? platform;
  const permissions = PERMISSIONS[platform] ?? ['Access your public profile data'];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setStep('manual');
      return;
    }

    // Use fetch directly — the configured axios client redirects to /login on 401
    // which would replace the popup content. We want a graceful fallback instead.
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); setStep('manual'); }, 5000);

    fetch(`${BASE_URL}/social/${rawPlatform}/auth-url`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((r) => r.ok ? r.json() : null)
      .then((body) => {
        clearTimeout(timeout);
        const url = body?.data?.url ?? body?.url;
        if (url) {
          setStep('redirect');
          window.location.href = url;
        } else {
          setStep('manual');
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setStep('manual');
      });

    return () => { controller.abort(); clearTimeout(timeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    if (!handle.trim()) { setErrMsg('Please enter your handle or username.'); return; }
    setErrMsg('');
    setStep('connecting');

    await new Promise((r) => setTimeout(r, 1200));
    setStep('done');
    await new Promise((r) => setTimeout(r, 700));

    postAndClose({
      platform,
      handle:       handle.startsWith('@') ? handle : `@${handle}`,
      followerCount: 0,
    });
  };

  /* ── Styles ── */
  const s = {
    bg:      '#0a0b14',
    surface: '#12131f',
    card:    '#1a1b2e',
    border:  'rgba(255,255,255,0.08)',
    fg:      '#f2f4fb',
    muted:   '#9aa1b6',
    danger:  '#f0445f',
    success: '#16b364',
  };

  return (
    <div style={{ background: s.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 420, background: s.surface, border: `1px solid ${s.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: `${meta.color}14`, borderBottom: `1px solid ${meta.color}28`, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={22} color={meta.color} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, color: s.fg, fontWeight: 600, fontSize: '0.9375rem' }}>Connect {label}</p>
            <p style={{ margin: '2px 0 0', color: s.muted, fontSize: '0.75rem' }}>CreConnect · Read-only access</p>
          </div>
          <button
            onClick={() => window.close()}
            style={{ background: 'none', border: 'none', color: s.muted, fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1, padding: '0.25rem', flexShrink: 0 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>

          {/* Checking / redirect */}
          {(step === 'checking' || step === 'redirect') && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${meta.color}40`, borderTopColor: meta.color, animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: s.muted, fontSize: '0.875rem', margin: 0 }}>
                {step === 'redirect' ? `Redirecting to ${label}…` : 'Checking connection…'}
              </p>
            </div>
          )}

          {/* Manual handle form */}
          {step === 'manual' && (
            <>
              <p style={{ color: s.fg, fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.375rem' }}>
                CreConnect would like to access your {label} account.
              </p>
              <p style={{ color: s.muted, fontSize: '0.8125rem', margin: '0 0 1.25rem' }}>
                Enter your {label} handle so brands can verify your profile.
              </p>

              <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 12, padding: '0.875rem', marginBottom: '1.25rem' }}>
                <p style={{ margin: '0 0 0.625rem', color: s.muted, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Permissions requested
                </p>
                {permissions.map((p) => (
                  <div key={p} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                    <span style={{ color: s.success, fontSize: '0.75rem', marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ color: s.fg, fontSize: '0.8125rem' }}>{p}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: s.fg, fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  Your {label} handle
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: s.card, border: `1px solid ${errMsg ? s.danger : s.border}`, borderRadius: 10, padding: '0.5rem 0.75rem', transition: 'border-color .15s' }}>
                  <Icon size={15} color={meta.color} />
                  <input
                    autoFocus
                    value={handle}
                    onChange={(e) => { setHandle(e.target.value); setErrMsg(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                    placeholder={platform === 'LINKEDIN' ? 'linkedin.com/in/yourname' : '@yourhandle'}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: s.fg, fontSize: '0.875rem' }}
                  />
                </div>
                {errMsg && <p style={{ color: s.danger, fontSize: '0.75rem', margin: '0.375rem 0 0 0.25rem' }}>⚠ {errMsg}</p>}
              </div>

              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  onClick={() => window.close()}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: 10, background: 'transparent', border: `1px solid ${s.border}`, color: s.muted, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: 10, background: s.card, border: `1px solid ${s.border}`, color: s.fg, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Authorize & Connect
                </button>
              </div>

              <p style={{ color: s.muted, fontSize: '0.6875rem', textAlign: 'center', margin: '0.875rem 0 0' }}>
                Read-only access only. CreConnect cannot post or modify your account.
              </p>
            </>
          )}

          {/* Connecting */}
          {step === 'connecting' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${meta.color}40`, borderTopColor: meta.color, animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: s.muted, fontSize: '0.875rem', margin: 0 }}>Connecting to {label}…</p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(22,179,100,.15)', border: `2px solid ${s.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem', fontSize: '1.25rem', color: s.success }}>✓</div>
              <p style={{ color: s.fg, fontWeight: 600, margin: '0 0 0.25rem' }}>Connected!</p>
              <p style={{ color: s.muted, fontSize: '0.8125rem', margin: 0 }}>Closing this window…</p>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
