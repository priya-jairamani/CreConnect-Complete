import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/api/admin.api';
import NotificationsPage from '@/components/notifications/NotificationsPage';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

const PAGE_TABS = [
  { id: 'inbox', label: 'My Inbox', icon: '📥' },
  { id: 'broadcast', label: 'Broadcast Center', icon: '📡' },
];

const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'All users' },
  { value: 'CREATORS', label: 'Creators only' },
  { value: 'BRANDS', label: 'Brands only' },
];

const TYPE_OPTIONS = [
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'SYSTEM', label: 'System update' },
  { value: 'REMINDER_UPCOMING', label: 'Reminder' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusVariant(status) {
  switch (status?.toUpperCase()) {
    case 'SENT': return 'success';
    case 'PENDING': return 'warning';
    case 'FAILED': return 'danger';
    default: return 'neutral';
  }
}

function BroadcastCenter() {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [failed, setFailed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('ALL');
  const [type, setType] = useState('ANNOUNCEMENT');

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sentRes, failedRes] = await Promise.all([
        adminApi.getNotifications({ limit: 50 }),
        adminApi.getFailedNotifications({ limit: 20 }),
      ]);
      const sentList = Array.isArray(sentRes.data) ? sentRes.data : [];
      const failedList = Array.isArray(failedRes.data) ? failedRes.data : [];
      setHistory(sentList);
      setFailed(failedList);
    } catch {
      toast.error('Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const stats = useMemo(() => ({
    total: history.length,
    sent: history.filter((n) => n.status === 'SENT').length,
    pending: history.filter((n) => n.status === 'PENDING').length,
    failed: failed.length,
  }), [history, failed]);

  async function handleSend(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await adminApi.sendPushNotification({
        message: message.trim(),
        audience,
        type,
        deliveryMode: 'IMMEDIATE',
      });
      toast.success('Notification broadcast sent');
      setMessage('');
      await loadHistory();
    } catch (err) {
      toast.error(err?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'total', label: 'Total Broadcasts', icon: '📡', accent: '#6d5cff' },
          { key: 'sent', label: 'Delivered', icon: '✅', accent: '#16b364' },
          { key: 'pending', label: 'Scheduled', icon: '🕒', accent: '#f59e0b' },
          { key: 'failed', label: 'Failed', icon: '⚠', accent: '#f04456' },
        ].map((tile) => (
          <div key={tile.key} className="card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{tile.icon}</span>
              <span className="text-xs text-fg-muted font-medium">{tile.label}</span>
            </div>
            <p className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
              {stats[tile.key]}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="card rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Send broadcast
          </h2>
          <p className="text-fg-muted text-sm mt-0.5">
            Push an in-app notification to users on the platform. Delivered instantly via WebSocket.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fg">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="input-base w-full"
            >
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fg">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-base w-full"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Write your platform notification…"
            className="input-base resize-none w-full"
            maxLength={2000}
          />
          <p className="text-xs text-fg-muted text-right">{message.length}/2000</p>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!message.trim() || sending}
            isLoading={sending}
          >
            Send notification
          </Button>
        </div>
      </form>

      <div className="card rounded-2xl overflow-hidden">
        <div
          className="px-5 py-4 flex items-center justify-between gap-3"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
        >
          <div>
            <h2 className="text-sm font-semibold text-fg">Broadcast history</h2>
            <p className="text-xs text-fg-muted mt-0.5">Recent platform notifications sent by admins</p>
          </div>
          <Button variant="ghost" size="xs" onClick={loadHistory}>Refresh</Button>
        </div>

        <div
          className="grid grid-cols-6 px-5 py-3 text-xs uppercase tracking-wider font-semibold text-fg-muted"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="col-span-2">Message</span>
          <span>Audience</span>
          <span>Recipients</span>
          <span>Status</span>
          <span>Sent</span>
        </div>

        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 m-2 rounded-xl" />)
          : history.length === 0
            ? (
              <EmptyState
                icon="📡"
                title="No broadcasts yet"
                message="Send your first platform notification using the form above."
              />
            )
            : history.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-6 px-5 py-3.5 items-center text-sm gap-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span className="col-span-2 text-fg truncate" title={item.message}>{item.message}</span>
                <Badge variant="brand" label={item.audience || 'ALL'} />
                <span className="text-fg-muted">{item.recipientCount ?? '—'}</span>
                <Badge variant={statusVariant(item.status)} label={item.status || 'SENT'} />
                <span className="text-fg-muted text-xs">{formatDate(item.createdAt)}</span>
              </div>
            ))}
      </div>

      {failed.length > 0 && (
        <div className="card rounded-2xl overflow-hidden">
          <div
            className="px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(240,68,95,0.06)' }}
          >
            <h2 className="text-sm font-semibold text-danger">Failed deliveries</h2>
            <p className="text-xs text-fg-muted mt-0.5">Notifications that could not be delivered</p>
          </div>
          {failed.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-6 px-5 py-3.5 items-center text-sm gap-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="col-span-2 text-fg truncate">{item.message}</span>
              <Badge variant="brand" label={item.audience || 'ALL'} />
              <span className="text-fg-muted">{item.recipientCount ?? 0}</span>
              <Badge variant="danger" label="FAILED" />
              <span className="text-fg-muted text-xs">{formatDate(item.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminNotifications() {
  const [tab, setTab] = useState('inbox');

  return (
    <div className="p-6 space-y-6 page-enter">
      <header>
        <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Notifications
        </h1>
        <p className="text-fg-muted text-sm mt-0.5">
          Your admin inbox and platform-wide notification broadcasts.
        </p>
      </header>

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--surface-2)' }}>
        {PAGE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === t.id
              ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
              : { color: 'var(--fg-muted)' }
            }
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'inbox'
        ? <NotificationsPage embedded />
        : <BroadcastCenter />}
    </div>
  );
}
