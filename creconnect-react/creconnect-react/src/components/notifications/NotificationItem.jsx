import PropTypes from 'prop-types';
import { clsx } from 'clsx';
import { timeAgo } from '@/utils/formatters';

export const TYPE_META = {
  CAMPAIGN_INVITE:    { icon: '📨', color: 'rgba(109,92,255,0.12)', category: 'collaborations' },
  COLLAB_REQUEST:     { icon: '🤝', color: 'rgba(109,92,255,0.12)', category: 'collaborations' },
  COLLAB_ACCEPTED:    { icon: '✅', color: 'rgba(22,179,100,0.12)', category: 'collaborations' },
  COLLAB_REJECTED:    { icon: '❌', color: 'rgba(240,68,95,0.12)',  category: 'collaborations' },
  NEW_MESSAGE:        { icon: '💬', color: 'rgba(109,92,255,0.08)', category: 'messages' },
  PAYMENT_RELEASED:   { icon: '💰', color: 'rgba(22,179,100,0.12)', category: 'payments' },
  PAYMENT_RECEIVED:   { icon: '💰', color: 'rgba(22,179,100,0.12)', category: 'payments' },
  REVIEW_RECEIVED:    { icon: '⭐', color: 'rgba(245,166,35,0.12)', category: 'system' },
  REPORT_UPDATE:      { icon: '🚩', color: 'rgba(245,166,35,0.12)', category: 'system' },
  SYSTEM:             { icon: '🔔', color: 'rgba(155,161,182,0.10)', category: 'system' },
  ANNOUNCEMENT:       { icon: '📢', color: 'rgba(109,92,255,0.12)', category: 'system' },
  ACCOUNT_APPROVED:   { icon: '✅', color: 'rgba(22,179,100,0.12)', category: 'system' },
  ACCOUNT_REJECTED:   { icon: '⚠',  color: 'rgba(240,68,95,0.12)',  category: 'system' },
  REMINDER_DUE:       { icon: '🔔', color: 'rgba(245,166,35,0.12)', category: 'reminders' },
  REMINDER_OVERDUE:   { icon: '⚠',  color: 'rgba(240,68,95,0.12)',  category: 'reminders' },
  REMINDER_UPCOMING:  { icon: '📅', color: 'rgba(109,92,255,0.12)', category: 'reminders' },
};

export const FILTER_TABS = [
  { key: 'all',            label: 'All' },
  { key: 'unread',         label: 'Unread' },
  { key: 'collaborations', label: 'Collaborations' },
  { key: 'messages',       label: 'Messages' },
  { key: 'payments',       label: 'Payments' },
  { key: 'reminders',      label: 'Reminders' },
  { key: 'system',         label: 'System' },
];

export function getCategory(type) {
  return TYPE_META[type]?.category ?? 'system';
}

export default function NotificationItem({ notification, onMarkRead }) {
  const { id, type, title, body, message, createdAt, time, isRead, read } = notification;
  const meta = TYPE_META[type] ?? TYPE_META.SYSTEM;
  const isUnread = !(isRead ?? read ?? false);
  const displayMessage = title ? `${title}${body ? ` — ${body}` : ''}` : (body ?? message ?? '');
  const rawTime = createdAt ? timeAgo(createdAt) : (time ?? '');
  const displayTime = rawTime === 'now' ? 'just now' : rawTime ? `${rawTime} ago` : '';

  return (
    <button
      className={clsx(
        'w-full flex items-start gap-3 px-5 py-4 text-left transition-colors',
        isUnread ? 'hover:bg-white/[0.04]' : 'hover:bg-white/[0.02]'
      )}
      style={isUnread ? { background: 'rgba(109,92,255,0.04)' } : {}}
      onClick={() => isUnread && onMarkRead?.(id)}
    >
      {/* Icon bubble */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: meta.color }}
      >
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm leading-snug', isUnread ? 'text-fg font-medium' : 'text-fg-muted')}>
          {displayMessage}
        </p>
        {displayTime && <p className="text-fg-muted text-xs mt-0.5">{displayTime}</p>}
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div
          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
          style={{ background: 'var(--brand-500)' }}
        />
      )}
    </button>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id:        PropTypes.string.isRequired,
    type:      PropTypes.string,
    title:     PropTypes.string,
    body:      PropTypes.string,
    message:   PropTypes.string,
    createdAt: PropTypes.string,
    time:      PropTypes.string,
    isRead:    PropTypes.bool,
    read:      PropTypes.bool,
  }).isRequired,
  onMarkRead: PropTypes.func,
};
