import PropTypes from 'prop-types';
import Switch from '@/components/common/Switch';

const CATEGORIES = [
  { key: 'campaign', icon: '📣', label: 'Campaign Notifications', description: 'Campaign published, paused, ending soon, or completed' },
  { key: 'messages', icon: '💬', label: 'Message Notifications', description: 'New messages from creators' },
  { key: 'applications', icon: '📥', label: 'Creator Applications', description: 'New applications and status changes' },
  { key: 'payments', icon: '💳', label: 'Payment Notifications', description: 'Invoices, escrow releases, and payouts' },
  { key: 'system', icon: '⚙️', label: 'System Notifications', description: 'Platform updates, maintenance, and security alerts' },
];

const CHANNELS = [
  { key: 'email', icon: '✉️', label: 'Email Notifications' },
  { key: 'push', icon: '🔔', label: 'Push Notifications' },
  { key: 'sms', icon: '📱', label: 'SMS Notifications' },
];

export default function NotificationsSection({ values, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Notification Categories</h3>
        <div className="space-y-1">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <Switch
                checked={Boolean(values.categories?.[c.key])}
                onChange={(v) => onChange('categories', { ...values.categories, [c.key]: v })}
                label={`${c.icon} ${c.label}`}
                description={c.description}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Delivery Channels</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {CHANNELS.map((c) => (
            <div key={c.key} className="card rounded-2xl p-4" style={{ background: 'var(--surface-2)' }}>
              <Switch
                checked={Boolean(values.channels?.[c.key])}
                onChange={(v) => onChange('channels', { ...values.channels, [c.key]: v })}
                label={`${c.icon} ${c.label}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

NotificationsSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
