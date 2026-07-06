import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/api/admin.api';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import { timeAgo } from '@/utils/formatters';

const TABS = [
  { id: 'support', label: 'Support Tickets', icon: '🎧' },
  { id: 'registrations', label: 'Pending Users', icon: '📝' },
];

const TICKET_STATUS_VARIANT = {
  OPEN: 'warning',
  IN_PROGRESS: 'brand',
  RESOLVED: 'success',
  CLOSED: 'neutral',
};

const PRIORITY_VARIANT = {
  LOW: 'neutral',
  MEDIUM: 'brand',
  HIGH: 'warning',
  URGENT: 'danger',
};

function unwrapList(res) {
  return Array.isArray(res?.data) ? res.data : [];
}

function displayName(user) {
  return user?.creatorProfile?.displayName || user?.brandProfile?.companyName || user?.email || '—';
}

export default function LiveOperations() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('support');
  const [tickets, setTickets] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    return Promise.all([
      adminApi.getTickets({ limit: 100 }),
      adminApi.getUsers({ status: 'PENDING', limit: 100 }),
    ])
      .then(([ticketRes, userRes]) => {
        setTickets(unwrapList(ticketRes));
        setPendingUsers(unwrapList(userRes));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateTicketStatus(id, status) {
    try {
      await adminApi.updateTicket(id, { status });
      toast.success(`Ticket ${status.toLowerCase().replace('_', ' ')}.`);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to update ticket.');
    }
  }

  async function updateUserStatus(user, status) {
    try {
      await adminApi.updateStatus(user.id, { status });
      toast.success(`${displayName(user)} ${status.toLowerCase()}.`);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to update user.');
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-danger text-sm">Could not load operations data from the server.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Operations
          </h1>
          <Badge variant="success">Live data</Badge>
        </div>
        <p className="text-fg-muted text-sm">Support tickets and pending registrations from the database.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="card rounded-2xl p-4">
          <p className="text-xs text-fg-muted">Open tickets</p>
          <p className="text-2xl font-bold text-fg">{tickets.filter((t) => t.status === 'OPEN').length}</p>
        </div>
        <div className="card rounded-2xl p-4">
          <p className="text-xs text-fg-muted">Pending users</p>
          <p className="text-2xl font-bold text-fg">{pendingUsers.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              activeTab === tab.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'support' && (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-fg-muted" style={{ background: 'var(--surface-2)' }}>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-3 py-3 text-left">Category</th>
                <th className="px-3 py-3 text-center">Priority</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-right">Created</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-fg-muted">No support tickets yet.</td></tr>
              ) : tickets.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="text-fg font-medium">{t.subject}</p>
                    <p className="text-xs text-fg-muted line-clamp-1">{t.description}</p>
                  </td>
                  <td className="px-3 py-3 text-fg-muted">{t.category || '—'}</td>
                  <td className="px-3 py-3 text-center">
                    <Badge variant={PRIORITY_VARIANT[t.priority] || 'neutral'} label={t.priority} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Badge variant={TICKET_STATUS_VARIANT[t.status] || 'neutral'} label={t.status} />
                  </td>
                  <td className="px-3 py-3 text-right text-fg-muted text-xs">{timeAgo(t.createdAt)}</td>
                  <td className="px-3 py-3 text-right">
                    {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                      <div className="flex gap-1 justify-end">
                        {t.status === 'OPEN' && (
                          <Button size="xs" variant="secondary" onClick={() => updateTicketStatus(t.id, 'IN_PROGRESS')}>Start</Button>
                        )}
                        <Button size="xs" variant="success" onClick={() => updateTicketStatus(t.id, 'RESOLVED')}>Resolve</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'registrations' && (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-fg-muted" style={{ background: 'var(--surface-2)' }}>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-3 py-3 text-left">Role</th>
                <th className="px-3 py-3 text-right">Registered</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-fg-muted">No pending registrations.</td></tr>
              ) : pendingUsers.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="text-fg font-medium">{displayName(u)}</p>
                    <p className="text-xs text-fg-muted">{u.email}</p>
                  </td>
                  <td className="px-3 py-3 text-fg-muted">{u.role}</td>
                  <td className="px-3 py-3 text-right text-fg-muted text-xs">{timeAgo(u.createdAt)}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="xs" variant="success" onClick={() => updateUserStatus(u, 'APPROVED')}>Approve</Button>
                      <Button size="xs" variant="secondary" onClick={() => updateUserStatus(u, 'REJECTED')}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
