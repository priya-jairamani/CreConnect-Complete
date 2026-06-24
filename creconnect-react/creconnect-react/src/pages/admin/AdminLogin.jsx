import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { authApi } from '@/api/auth.api';
import { useAuthContext } from '@/context/AuthContext';

export default function AdminLogin() {
  const [email,     setEmail]     = useState('');
  const [pass,      setPass]      = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const navigate = useNavigate();
  const auth = useAuthContext();

  const isValid = email.trim() && pass.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // First authenticate with password — store tokens for after OTP
      const { data } = await authApi.login({ email, password: pass });
      const loginData = data?.user ? data : null;
      if (loginData) {
        sessionStorage.setItem('admin_pending_auth', JSON.stringify(loginData));
      }
      // Then request OTP for 2FA
      await authApi.sendOtp({ email, purpose: 'admin-login' });
      navigate(ROUTES.ADMIN_OTP, { state: { email } });
    } catch (err) {
      sessionStorage.removeItem('admin_pending_auth');
      // Backend unreachable — fall back to demo admin account, skipping OTP
      if (err?.offline) {
        try {
          await auth.login({ email, password: pass });
          navigate(ROUTES.ADMIN_DASHBOARD);
          return;
        } catch (demoErr) {
          setError(demoErr?.message || 'Invalid admin credentials');
          setIsLoading(false);
          return;
        }
      }
      setError(err?.message || 'Invalid admin credentials');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 py-12"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
          >
            ◐
          </div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Admin Portal
          </h1>
          <p className="text-fg-muted text-sm mt-1.5">Authorised personnel only</p>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}
        >
          <span>⚠</span>
          <span className="text-warning">This area is restricted. Unauthorised access is prohibited.</span>
        </div>

        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm text-danger"
            style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}
          >
            ⚠ {error}
          </div>
        )}

        <div className="card rounded-2xl p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@creconnect.com"
              required
            />
            <Input
              label="Password"
              name="pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="full" disabled={!isValid} isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-fg-muted text-xs">
          Protected by CreConnect Security · v2.0
        </p>
      </div>
    </div>
  );
}
