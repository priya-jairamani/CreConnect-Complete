import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth.api';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import PasswordStrength from '@/components/common/PasswordStrength';

const BASE_URL    = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const BACKEND_URL = BASE_URL.replace('/api/v1', '');

export default function CreatorSignupPage() {
  const { login, clearError } = useAuth();
  const navigate = useNavigate();
  const [values,    setValues]    = useState({ username: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError?.();
    setError(null);
    setIsLoading(true);
    try {
      await authApi.register({ email: values.email, password: values.password, role: 'CREATOR', username: values.username, displayName: values.username });
      await login({ email: values.email, password: values.password, role: 'creator' });
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const isValid = values.email.trim() && values.password.length >= 8 && values.username.trim();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(50% 50% at 50% 30%, rgba(109,92,255,0.12) 0, transparent 70%)' }}
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
            ✦
          </div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Create creator account
          </h1>
          <p className="text-fg-muted text-sm mt-1.5">Join 12,000+ creators on CreConnect</p>
          <p className="text-fg-muted text-xs mt-2">After signup you can access your dashboard right away. Collaborations unlock once an admin approves your account.</p>
        </div>

        {error && (
          <div
            className="px-4 py-3 rounded-xl text-danger text-sm"
            style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Username" name="username" value={values.username} onChange={handleChange} placeholder="@yourhandle" required />
          <Input label="Email"    name="email"    type="email" value={values.email} onChange={handleChange} placeholder="you@example.com" required />
          <Input label="Password" name="password" type="password" value={values.password} onChange={handleChange} placeholder="Min 8 characters" required />
          <PasswordStrength password={values.password} />

          <Button type="submit" variant="primary" size="full" disabled={!isValid} isLoading={isLoading}>
            Create account →
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <hr className="flex-1" style={{ borderColor: 'var(--border)' }} />
          <span className="text-fg-muted text-xs">or</span>
          <hr className="flex-1" style={{ borderColor: 'var(--border)' }} />
        </div>

        <button
          type="button"
          onClick={() => { window.location.href = `${BACKEND_URL}/api/v1/auth/google?role=creator`; }}
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
          Sign up with Google
        </button>

        <p className="text-center text-fg-muted text-sm">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-brand-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
