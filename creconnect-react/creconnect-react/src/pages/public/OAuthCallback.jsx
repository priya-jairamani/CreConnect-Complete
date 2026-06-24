import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

const ROLE_ROUTES = {
  CREATOR: '/creator/dashboard',
  BRAND:   '/brand/dashboard',
  ADMIN:   '/admin/dashboard',
};

export default function OAuthCallback() {
  const [params]          = useSearchParams();
  const { loginWithTokens } = useAuthContext();
  const navigate            = useNavigate();

  useEffect(() => {
    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userId       = params.get('userId');
    const role         = params.get('role')?.toUpperCase();

    if (accessToken && refreshToken && userId && role) {
      loginWithTokens({ user: { id: userId, role }, accessToken, refreshToken });
      navigate(ROLE_ROUTES[role] ?? '/login', { replace: true });
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-fg-muted text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
}
