import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useMessageCount } from '@/hooks/useMessageCount';
import { useCollabRequestsCount } from '@/hooks/useCollabRequestsCount';
import ThemeToggle from '@/components/common/ThemeToggle';
import Logo from '@/components/common/Logo';
import { resolveMediaUrl } from '@/utils/media';

const NAV = [
  { icon: '⊞',  label: 'Dashboard',       to: ROUTES.BRAND_DASHBOARD      },
  { icon: '◎',  label: 'Search Creators',  to: ROUTES.BRAND_SEARCH         },
  { icon: '◈',  label: 'Campaigns',        to: ROUTES.BRAND_CAMPAIGNS      },
  { icon: '◉',  label: 'Collaborations',   to: ROUTES.BRAND_COLLABORATIONS },
  { icon: '💬', label: 'Messages',         to: ROUTES.BRAND_MESSAGES       },
  { icon: '🪪', label: 'Brand Portfolio',  to: ROUTES.BRAND_MY_PORTFOLIO   },
  { icon: '💳', label: 'Payments',         to: ROUTES.BRAND_PAYMENTS       },
  { icon: '⚡', label: 'Activity',         to: ROUTES.BRAND_ACTIVITY       },
  { icon: '⚙',  label: 'Settings',         to: ROUTES.BRAND_SETTINGS       },
];

export default function BrandSidebar() {
  const { logout, user } = useAuth();
  const { unreadCount }  = useNotification();
  const msgCount         = useMessageCount();
  const collabCount      = useCollabRequestsCount();

  const profile     = user?.profile ?? {};
  const displayName = profile.companyName || user?.email?.split('@')[0] || 'Brand';
  const avatarUrl   = profile.logoUrl || profile.avatarUrl || null;
  const initials    = displayName.slice(0, 2).toUpperCase();

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('cc-sidebar-collapsed') === 'true'; } catch { return false; }
  });

  const toggle = () => {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem('cc-sidebar-collapsed', String(next)); } catch {}
      return next;
    });
  };

  const c = collapsed;

  return (
    <aside
      className="flex-shrink-0 flex flex-col min-h-screen border-r transition-all duration-300"
      style={{ width: c ? 64 : 220, background: 'var(--surface)', borderColor: 'var(--border)', overflow: 'hidden' }}
    >
      {/* Logo + toggle */}
      <div
        className="flex items-center border-b"
        style={{ borderColor: 'var(--border)', padding: c ? '18px 0' : '18px 20px', justifyContent: c ? 'center' : 'space-between', gap: 8 }}
      >
        {!c && <Logo size={24} />}
        <button
          onClick={toggle}
          title={c ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg transition-colors flex-shrink-0"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 12 }}
        >
          {c ? '›' : '‹'}
        </button>
      </div>

      {/* User pill */}
      <div className="border-b" style={{ borderColor: 'var(--border)', padding: c ? '10px 8px' : '10px 16px' }}>
        <div
          className="flex items-center rounded-xl"
          style={{ background: 'var(--surface-2)', padding: c ? '6px' : '6px 8px', gap: c ? 0 : 10, justifyContent: c ? 'center' : 'flex-start' }}
          title={c ? displayName : undefined}
        >
          {avatarUrl ? (
            <img
              src={resolveMediaUrl(avatarUrl)}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className="w-8 h-8 rounded-full items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', display: avatarUrl ? 'none' : 'flex' }}
          >
            {initials}
          </div>
          {!c && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-fg truncate">{displayName}</p>
              <p className="text-[10px] text-fg-muted">Brand account</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5" style={{ padding: c ? '12px 8px' : '12px' }}>
        {!c && <p className="text-[10px] font-semibold text-fg-muted uppercase tracking-widest px-2 mb-2 mt-1">Menu</p>}
        {NAV.map(({ icon, label, to }) => {
          const isMessages = to === ROUTES.BRAND_MESSAGES;
          const isCollabs  = to === ROUTES.BRAND_COLLABORATIONS;
          const badge      = isMessages ? msgCount : isCollabs ? collabCount : 0;
          return (
            <NavLink
              key={to}
              to={to}
              title={c ? `${label}${badge ? ` (${badge})` : ''}` : undefined}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}${c ? ' !px-0 justify-center' : ''}`}
            >
              <span className="text-base flex-shrink-0 leading-none relative" style={{ width: c ? 'auto' : 20 }}>
                {icon}
                {c && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center" style={{ background: 'var(--brand-500)' }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              {!c && <span className="truncate">{label}</span>}
              {!c && badge > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: 'var(--brand-500)' }}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t space-y-2" style={{ borderColor: 'var(--border)', padding: c ? '12px 8px' : '12px' }}>
        <ThemeToggle variant={c ? 'icon' : 'full'} />

        <NavLink
          to={ROUTES.BRAND_REMINDERS}
          title={c ? 'Reminders' : undefined}
          className={({ isActive }) => `sidebar-link w-full${isActive ? ' active' : ''}${c ? ' !px-0 justify-center' : ''}`}
        >
          <span className="text-base flex-shrink-0" style={{ width: c ? 'auto' : 20 }}>🔔</span>
          {!c && <span>Reminders</span>}
        </NavLink>

        <NavLink
          to={ROUTES.BRAND_NOTIFICATIONS}
          title={c ? `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` : undefined}
          className={({ isActive }) => `sidebar-link w-full relative${isActive ? ' active' : ''}${c ? ' !px-0 justify-center' : ''}`}
        >
          <span className="text-base flex-shrink-0 relative" style={{ width: c ? 'auto' : 20 }}>
            🔔
            {c && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center" style={{ background: 'var(--brand-500)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
          {!c && <span>Notifications</span>}
          {!c && unreadCount > 0 && (
            <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: 'var(--brand-500)' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>

        <button
          onClick={logout}
          title={c ? 'Log Out' : undefined}
          className={`sidebar-link w-full !text-danger hover:!bg-danger/10${c ? ' !px-0 justify-center' : ''}`}
        >
          <span className="text-base flex-shrink-0" style={{ width: c ? 'auto' : 20 }}>←</span>
          {!c && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
