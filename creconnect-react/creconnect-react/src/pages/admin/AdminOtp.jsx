import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/common/Button';
import { authApi } from '@/api/auth.api';
import { useAuthContext } from '@/context/AuthContext';

export default function AdminOtp() {
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loginWithTokens } = useAuthContext();

  const email = location.state?.email || '';

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const code = otp.join('');
      await authApi.verifyOtp({ email, code });

      // Retrieve the auth tokens that were stored after password verification
      const pending = sessionStorage.getItem('admin_pending_auth');
      if (pending) {
        try {
          const authData = JSON.parse(pending);
          loginWithTokens({
            user:         authData.user,
            accessToken:  authData.accessToken,
            refreshToken: authData.refreshToken,
          });
        } catch { /* ignore parse errors */ }
        sessionStorage.removeItem('admin_pending_auth');
      }

      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch (err) {
      setError(err?.message || 'Invalid OTP code');
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email) return;
    try {
      await authApi.sendOtp({ email, purpose: 'admin-login' });
    } catch {}
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 py-12"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-2xl"
            style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
          >
            🔐
          </div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            OTP Verification
          </h1>
          <p className="text-fg-muted text-sm mt-1.5">
            Enter the 6-digit code sent to {email || 'your admin email'}
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-danger" style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}>
            ⚠ {error}
          </div>
        )}

        <div className="card rounded-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-3 justify-center">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl outline-none transition-all"
                  style={{
                    background: 'var(--surface-2)',
                    border: digit ? '2px solid var(--brand-500)' : '1px solid var(--border)',
                    color: 'var(--fg)',
                  }}
                />
              ))}
            </div>

            <Button type="submit" variant="primary" size="full" disabled={!isComplete} isLoading={isLoading}>
              Verify Code
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-fg-muted text-xs">Didn't receive the code?</p>
            <button
              onClick={resendOtp}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--brand-400)' }}
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
