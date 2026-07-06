import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import axios from 'axios';

const BASE_URL    = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const BACKEND_URL = BASE_URL.replace('/api/v1', '');

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [searchParams]  = useSearchParams();
  const [role,        setRole]       = useState('creator');
  const [email,       setEmail]      = useState('');
  const [pass,        setPass]       = useState('');
  const [oauthError,  setOauthError] = useState(() => searchParams.get('error') || '');
  const [serverOnline, setServerOnline] = useState(null); // null=checking, true/false

  const isValid = email.trim() && pass.trim();

  // Ping backend health — only mark online if we get real JSON back from our API
  useEffect(() => {
    axios.get(`${BASE_URL}/auth/health`, { timeout: 3000, validateStatus: () => true })
      .then((res) => {
        const ct = res.headers?.['content-type'] ?? '';
        const isJson   = ct.includes('application/json');
        const isOurApi = res.data?.status === 'ok' || res.data?.success === true;
        setServerOnline(isJson && isOurApi);
      })
      .catch(() => setServerOnline(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password: pass, role });
    } catch {
      // Error is already stored in AuthContext state via LOGIN_FAILURE dispatch
      // so it renders in the error banner — no further action needed here
    }
  };

  const isOfflineError = error?.toLowerCase().includes('cannot connect') || error?.toLowerCase().includes('timed out');

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(50% 50% at 50% 30%, rgba(109,92,255,0.14) 0, transparent 70%)' }}
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8 space-y-6 animate-fade-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-2xl font-bold text-fg"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Welcome back
          </h1>
          <p className="text-fg-muted text-sm mt-1.5">Sign in to your CreConnect account</p>
        </div>

        {/* Server status banner */}
        {serverOnline === false && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs"
            style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)' }}
          >
            <span className="text-warning mt-0.5 flex-shrink-0">⚠</span>
            <div>
              <p className="text-warning font-semibold mb-0.5">Backend server is offline</p>
              <p className="text-fg-muted leading-relaxed">
                You can still explore the app using one of the demo accounts below.
              </p>
            </div>
          </div>
        )}
        {serverOnline === true && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
            <span className="text-success font-medium">Server connected</span>
          </div>
        )}

        {/* Role toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {['creator', 'brand'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all"
              style={
                role === r
                  ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                  : { background: 'transparent', color: 'var(--fg-muted)' }
              }
            >
              {r}
            </button>
          ))}
        </div>

        {/* OAuth redirect error */}
        {oauthError && (
          <div
            className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}
          >
            <span className="text-danger flex-shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-danger font-medium">Google sign-in failed</p>
              <p className="text-fg-muted text-xs mt-0.5">{oauthError}</p>
            </div>
            <button onClick={() => setOauthError('')} className="ml-auto text-fg-muted hover:text-fg text-base leading-none">×</button>
          </div>
        )}

        {/* Error */}
        {error && (() => {
          const isRoleError = error.toLowerCase().includes('switch to the');
          const wrongRole   = role === 'creator' ? 'brand' : 'creator';
          return (
            <div
              className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
              style={isRoleError
                ? { background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }
                : { background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }
              }
            >
              <span className="flex-shrink-0 mt-0.5" style={{ color: isRoleError ? '#eab308' : 'var(--color-danger)' }}>
                {isRoleError ? '⚠' : '⊗'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ color: isRoleError ? '#eab308' : 'var(--color-danger)' }}>
                  {isRoleError ? 'Wrong tab' : isOfflineError ? 'Server offline' : 'Sign-in failed'}
                </p>
                <p className="text-fg-muted text-xs mt-0.5">{error}</p>
                {isRoleError && (
                  <button
                    type="button"
                    onClick={() => { clearError(); setRole(wrongRole); }}
                    className="mt-2 text-xs font-semibold px-3 py-1 rounded-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(109,92,255,0.12)', color: 'var(--brand-400)', border: '1px solid rgba(109,92,255,0.25)' }}
                  >
                    Switch to {wrongRole.charAt(0).toUpperCase() + wrongRole.slice(1)} tab →
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="flex justify-end">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-fg-muted hover:text-brand-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={!isValid}
            isLoading={isLoading}
          >
            Sign in
          </Button>
        </form>

        {/* Demo credentials — shown when server is offline OR when login fails */}
        {(serverOnline === false || error) && (
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">
              {serverOnline === false ? 'Demo accounts (no backend required)' : 'Try a demo account'}
            </p>
            <div className="space-y-1">
              {[
                { label: 'Brand',   email: 'techwave@creconnect.com', pass: 'Brand@123'   },
                { label: 'Creator', email: 'laiba@creconnect.com',    pass: 'Creator@123' },
                { label: 'Admin (demo)', email: 'admin@creconnect.pk',    pass: 'Admin@12345' },
              ].map(({ label, email: e, pass: p }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setEmail(e); setPass(p); clearError(); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs"
                >
                  <span className="text-fg font-medium">{label}:</span>{' '}
                  <span className="text-fg-muted">{e} / {p}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-fg-muted">Click a row to fill the form, then press Sign in.</p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <hr className="flex-1" style={{ borderColor: 'var(--border)' }} />
          <span className="text-fg-muted text-xs">or</span>
          <hr className="flex-1" style={{ borderColor: 'var(--border)' }} />
        </div>

        {/* Social login */}
        <button
          type="button"
          onClick={() => { window.location.href = `${BACKEND_URL}/api/v1/auth/google?role=${role}`; }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
        >
          <svg className="flex-shrink-0" width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-fg-muted text-sm">
          No account?{' '}
          <Link to={ROUTES.ROLE_SELECT} className="text-brand-400 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
