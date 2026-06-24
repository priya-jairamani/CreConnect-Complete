import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';

/**
 * Thin consumer hook that combines AuthContext with navigation.
 * Components import this instead of useAuthContext directly.
 */
export function useAuth() {
  const auth     = useAuthContext();
  const navigate = useNavigate();

  const loginAndRedirect = useCallback(
    async (credentials) => {
      const user = await auth.login(credentials);
      const role = user.role?.toUpperCase();
      if (role === 'CREATOR') navigate(ROUTES.CREATOR_DASHBOARD);
      else if (role === 'BRAND') navigate(ROUTES.BRAND_DASHBOARD);
      else if (role === 'ADMIN') navigate(ROUTES.ADMIN_DASHBOARD);
    },
    [auth, navigate]
  );

  const logoutAndRedirect = useCallback(() => {
    auth.logout();
    navigate(ROUTES.LOGIN);
  }, [auth, navigate]);

  return {
    user:            auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading:       auth.isLoading,
    error:           auth.error,
    clearError:      auth.clearError,
    login:           loginAndRedirect,
    logout:          logoutAndRedirect,
  };
}
