import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { authApi } from '@/api/auth.api';

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('');
  const [sent,      setSent]      = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    }
    setIsLoading(false);
  };

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
            🔐
          </div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            {sent ? 'Check your email' : 'Forgot password?'}
          </h1>
          <p className="text-fg-muted text-sm mt-1.5">
            {sent
              ? `We sent a password reset link to ${email}. Click the link in the email to set a new password.`
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-danger" style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}>
            ⚠ {error}
          </div>
        )}

        {!sent ? (
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
            <Button type="submit" variant="primary" size="full" disabled={!email.trim()} isLoading={isLoading}>
              Send reset link
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(22,179,100,0.08)', border: '1px solid rgba(22,179,100,0.25)' }}
            >
              <span className="text-success text-base">✓</span>
              <span className="text-success font-medium">Reset link sent successfully</span>
            </div>
            <button
              type="button"
              onClick={() => { setSent(false); setError(null); }}
              className="w-full text-center text-fg-muted text-sm hover:text-fg transition-colors"
            >
              ← Try a different email
            </button>
          </div>
        )}

        <p className="text-center text-fg-muted text-sm">
          Remember your password?{' '}
          <Link to={ROUTES.LOGIN} className="text-brand-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
