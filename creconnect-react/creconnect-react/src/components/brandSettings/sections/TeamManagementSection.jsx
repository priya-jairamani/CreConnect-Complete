import { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const ROLES = ['Owner', 'Admin', 'Campaign Manager', 'Recruiter', 'Analyst'];

const ROLE_BADGE = {
  Owner: 'brand',
  Admin: 'success',
  'Campaign Manager': 'accent',
  Recruiter: 'warning',
  Analyst: 'neutral',
};

function MemberCard({ member, onRoleChange, onRemove }) {
  return (
    <div className="card rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ background: member.avatarColor }}
      >
        {member.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-fg font-medium text-sm truncate">{member.name}</p>
          {member.status === 'pending' && <Badge variant="warning" label="Invited" />}
        </div>
        <p className="text-fg-muted text-xs truncate">{member.email}</p>
        <p className="text-fg-muted text-[11px] mt-0.5">{member.lastActive}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {member.role === 'Owner' ? (
          <Badge variant={ROLE_BADGE[member.role]} label={member.role} />
        ) : (
          <select
            className="input-base text-xs py-1.5"
            value={member.role}
            onChange={(e) => onRoleChange(member.id, e.target.value)}
          >
            {ROLES.filter((r) => r !== 'Owner').map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
        {member.role !== 'Owner' && (
          <button
            type="button"
            onClick={() => onRemove(member.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-danger hover:bg-danger/10 transition-colors"
            aria-label={`Remove ${member.name}`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
MemberCard.propTypes = {
  member: PropTypes.object.isRequired,
  onRoleChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default function TeamManagementSection({ members, onInvite, onRoleChange, onRemove, onViewActivity }) {
  const [email, setEmail] = useState('');

  const handleInvite = () => {
    if (!email.trim()) return;
    onInvite(email.trim());
    setEmail('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input name="inviteEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" className="flex-1" />
        <Button variant="primary" size="md" onClick={handleInvite}>+ Invite Team Member</Button>
        <Button variant="ghost" size="md" onClick={onViewActivity}>📜 Activity Log</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} onRoleChange={onRoleChange} onRemove={onRemove} />
        ))}
      </div>

      <div className="rounded-xl px-4 py-3 text-xs text-fg-muted" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <strong className="text-fg">Roles:</strong> Owner has full access. Admin manages workspace settings. Campaign Manager creates and runs campaigns. Recruiter reviews creator applications. Analyst has read-only access to reports.
      </div>
    </div>
  );
}

TeamManagementSection.propTypes = {
  members: PropTypes.array.isRequired,
  onInvite: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onViewActivity: PropTypes.func.isRequired,
};
