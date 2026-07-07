import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { authApi } from '@/api/auth.api';
import { ROUTES } from '@/constants/routes';

const ROLE_ROUTES = {
  CREATOR: ROUTES.CREATOR_DASHBOARD,
  BRAND:   ROUTES.BRAND_DASHBOARD,
  ADMIN:   ROUTES.ADMIN_DASHBOARD,
};

export default function OAuthCallback() {
  const [params]            = useSearchParams();
  const { loginWithTokens } = useAuthContext();
  const navigate              = useNavigate();

  useEffect(() => {
    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userId       = params.get('userId');
    const role         = params.get('role')?.toUpperCase();
    const status       = params.get('status')?.toUpperCase();

    if (!accessToken || !refreshToken || !userId || !role) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    const bootstrap = async () => {
      loginWithTokens({
        user: { id: userId, role, status: status || 'PENDING' },
        accessToken,
        refreshToken,
      });

      try {
        const { data } = await authApi.me();
        if (data) {
          localStorage.setItem('cc_user', JSON.stringify(data));
          loginWithTokens({
            user: data,
            accessToken,
            refreshToken,
          });
        }
      } catch {
        /* redirect with token payload if /me fails */
      }

      navigate(ROLE_ROUTES[role] ?? ROUTES.LOGIN, { replace: true });
    };

    bootstrap();
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
