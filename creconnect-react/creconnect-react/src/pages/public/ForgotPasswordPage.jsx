import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { authApi } from '@/api/auth.api';

export default function ForgotPasswordPage() {
  const [tab, setTab] = useState('email'); // 'email' | 'oldPassword'

  /* ── Email tab ── */
  const [email,        setEmail]        = useState('');
  const [emailSent,    setEmailSent]    = useState(false);
  const [emailError,   setEmailError]   = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  /* ── Old password tab — step 1: verify ── */
  const [step1,       setStep1]       = useState({ email: '', oldPassword: '' });
  const [similarity,  setSimilarity]  = useState(null);  // number 0-100 after check
  const [step1Error,  setStep1Error]  = useState('');
  const [step1Hint,   setStep1Hint]   = useState('');    // extra guidance from backend
  const [step1Loading,setStep1Loading]= useState(false);
  const [step1Done,   setStep1Done]   = useState(false); // passed the check → show step 2

  /* ── Old password tab — step 2: new password ── */
  const [step2,       setStep2]       = useState({ newPassword: '', confirm: '' });
  const [step2Error,  setStep2Error]  = useState('');
  const [step2Loading,setStep2Loading]= useState(false);
  const [resetDone,   setResetDone]   = useState(false);

  /* ────────────────────────────────────── */

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError('');
    try {
      await authApi.forgotPassword({ email });
      setEmailSent(true);
    } catch (err) {
      setEmailError(err?.message || 'Failed to send reset email. Please try again.');
    }
    setEmailLoading(false);
  };

  /* Step 1 — check similarity */
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setStep1Loading(true);
    setStep1Error('');
    setStep1Hint('');
    setSimilarity(null);
    try {
      const { data } = await authApi.checkOldPassword({
        email:       step1.email,
        oldPassword: step1.oldPassword,
      });
      const pct = data?.similarity ?? 0;
      setSimilarity(pct);
      if (data?.hint) setStep1Hint(data.hint);
      if (data?.allowed) {
        setStep1Done(true);
      } else {
        setStep1Error(`Password similarity is ${pct}% — need at least 50% to continue.`);
      }
    } catch (err) {
      const pct = err?.data?.similarity ?? null;
      if (pct !== null) setSimilarity(pct);
      setStep1Error(err?.message || 'Could not verify password. Please try again.');
    }
    setStep1Loading(false);
  };

  /* Step 2 — set new password */
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (step2.newPassword !== step2.confirm) { setStep2Error('Passwords do not match.'); return; }
    if (step2.newPassword.length < 8)         { setStep2Error('New password must be at least 8 characters.'); return; }
    setStep2Loading(true);
    setStep2Error('');
    try {
      await authApi.resetWithOldPassword({
        email:       step1.email,
        oldPassword: step1.oldPassword,
        newPassword: step2.newPassword,
      });
      setResetDone(true);
    } catch (err) {
      setStep2Error(err?.message || 'Could not reset password. Please try again.');
    }
    setStep2Loading(false);
  };

  const resetOldFlow = () => {
    setStep1({ email: '', oldPassword: '' });
    setStep2({ newPassword: '', confirm: '' });
    setSimilarity(null);
    setStep1Error('');
    setStep2Error('');
    setStep1Done(false);
    setResetDone(false);
  };

  /* ────────────────────────────────────── */

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(50% 50% at 50% 30%, rgba(109,92,255,0.1) 0, transparent 70%)' }}
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8 space-y-6 animate-fade-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'rgba(109,92,255,0.12)', color: 'var(--brand-400)' }}
          >
            🔐
          </div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Reset password
          </h1>
          <p className="text-fg-muted text-sm mt-1.5">Choose how you'd like to reset your password</p>
        </div>

        {/* Tab toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {[
            { key: 'email',       label: '📧 Via Email'        },
            { key: 'oldPassword', label: '🔑 Via Old Password' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); }}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={tab === t.key
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { background: 'transparent', color: 'var(--fg-muted)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ EMAIL TAB ══ */}
        {tab === 'email' && (
          emailSent ? (
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(22,179,100,0.08)', border: '1px solid rgba(22,179,100,0.25)' }}
              >
                <span className="text-success text-base">✓</span>
                <span className="text-success font-medium">
                  Reset link sent to <strong>{email}</strong>. Check your inbox.
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setEmailSent(false); setEmailError(''); }}
                className="w-full text-center text-fg-muted text-sm hover:text-fg transition-colors"
              >
                ← Try a different email
              </button>
            </div>
          ) : (
            <>
              {emailError && (
                <div className="px-4 py-3 rounded-xl text-danger text-sm"
                  style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}>
                  ⚠ {emailError}
                </div>
              )}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input label="Email address" name="email" type="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required />
                <Button type="submit" variant="primary" size="full"
                  disabled={!email.trim()} isLoading={emailLoading}>
                  Send reset link →
                </Button>
              </form>
            </>
          )
        )}

        {/* ══ OLD PASSWORD TAB ══ */}
        {tab === 'oldPassword' && (
          <>
            {/* Step indicator */}
            {!resetDone && (
              <div className="flex items-center gap-2">
                {[
                  { n: 1, label: 'Verify identity' },
                  { n: 2, label: 'Set new password' },
                ].map(({ n, label }, i) => {
                  const done    = n === 1 ? step1Done : resetDone;
                  const active  = n === 1 ? !step1Done : step1Done;
                  return (
                    <div key={n} className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={done
                            ? { background: 'rgba(22,179,100,0.2)', color: '#16b364' }
                            : active
                              ? { background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', color: '#fff' }
                              : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                          }
                        >
                          {done ? '✓' : n}
                        </div>
                        <span className="text-xs font-medium" style={{ color: active ? 'var(--fg)' : 'var(--fg-muted)' }}>
                          {label}
                        </span>
                      </div>
                      {i === 0 && (
                        <div className="flex-1 h-px" style={{ background: step1Done ? 'rgba(22,179,100,0.4)' : 'var(--border)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── STEP 1: Verify old password ── */}
            {!step1Done && !resetDone && (
              <>
                <div
                  className="px-4 py-3 rounded-xl text-xs"
                  style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.2)', color: 'var(--fg-muted)' }}
                >
                  <span className="text-brand-400 font-semibold">ℹ </span>
                  Enter your current password. If it's at least <strong>50% similar</strong> to your stored password, you can set a new one.
                </div>

                {/* Similarity result after failed check */}
                {similarity !== null && !step1Done && (
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(240,68,95,0.3)' }}>
                    <div className="px-4 py-3" style={{ background: 'rgba(240,68,95,0.07)' }}>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: '#f0445f' }}>
                        ⚠ Similarity too low — {similarity}%
                      </p>
                      <p className="text-xs text-fg-muted">Need at least 50% to proceed without email.</p>
                    </div>
                    <div className="px-4 py-3 space-y-2" style={{ background: 'var(--surface-2)' }}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-fg-muted">Your similarity</span>
                        <span className="font-bold" style={{ color: similarity >= 50 ? '#16b364' : '#f0445f' }}>{similarity}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${similarity}%`,
                            background: similarity >= 50
                              ? 'linear-gradient(90deg,#16b364,#22c55e)'
                              : 'linear-gradient(90deg,#f0445f,#f59e0b)',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-fg-muted">0%</span>
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--brand-400)' }}>50% needed</span>
                        <span className="text-[10px] text-fg-muted">100%</span>
                      </div>
                      {step1Hint && (
                        <p className="text-xs text-fg-muted leading-relaxed pt-1">
                          ℹ {step1Hint}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => { setSimilarity(null); setStep1Error(''); setStep1Hint(''); setTab('email'); }}
                        className="mt-1 text-xs font-semibold px-3 py-1.5 rounded-lg w-full transition-all hover:scale-105"
                        style={{ background: 'rgba(109,92,255,0.12)', color: 'var(--brand-400)', border: '1px solid rgba(109,92,255,0.25)' }}
                      >
                        Switch to Email Reset →
                      </button>
                    </div>
                  </div>
                )}

                {step1Error && !similarity && (
                  <div className="px-4 py-3 rounded-xl text-sm text-danger"
                    style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}>
                    ⚠ {step1Error}
                  </div>
                )}

                <form onSubmit={handleStep1Submit} className="space-y-4"
                  onChange={() => { setStep1Error(''); setStep1Hint(''); setSimilarity(null); }}>
                  <Input label="Email address" name="email" type="email"
                    value={step1.email} onChange={(e) => setStep1(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com" required />
                  <Input label="Current password" name="oldPassword" type="password"
                    value={step1.oldPassword} onChange={(e) => setStep1(p => ({ ...p, oldPassword: e.target.value }))}
                    placeholder="Your current password" required />
                  <Button type="submit" variant="primary" size="full"
                    disabled={!step1.email || !step1.oldPassword}
                    isLoading={step1Loading}>
                    Check similarity →
                  </Button>
                </form>
              </>
            )}

            {/* ── STEP 2: Set new password ── */}
            {step1Done && !resetDone && (
              <>
                {/* Similarity badge */}
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(22,179,100,0.08)', border: '1px solid rgba(22,179,100,0.25)' }}
                >
                  <span className="text-success text-lg">✓</span>
                  <div>
                    <p className="text-success font-semibold text-sm">Identity verified — {similarity}% similarity</p>
                    <p className="text-fg-muted text-xs">You can now set a new password for <strong>{step1.email}</strong></p>
                  </div>
                </div>

                {step2Error && (
                  <div className="px-4 py-3 rounded-xl text-sm text-danger"
                    style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}>
                    ⚠ {step2Error}
                  </div>
                )}

                <form onSubmit={handleStep2Submit} className="space-y-4"
                  onChange={() => setStep2Error('')}>
                  <Input label="New password" name="newPassword" type="password"
                    value={step2.newPassword} onChange={(e) => setStep2(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min 8 characters" required />
                  <Input label="Confirm new password" name="confirm" type="password"
                    value={step2.confirm} onChange={(e) => setStep2(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Repeat new password" required />
                  <Button type="submit" variant="primary" size="full"
                    disabled={step2.newPassword.length < 8 || !step2.confirm}
                    isLoading={step2Loading}>
                    Set new password →
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={resetOldFlow}
                  className="w-full text-center text-xs text-fg-muted hover:text-fg transition-colors"
                >
                  ← Start over
                </button>
              </>
            )}

            {/* ── SUCCESS ── */}
            {resetDone && (
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(22,179,100,0.08)', border: '1px solid rgba(22,179,100,0.25)' }}
                >
                  <span className="text-success text-xl">✓</span>
                  <div>
                    <p className="text-success font-semibold">Password updated successfully!</p>
                    <p className="text-fg-muted text-xs mt-0.5">You can now sign in with your new password.</p>
                  </div>
                </div>
                <Link
                  to={ROUTES.LOGIN}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
                >
                  Sign in →
                </Link>
              </div>
            )}
          </>
        )}

        <p className="text-center text-fg-muted text-sm">
          Remember your password?{' '}
          <Link to={ROUTES.LOGIN} className="text-brand-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
