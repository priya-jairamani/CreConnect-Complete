import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/api/admin.api';

import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Skeleton, { SkeletonRow } from '@/components/common/Skeleton';
import Drawer from '@/components/common/Drawer';

import { timeAgo } from '@/utils/formatters';

// The backend caps `limit` at 100 per request (see pagination.js), and the
// shared axios client unwraps the `{ success, data, meta }` envelope down to
// just the array (see api/client.js), so pagination `meta` isn't available
// here. We page through results 100 at a time via "Load more" instead.
const PAGE_SIZE = 100;

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'creators', label: 'Creators', icon: '✦', role: 'CREATOR' },
  { id: 'brands', label: 'Brands', icon: '🏢', role: 'BRAND' },
  { id: 'verification', label: 'Pending Verification', icon: '🛂', status: 'PENDING' },
  { id: 'suspended', label: 'Suspended Accounts', icon: '⛔', status: 'SUSPENDED' },
];

const STATUS_META = {
  APPROVED:  { label: 'Approved',  variant: 'success' },
  PENDING:   { label: 'Pending',   variant: 'warning' },
  SUSPENDED: { label: 'Suspended', variant: 'danger' },
  REJECTED:  { label: 'Rejected',  variant: 'accent' },
};

const ROLE_LABELS = { CREATOR: 'Creator', BRAND: 'Brand', ADMIN: 'Admin' };

const STATUS_ACTION_MESSAGE = {
  APPROVED:  'approved',
  SUSPENDED: 'suspended',
  REJECTED:  'rejected',
  PENDING:   'moved back to pending',
};

const OVERVIEW_STATS = [
  { key: 'total',     label: 'Total Users',           icon: '👥', accent: '#6d5cff' },
  { key: 'creators',  label: 'Creators',              icon: '✦',  accent: '#857fff' },
  { key: 'brands',    label: 'Brands',                icon: '🏢', accent: '#f59e0b' },
  { key: 'pending',   label: 'Pending Verification',  icon: '🛂', accent: '#22c1ff' },
  { key: 'suspended', label: 'Suspended',              icon: '⛔', accent: '#f0445f' },
];

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function getDisplayName(user) {
  return user.creatorProfile?.displayName || user.brandProfile?.companyName || user.email;
}

function getSubLabel(user) {
  if (user.creatorProfile?.username) return `@${user.creatorProfile.username}`;
  return ROLE_LABELS[user.role] ?? user.role;
}

function unwrapList(data) {
  return Array.isArray(data) ? data : (data?.data ?? []);
}

function countOf(res) {
  return unwrapList(res?.data).length;
}

export default function UserManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [counts, setCounts] = useState({ total: 0, creators: 0, brands: 0, pending: 0, suspended: 0 });
  const [countsLoading, setCountsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionId, setActionId] = useState(null);

  const activeTabDef = TABS.find((t) => t.id === activeTab);

  // Debounce the search box before it becomes a `q` query param.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCounts = useCallback(() => {
    setCountsLoading(true);
    const base = { limit: PAGE_SIZE };
    Promise.all([
      adminApi.getUsers(base),
      adminApi.getUsers({ ...base, role: 'CREATOR' }),
      adminApi.getUsers({ ...base, role: 'BRAND' }),
      adminApi.getUsers({ ...base, status: 'PENDING' }),
      adminApi.getUsers({ ...base, status: 'SUSPENDED' }),
    ])
      .then(([all, creators, brands, pending, suspended]) => {
        setCounts({
          total: countOf(all),
          creators: countOf(creators),
          brands: countOf(brands),
          pending: countOf(pending),
          suspended: countOf(suspended),
        });
      })
      .catch(() => {})
      .finally(() => setCountsLoading(false));
  }, []);

  const fetchUsers = useCallback((targetPage, append) => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab || tab.id === 'overview') return;

    const params = { page: targetPage, limit: PAGE_SIZE };
    if (tab.role) params.role = tab.role;
    if (tab.status) params.status = tab.status;
    if (debouncedSearch) params.q = debouncedSearch;

    if (append) setIsLoadingMore(true); else setIsLoading(true);

    adminApi.getUsers(params)
      .then(({ data }) => {
        const list = unwrapList(data);
        setUsers((prev) => (append ? [...prev, ...list] : list));
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch(() => {
        if (!append) setUsers([]);
        setHasMore(false);
      })
      .finally(() => {
        if (append) setIsLoadingMore(false); else setIsLoading(false);
      });
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    setPage(1);
    if (activeTab === 'overview') {
      fetchCounts();
    } else {
      fetchUsers(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, debouncedSearch]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchUsers(next, true);
  }

  async function handleStatusChange(user, status) {
    setActionId(user.id);
    try {
      await adminApi.updateStatus(user.id, { status });
      toast.success(`${getDisplayName(user)} ${STATUS_ACTION_MESSAGE[status] ?? 'updated'}.`);
      setUsers((prev) => prev
        .map((u) => (u.id === user.id ? { ...u, status } : u))
        .filter((u) => (activeTabDef?.status ? u.status === activeTabDef.status : true)));
      setSelectedUser((prev) => (prev && prev.id === user.id ? { ...prev, status } : prev));
      fetchCounts();
    } catch (err) {
      toast.error(err?.message || 'Failed to update user status.');
    } finally {
      setActionId(null);
    }
  }

  const showRoleColumn = activeTab === 'verification' || activeTab === 'suspended';
  const colSpan = showRoleColumn ? 5 : 4;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Users &amp; Verification
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Review, verify, suspend and manage creators &amp; brands across the marketplace.
          </p>
        </div>
        {activeTab !== 'overview' && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-2 w-full sm:w-72">
            <span>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email…"
              className="bg-transparent outline-none text-sm text-fg placeholder:text-fg-muted flex-1"
            />
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {OVERVIEW_STATS.map((s) => (
            <div key={s.key} className="card rounded-2xl p-5 flex flex-col gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${s.accent}1f`, color: s.accent }}
              >
                {s.icon}
              </div>
              {countsLoading ? (
                <Skeleton height={32} width="60%" />
              ) : (
                <p className="text-3xl text-fg font-700 leading-none" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
                  {counts[s.key].toLocaleString()}
                </p>
              )}
              <p className="text-fg-muted text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users table (Creators / Brands / Verification / Suspended tabs) */}
      {activeTab !== 'overview' && (
        <div className="space-y-4">
          <div className="card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 760 }}>
                <thead>
                  <tr
                    className="text-xs uppercase tracking-wider font-semibold text-fg-muted"
                    style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
                  >
                    <th className="px-4 py-3 text-left min-w-[220px]">User</th>
                    {showRoleColumn && <th className="px-3 py-3 text-left">Role</th>}
                    <th className="px-3 py-3 text-left">Status</th>
                    <th className="px-3 py-3 text-left">Joined</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}><td colSpan={colSpan} className="px-4"><SkeletonRow /></td></tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr><td colSpan={colSpan}><EmptyState icon="🔍" title="No users found" message="Try adjusting your search or switching tabs." /></td></tr>
                  ) : (
                    users.map((u) => {
                      const statusMeta = STATUS_META[u.status] ?? STATUS_META.PENDING;
                      const busy = actionId === u.id;
                      return (
                        <tr
                          key={u.id}
                          className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
                          style={{ borderTop: '1px solid var(--border)' }}
                          onClick={() => setSelectedUser(u)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                initials={getInitials(getDisplayName(u))}
                                size="sm"
                                color={u.role === 'BRAND' ? '#4c2dd1' : undefined}
                              />
                              <div className="min-w-0">
                                <p className="text-fg font-medium truncate">{getDisplayName(u)}</p>
                                <p className="text-fg-muted text-xs truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          {showRoleColumn && (
                            <td className="px-3 py-3"><Badge variant="neutral" label={ROLE_LABELS[u.role] ?? u.role} /></td>
                          )}
                          <td className="px-3 py-3"><Badge variant={statusMeta.variant} label={statusMeta.label} dot /></td>
                          <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{timeAgo(u.createdAt)} ago</td>
                          <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {u.status !== 'APPROVED' && (
                                <Button variant="success" size="xs" disabled={busy} onClick={() => handleStatusChange(u, 'APPROVED')}>
                                  Approve
                                </Button>
                              )}
                              {u.status === 'PENDING' && (
                                <Button variant="danger" size="xs" disabled={busy} onClick={() => handleStatusChange(u, 'REJECTED')}>
                                  Reject
                                </Button>
                              )}
                              {u.status !== 'SUSPENDED' ? (
                                <Button variant="secondary" size="xs" disabled={busy} onClick={() => handleStatusChange(u, 'SUSPENDED')}>
                                  Suspend
                                </Button>
                              ) : (
                                <Button variant="success" size="xs" disabled={busy} onClick={() => handleStatusChange(u, 'APPROVED')}>
                                  Restore
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {hasMore && !isLoading && (
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" isLoading={isLoadingMore} onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}

      {/* User detail drawer */}
      <Drawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        icon={selectedUser?.role === 'BRAND' ? '🏢' : '✦'}
        title={selectedUser ? getDisplayName(selectedUser) : ''}
        subtitle={selectedUser ? `${selectedUser.email} · ${getSubLabel(selectedUser)}` : ''}
        size="lg"
        headerExtra={selectedUser && (
          <Badge variant={(STATUS_META[selectedUser.status] ?? STATUS_META.PENDING).variant} label={(STATUS_META[selectedUser.status] ?? STATUS_META.PENDING).label} dot />
        )}
        footer={selectedUser && (
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {selectedUser.status !== 'APPROVED' && (
              <Button variant="success" size="sm" disabled={actionId === selectedUser.id} onClick={() => handleStatusChange(selectedUser, 'APPROVED')}>
                Approve
              </Button>
            )}
            {selectedUser.status === 'PENDING' && (
              <Button variant="danger" size="sm" disabled={actionId === selectedUser.id} onClick={() => handleStatusChange(selectedUser, 'REJECTED')}>
                Reject
              </Button>
            )}
            {selectedUser.status !== 'SUSPENDED' ? (
              <Button variant="secondary" size="sm" disabled={actionId === selectedUser.id} onClick={() => handleStatusChange(selectedUser, 'SUSPENDED')}>
                Suspend
              </Button>
            ) : (
              <Button variant="success" size="sm" disabled={actionId === selectedUser.id} onClick={() => handleStatusChange(selectedUser, 'APPROVED')}>
                Restore
              </Button>
            )}
          </div>
        )}
      >
        {selectedUser && (
          <div className="p-5 space-y-5">
            <div className="flex items-start gap-4 flex-wrap">
              <Avatar
                initials={getInitials(getDisplayName(selectedUser))}
                size="2xl"
                color={selectedUser.role === 'BRAND' ? '#4c2dd1' : undefined}
              />
              <div className="flex-1 min-w-[200px]">
                <p className="text-fg font-semibold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {getDisplayName(selectedUser)}
                </p>
                <p className="text-fg-muted text-sm">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="neutral" label={ROLE_LABELS[selectedUser.role] ?? selectedUser.role} />
                  {selectedUser.creatorProfile?.username && (
                    <Badge variant="neutral" label={`@${selectedUser.creatorProfile.username}`} />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                <div>
                  <p className="text-fg-muted text-xs">Joined</p>
                  <p className="text-fg font-semibold">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
