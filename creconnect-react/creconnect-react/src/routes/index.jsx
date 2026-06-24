import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';

function RouteErrorDisplay() {
  const error = useRouteError();
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#f0445f', background: '#0a0b14', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#f2f4fb' }}>⚠ Route crashed</h1>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#f2f4fb', background: '#12131f', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(240,68,95,0.4)' }}>
        {error?.message || String(error)}{'\n\n'}{error?.stack}
      </pre>
    </div>
  );
}
import { ROUTES } from '@/constants/routes';

/* Layouts */
import PublicLayout  from '@/layouts/PublicLayout';
import BrandLayout   from '@/layouts/BrandLayout';
import CreatorLayout from '@/layouts/CreatorLayout';
import AdminLayout   from '@/layouts/AdminLayout';

/* Guards */
import ProtectedRoute from './ProtectedRoute';

/* ── Public pages ──────────────────────────────────────────── */
import LandingPage        from '@/pages/public/LandingPage';
import RoleSelectPage     from '@/pages/public/RoleSelectPage';
import LoginPage          from '@/pages/public/LoginPage';
import CreatorSignupPage  from '@/pages/public/CreatorSignupPage';
import BrandSignupPage    from '@/pages/public/BrandSignupPage';
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';
import ResetPasswordPage  from '@/pages/public/ResetPasswordPage';
import OAuthCallback      from '@/pages/public/OAuthCallback';
import SocialOAuthPopup   from '@/pages/public/SocialOAuthPopup';

/* ── Creator pages ─────────────────────────────────────────── */
import CreatorDashboard  from '@/pages/creator/CreatorDashboard';
import FindBrands        from '@/pages/creator/FindBrands';
import CreatorCampaigns  from '@/pages/creator/CreatorCampaigns';
import Collaborations    from '@/pages/creator/Collaborations';
import Reviews           from '@/pages/creator/Reviews';
import CreatorProfile   from '@/pages/creator/CreatorProfile';
import CreatorInfo      from '@/pages/creator/CreatorInfo';
import CreatorMessages  from '@/pages/creator/CreatorMessages';
import Notifications    from '@/pages/creator/Notifications';
import CreatorReminders from '@/pages/creator/CreatorReminders';
import ReportCreator    from '@/pages/creator/ReportCreator';
import BrandPortfolio   from '@/pages/creator/BrandPortfolio';

/* ── Brand pages ───────────────────────────────────────────── */
import BrandDashboard       from '@/pages/brand/BrandDashboard';
import SearchCreators        from '@/pages/brand/SearchCreators';
import Campaigns             from '@/pages/brand/Campaigns';
import BrandCollaborations   from '@/pages/brand/BrandCollaborations';
import CollabRequest         from '@/pages/brand/CollabRequest';
import BrandMessages         from '@/pages/brand/BrandMessages';
import BrandActivity         from '@/pages/brand/BrandActivity';
import BrandSettings         from '@/pages/brand/BrandSettings';
import BrandReminders        from '@/pages/brand/BrandReminders';
import BrandNotifications    from '@/pages/brand/BrandNotifications';

/* ── Admin pages ───────────────────────────────────────────── */
import AdminLogin         from '@/pages/admin/AdminLogin';
import AdminOtp           from '@/pages/admin/AdminOtp';
import AdminResetPassword from '@/pages/admin/AdminResetPassword';
import AdminDashboard     from '@/pages/admin/AdminDashboard';
import UserManagement     from '@/pages/admin/UserManagement';
import CampaignManagement from '@/pages/admin/CampaignManagement';
import ContentManagement  from '@/pages/admin/ContentManagement';
import AdminReports       from '@/pages/admin/AdminReports';
import TrustSafety        from '@/pages/admin/TrustSafety';
import RevenuePayments    from '@/pages/admin/RevenuePayments';
import Operations         from '@/pages/admin/Operations';
import Settings           from '@/pages/admin/Settings';

const wrap = (element, roles) => (
  <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>
);

const router = createBrowserRouter([
  /* ── Public ── */
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorDisplay />,
    children: [
      { path: ROUTES.HOME,           element: <LandingPage /> },
      { path: ROUTES.ROLE_SELECT,    element: <RoleSelectPage /> },
      { path: ROUTES.CREATOR_SIGNUP, element: <CreatorSignupPage /> },
      { path: ROUTES.BRAND_SIGNUP,   element: <BrandSignupPage /> },
      { path: ROUTES.LOGIN,          element: <LoginPage /> },
      { path: ROUTES.FORGOT_PASSWORD,element: <ForgotPasswordPage /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
      { path: '/auth/callback', element: <OAuthCallback /> },
    ],
  },

  /* ── Social OAuth popup — standalone, no layout ── */
  {
    path: '/social-connect/:platform',
    element: <SocialOAuthPopup />,
    errorElement: <RouteErrorDisplay />,
  },

  /* ── Admin auth (public-ish, no sidebar) ── */
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorDisplay />,
    children: [
      { path: ROUTES.ADMIN_LOGIN,  element: <AdminLogin /> },
      { path: ROUTES.ADMIN_OTP,   element: <AdminOtp /> },
      { path: ROUTES.ADMIN_RESET, element: <AdminResetPassword /> },
    ],
  },

  /* ── Creator ── */
  {
    element: wrap(<CreatorLayout />, ['creator']),
    errorElement: <RouteErrorDisplay />,
    children: [
      { path: ROUTES.CREATOR_DASHBOARD,  element: <CreatorDashboard /> },
      { path: ROUTES.CREATOR_FIND_BRANDS,element: <FindBrands /> },
      { path: ROUTES.CREATOR_CAMPAIGNS,  element: <CreatorCampaigns /> },
      { path: ROUTES.CREATOR_COLLABS,    element: <Collaborations /> },
      { path: ROUTES.CREATOR_REVIEWS,    element: <Reviews /> },
      { path: ROUTES.CREATOR_PROFILE,    element: <CreatorProfile /> },
      { path: ROUTES.CREATOR_INFO,       element: <CreatorInfo /> },
      { path: ROUTES.CREATOR_MESSAGES,   element: <CreatorMessages /> },
      { path: ROUTES.CREATOR_NOTIFS,     element: <Notifications /> },
      { path: ROUTES.CREATOR_REMINDERS,  element: <CreatorReminders /> },
      { path: ROUTES.CREATOR_REPORT,     element: <ReportCreator /> },
      { path: ROUTES.BRAND_PORTFOLIO,    element: <BrandPortfolio /> },
    ],
  },

  /* ── Brand ── */
  {
    element: wrap(<BrandLayout />, ['brand']),
    errorElement: <RouteErrorDisplay />,
    children: [
      { path: ROUTES.BRAND_DASHBOARD,        element: <BrandDashboard /> },
      { path: ROUTES.BRAND_SEARCH,           element: <SearchCreators /> },
      { path: ROUTES.BRAND_CAMPAIGNS,        element: <Campaigns /> },
      { path: ROUTES.BRAND_COLLABORATIONS,   element: <BrandCollaborations /> },
      { path: ROUTES.BRAND_COLLAB_REQUEST,   element: <CollabRequest /> },
      { path: ROUTES.BRAND_MESSAGES,         element: <BrandMessages /> },
      { path: ROUTES.BRAND_ACTIVITY,         element: <BrandActivity /> },
      { path: ROUTES.BRAND_SETTINGS,         element: <BrandSettings /> },
      { path: ROUTES.BRAND_REMINDERS,        element: <BrandReminders /> },
      { path: ROUTES.BRAND_NOTIFICATIONS,   element: <BrandNotifications /> },
      { path: ROUTES.BRAND_MY_PORTFOLIO,     element: <BrandPortfolio /> },
    ],
  },

  /* ── Admin ── */
  {
    element: wrap(<AdminLayout />, ['admin']),
    errorElement: <RouteErrorDisplay />,
    children: [
      { path: ROUTES.ADMIN_DASHBOARD, element: <AdminDashboard /> },
      { path: ROUTES.ADMIN_USERS,     element: <UserManagement /> },
      { path: ROUTES.ADMIN_CAMPAIGNS, element: <CampaignManagement /> },
      { path: ROUTES.ADMIN_CONTENT,   element: <ContentManagement /> },
      { path: ROUTES.ADMIN_REPORTS,   element: <AdminReports /> },
      { path: ROUTES.ADMIN_TRUST_SAFETY, element: <TrustSafety /> },
      { path: ROUTES.ADMIN_REVENUE,   element: <RevenuePayments /> },
      { path: ROUTES.ADMIN_OPERATIONS, element: <Operations /> },
      { path: ROUTES.ADMIN_SETTINGS,  element: <Settings /> },
    ],
  },

  /* Catch-all */
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
]);

export default router;
