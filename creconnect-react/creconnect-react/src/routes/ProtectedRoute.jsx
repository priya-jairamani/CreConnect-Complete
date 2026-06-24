import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import Spinner from '@/components/common/Spinner';

/**
 * Wraps authenticated sections of the router tree.
 *
 * Props:
 *   allowedRoles – if provided, user.role must be in this array.
 *                  Unauthenticated users are sent to /login.
 *                  Wrong-role users are sent to their own dashboard.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.map((r) => r.toUpperCase()).includes(user?.role?.toUpperCase())) {
    const redirectMap = {
      CREATOR: ROUTES.CREATOR_DASHBOARD,
      BRAND:   ROUTES.BRAND_DASHBOARD,
      ADMIN:   ROUTES.ADMIN_DASHBOARD,
    };
    return <Navigate to={redirectMap[user?.role?.toUpperCase()] ?? ROUTES.LOGIN} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children:     PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
