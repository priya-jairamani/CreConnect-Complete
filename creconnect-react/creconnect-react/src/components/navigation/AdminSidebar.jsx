import { NavLink } from 'react-router-dom';
import { FiCreditCard, FiBriefcase } from 'react-icons/fi';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/common/ThemeToggle';
import Logo from '@/components/common/Logo';

const NAV = [
  { icon: '⊞', label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD },
  { icon: '◎', label: 'Users & Verification', to: ROUTES.ADMIN_USERS },
  { icon: '◆', label: 'Campaigns', to: ROUTES.ADMIN_CAMPAIGNS },
  { icon: '📄', label: 'Content', to: ROUTES.ADMIN_CONTENT },
  { icon: '📊', label: 'Reports', to: ROUTES.ADMIN_REPORTS },
  { icon: '🛡', label: 'Trust & Safety', to: ROUTES.ADMIN_TRUST_SAFETY },
  { icon: <FiCreditCard />, label: 'Revenue & Payments', to: ROUTES.ADMIN_REVENUE },
  { icon: <FiBriefcase />, label: 'Operations', to: ROUTES.ADMIN_OPERATIONS },
  { icon: '⚙', label: 'Settings',  to: ROUTES.ADMIN_SETTINGS  },
];

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col min-h-screen border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Logo size={24} />
      </div>

      {/* Admin badge */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center text-danger text-xs font-bold flex-shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-fg">Admin Panel</p>
            <p className="text-[10px] text-fg-muted">Full access</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-fg-muted uppercase tracking-widest px-2 mb-2 mt-1">Admin</p>
        {NAV.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="text-base w-5 h-5 flex-shrink-0 leading-none flex items-center justify-center">{icon}</span>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
        <ThemeToggle />
        <button
          onClick={logout}
          className="sidebar-link w-full !text-danger hover:!bg-danger/10"
        >
          <span className="text-base w-5 flex-shrink-0">←</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
