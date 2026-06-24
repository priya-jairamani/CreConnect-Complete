import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';

const GROUPS = [
  { key: 'marketing', label: 'Marketing Team', icon: '📣' },
  { key: 'partnerships', label: 'Partnership Managers', icon: '🤝' },
  { key: 'campaigns', label: 'Campaign Managers', icon: '🗂' },
  { key: 'community', label: 'Community Managers', icon: '💬' },
];

export default function TeamContactsSection({ team, onMessage }) {
  return (
    <div className="space-y-5">
      {GROUPS.map((group) => {
        const members = team[group.key] ?? [];
        if (!members.length) return null;
        return (
          <div key={group.key}>
            <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-2">{group.icon} {group.label}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((m) => (
                <div key={m.id} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <Avatar initials={m.initials} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-fg text-sm font-semibold truncate">{m.name}</p>
                    <p className="text-fg-muted text-xs truncate">{m.role}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onMessage(m)}>💬</Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

TeamContactsSection.propTypes = {
  team: PropTypes.object.isRequired,
  onMessage: PropTypes.func.isRequired,
};
