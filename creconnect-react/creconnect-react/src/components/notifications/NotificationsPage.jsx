import { useState, useMemo, useEffect } from 'react';
import { useNotificationContext } from '@/context/NotificationContext';
import NotificationItem, { FILTER_TABS, getCategory } from '@/components/notifications/NotificationItem';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';

export default function NotificationsPage({ embedded = false }) {
  // Use context directly — the sidebar already triggers fetchNotifications() on mount.
  // Re-fetching here would overwrite locally-pushed notifications and flicker the count.
  const { notifications, unreadCount, markRead, markAllRead, isLoading } = useNotificationContext();

  // Mark all as read 2 seconds after the page is opened so the user can see them first
  useEffect(() => {
    if (unreadCount === 0) return;
    const t = setTimeout(() => markAllRead(), 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all')    return notifications;
    if (filter === 'unread') return notifications.filter((n) => !(n.isRead ?? n.read ?? false));
    return notifications.filter((n) => getCategory(n.type) === filter);
  }, [notifications, filter]);

  const counts = useMemo(() => {
    const c = { all: notifications.length, unread: 0, collaborations: 0, messages: 0, payments: 0, reminders: 0, system: 0 };
    notifications.forEach((n) => {
      if (!(n.isRead ?? n.read ?? false)) c.unread += 1;
      const cat = getCategory(n.type);
      if (c[cat] !== undefined) c[cat] += 1;
    });
    return c;
  }, [notifications]);

  return (
    <div className={embedded ? 'space-y-5 max-w-2xl' : 'p-6 space-y-5 max-w-2xl'}>

      {/* Header */}
      {!embedded ? (
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                className="text-xs font-bold text-white px-2.5 py-0.5 rounded-full"
                style={{ background: 'var(--brand-500)' }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-fg-muted text-sm mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up — no new notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            ✓ Mark all read
          </Button>
        )}
      </header>
      ) : unreadCount > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-fg-muted">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          <Button variant="ghost" size="sm" onClick={markAllRead}>✓ Mark all read</Button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={
              filter === tab.key
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className="px-1.5 rounded-full text-[10px] font-bold"
                style={
                  filter === tab.key
                    ? { background: 'rgba(255,255,255,0.25)' }
                    : { background: 'rgba(109,92,255,0.15)', color: 'var(--brand-400)' }
                }
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔔"
            title={filter === 'all' ? 'All caught up' : 'Nothing here'}
            message={
              filter === 'all'
                ? 'No notifications yet. Activity from campaigns, collaborations, payments, and reminders will appear here.'
                : 'No notifications match this filter.'
            }
          />
        ) : (
          filtered.map((n, idx) => (
            <div
              key={n.id}
              style={idx < filtered.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
            >
              <NotificationItem notification={n} onMarkRead={markRead} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
