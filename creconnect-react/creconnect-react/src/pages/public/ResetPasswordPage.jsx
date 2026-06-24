import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { authApi } from '@/api/auth.api';

export default function ResetPasswordPage() {
  const [form,      setForm]      = useState({ newPassword: '', confirm: '' });
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Reset link is invalid or expired. Please request a new one.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, password: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2500);
    } catch (err) {
      setError(err?.message || 'Failed to reset password. The link may have expired.');
      setIsLoading(false);
    }
  };

  const isValid = form.newPassword.length >= 8 && form.confirm.length >= 8;

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div
          className="relative z-10 w-full max-w-md rounded-2xl p-8 space-y-6 text-center animate-fade-up"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-4xl">🔗</div>
          <h1 className="text-xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Invalid reset link</h1>
          <p className="text-fg-muted text-sm">This password reset link is missing or expired. Please request a new one.</p>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
          >
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'rgba(109,92,255,0.12)', color: 'var(--brand-400)' }}
          >
            🔑
          </div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            {success ? 'Password updated!' : 'Set new password'}
          </h1>
          <p className="text-fg-muted text-sm mt-1.5">
            {success ? 'Redirecting you to sign in…' : 'Choose a strong password for your account.'}
          </p>
        </div>

        {success ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(22,179,100,0.08)', border: '1px solid rgba(22,179,100,0.25)' }}
          >
            <span className="text-success text-base">✓</span>
            <span className="text-success font-medium">Password reset successfully</span>
          </div>
        ) : (
          <>
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-danger text-sm"
                style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
              />
              <Input
                label="Confirm Password"
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat new password"
                required
              />
              <Button type="submit" variant="primary" size="full" disabled={!isValid} isLoading={isLoading}>
                Reset password →
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
