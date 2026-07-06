import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { searchApi } from '@/api/search.api';
import Avatar from '@/components/common/Avatar';

const COMMANDS_BY_ROLE = {
  creator: [
    { icon: '⊞', label: 'Go to Dashboard',    to: ROUTES.CREATOR_DASHBOARD,  keywords: 'home overview' },
    { icon: '◎', label: 'Find Brands',        to: ROUTES.CREATOR_FIND_BRANDS, keywords: 'search discover' },
    { icon: '◈', label: 'My Collaborations',  to: ROUTES.CREATOR_COLLABS,    keywords: 'campaigns deals' },
    { icon: '◉', label: 'Messages',           to: ROUTES.CREATOR_MESSAGES,   keywords: 'chat inbox' },
    { icon: '✦', label: 'My Profile',         to: ROUTES.CREATOR_PROFILE,    keywords: 'media kit' },
    { icon: '⚙', label: 'Edit Information',   to: ROUTES.CREATOR_INFO,       keywords: 'settings account' },
    { icon: '🔔', label: 'Notifications',      to: ROUTES.CREATOR_NOTIFS,     keywords: 'alerts' },
  ],
  brand: [
    { icon: '⊞', label: 'Go to Dashboard',     to: ROUTES.BRAND_DASHBOARD,      keywords: 'home overview' },
    { icon: '◎', label: 'Search Creators',     to: ROUTES.BRAND_SEARCH,         keywords: 'discover find' },
    { icon: '◈', label: 'Campaigns',           to: ROUTES.BRAND_CAMPAIGNS,      keywords: 'create manage' },
    { icon: '✦', label: 'Send Collab Request', to: ROUTES.BRAND_COLLAB_REQUEST, keywords: 'offer outreach' },
    { icon: '◉', label: 'Messages',            to: ROUTES.BRAND_MESSAGES,       keywords: 'chat inbox' },
    { icon: '🔔', label: 'Reminders',           to: ROUTES.BRAND_REMINDERS,      keywords: 'tasks alerts' },
    { icon: '⚙', label: 'Settings',            to: ROUTES.BRAND_SETTINGS,       keywords: 'account company' },
  ],
  admin: [
    { icon: '⊞', label: 'Go to Dashboard',  to: ROUTES.ADMIN_DASHBOARD, keywords: 'home overview' },
    { icon: '◎', label: 'User Management',  to: ROUTES.ADMIN_USERS,     keywords: 'users accounts' },
    { icon: '◆', label: 'Campaigns',         to: ROUTES.ADMIN_CAMPAIGNS, keywords: 'campaigns operations creators brands' },
    { icon: '◈', label: 'Content Moderation', to: ROUTES.ADMIN_CONTENT, keywords: 'reports flags' },
    { icon: '✦', label: 'Reports',          to: ROUTES.ADMIN_REPORTS,   keywords: 'analytics' },
    { icon: '🛡', label: 'Trust & Safety',   to: ROUTES.ADMIN_TRUST_SAFETY, keywords: 'fraud disputes investigations risk moderation' },
    { icon: '💰', label: 'Revenue & Payments', to: ROUTES.ADMIN_REVENUE, keywords: 'revenue payments finance transactions payouts escrow' },
    { icon: '🧭', label: 'Operations', to: ROUTES.ADMIN_OPERATIONS, keywords: 'operations support tickets incidents activity ai copilot command center' },
    { icon: '🔔', label: 'Notifications', to: ROUTES.ADMIN_NOTIFICATIONS, keywords: 'notifications broadcast announce push inbox alerts' },
    { icon: '⚙', label: 'Settings',         to: ROUTES.ADMIN_SETTINGS,  keywords: 'config governance platform configuration creator system brand system marketplace rules trust safety privacy compliance ai automation security integrations billing revenue' },
  ],
};

export default function CommandPalette({ role }) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [active,  setActive]  = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const commands = COMMANDS_BY_ROLE[role] ?? [];

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.keywords?.includes(q));
  }, [commands, query]);

  // ── Global hotkey ────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setActive(0);
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Live search (creators for brand, brands for creator) ────────
  useEffect(() => {
    if (!isOpen || !query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const fn = role === 'brand' ? searchApi.creators : searchApi.brands;
        const { data } = await fn({ q: query.trim() });
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        if (!cancelled) setResults(list.slice(0, 5));
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, isOpen, role]);

  const goTo = useCallback((to) => {
    setIsOpen(false);
    navigate(to);
  }, [navigate]);

  const totalItems = filteredCommands.length + results.length;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active < filteredCommands.length) {
        goTo(filteredCommands[active]?.to);
      } else {
        const item = results[active - filteredCommands.length];
        if (item) {
          const to = role === 'brand' ? `${ROUTES.BRAND_SEARCH}?q=${encodeURIComponent(item.username || item.displayName || '')}` : `${ROUTES.CREATOR_FIND_BRANDS}?q=${encodeURIComponent(item.companyName || item.displayName || '')}`;
          goTo(to);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4" onClick={() => setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden animate-fade-up shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-brand-400 text-lg">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={handleKeyDown}
            placeholder={role === 'brand' ? 'Search creators, navigate, or run a command…' : 'Search brands, navigate, or run a command…'}
            className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-fg-muted"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded text-fg-muted" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filteredCommands.length > 0 && (
            <div className="mb-1">
              <p className="text-[10px] font-semibold text-fg-muted uppercase tracking-widest px-3 py-1.5">Navigate</p>
              {filteredCommands.map((c, i) => (
                <button
                  key={c.to}
                  onClick={() => goTo(c.to)}
                  onMouseEnter={() => setActive(i)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
                  style={active === i ? { background: 'rgba(109,92,255,0.12)', color: 'var(--brand-400)' } : { color: 'var(--fg)' }}
                >
                  <span className="w-5 text-center flex-shrink-0">{c.icon}</span>
                  <span className="flex-1">{c.label}</span>
                  <span className="text-fg-muted text-xs">↵</span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && (
            <div>
              <p className="text-[10px] font-semibold text-fg-muted uppercase tracking-widest px-3 py-1.5">
                {role === 'brand' ? 'Creators' : 'Brands'} {isSearching && '· searching…'}
              </p>
              {results.length === 0 && !isSearching && (
                <p className="px-3 py-2.5 text-sm text-fg-muted">No matches found</p>
              )}
              {results.map((item, i) => {
                const idx = filteredCommands.length + i;
                const name = item.displayName || item.companyName || item.username || 'Unknown';
                const sub = item.niche || item.industry || '';
                return (
                  <button
                    key={item.id || idx}
                    onClick={() => {
                      const to = role === 'brand'
                        ? `${ROUTES.BRAND_SEARCH}?q=${encodeURIComponent(name)}`
                        : `${ROUTES.CREATOR_FIND_BRANDS}?q=${encodeURIComponent(name)}`;
                      goTo(to);
                    }}
                    onMouseEnter={() => setActive(idx)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
                    style={active === idx ? { background: 'rgba(109,92,255,0.12)', color: 'var(--brand-400)' } : { color: 'var(--fg)' }}
                  >
                    <Avatar initials={name.slice(0, 2).toUpperCase()} size="xs" />
                    <span className="flex-1 truncate">{name}</span>
                    {sub && <span className="text-fg-muted text-xs">{sub}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {!query.trim() && (
            <p className="px-3 py-2 text-fg-muted text-xs">
              Type to search, use ↑↓ to navigate, ↵ to select.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

CommandPalette.propTypes = {
  role: PropTypes.oneOf(['creator', 'brand', 'admin']).isRequired,
};
