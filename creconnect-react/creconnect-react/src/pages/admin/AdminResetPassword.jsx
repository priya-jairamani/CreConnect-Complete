import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { authApi } from '@/api/auth.api';

export default function AdminResetPassword() {
  const [form,      setForm]      = useState({ newPass: '', confirm: '' });
  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    const token = location.state?.resetToken || sessionStorage.getItem('adminResetToken');
    if (!token) {
      setError('Reset session expired. Please start over.');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: form.newPass });
      sessionStorage.removeItem('adminResetToken');
      navigate(ROUTES.ADMIN_LOGIN, { state: { message: 'Password updated. Please sign in.' } });
    } catch (err) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strong = form.newPass.length >= 8;

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
            🔑
          </div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Reset Password
          </h1>
          <p className="text-fg-muted text-sm mt-1.5">Set a new admin account password</p>
        </div>

        <div className="card rounded-2xl p-8 space-y-5">
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)', color: 'var(--danger)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              name="newPass"
              type="password"
              value={form.newPass}
              onChange={handleChange}
              required
            />

            {/* Strength bar */}
            {form.newPass && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background: i <= (form.newPass.length >= 12 ? 4 : form.newPass.length >= 8 ? 3 : form.newPass.length >= 5 ? 2 : 1)
                          ? (form.newPass.length >= 12 ? 'var(--success)' : form.newPass.length >= 8 ? 'var(--brand-500)' : 'var(--warning)')
                          : 'var(--surface-2)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-fg-muted">
                  {form.newPass.length < 5 ? 'Too weak' : form.newPass.length < 8 ? 'Weak' : form.newPass.length < 12 ? 'Good' : 'Strong'}
                </p>
              </div>
            )}

            <Input
              label="Confirm Password"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="full"
              disabled={!form.newPass || !form.confirm || !strong || isLoading}
              isLoading={isLoading}
            >
              Update Password
            </Button>
          </form>

          <button
            onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
            className="w-full text-center text-xs text-fg-muted hover:text-fg transition-colors"
          >
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
