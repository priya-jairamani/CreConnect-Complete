import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Avatar from '@/components/common/Avatar';
import { timeAgo } from '@/utils/formatters';

export default function CollabNotificationsPanel({ isOpen, onClose, notifications, onOpenItem }) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      icon="🔔"
      title="Notifications"
      subtitle={`${notifications.length} update${notifications.length === 1 ? '' : 's'}`}
    >
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <span className="text-3xl mb-3">🔕</span>
          <p className="text-fg font-medium text-sm">You&apos;re all caught up</p>
          <p className="text-fg-muted text-xs mt-1">New collaboration updates will show up here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onOpenItem?.(n.item)}
              className="w-full flex items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-brand-500/10 hover:border-brand-500/40"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <Avatar src={n.item.brandLogo} initials={n.item.brandName?.slice(0, 2)?.toUpperCase()} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-fg text-sm leading-snug">
                  <span className="mr-1">{n.icon}</span>{n.text}
                </p>
                <p className="text-fg-muted text-[11px] mt-1">{timeAgo(new Date(Date.now() - n.hoursAgo * 3600 * 1000))}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Drawer>
  );
}

CollabNotificationsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  onOpenItem: PropTypes.func,
};
