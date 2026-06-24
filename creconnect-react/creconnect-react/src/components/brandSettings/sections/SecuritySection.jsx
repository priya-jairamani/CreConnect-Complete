import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';
import Switch from '@/components/common/Switch';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Input from '@/components/common/Input';

export default function SecuritySection({ values, onChange, security }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 card rounded-2xl p-4" style={{ background: 'var(--surface-2)' }}>
        <ScoreRing value={security.score} size={64} strokeWidth={6} />
        <div>
          <p className="text-fg font-semibold">Security Score</p>
          <p className="text-fg-muted text-sm mt-0.5">
            {security.score >= 80 ? 'Your account security is strong.' : 'Enable 2FA and review your active sessions to improve your score.'}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Password Management</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Current Password" name="currentPassword" type="password" value={values.currentPassword} onChange={(e) => onChange('currentPassword', e.target.value)} placeholder="••••••••" />
          <Input label="New Password" name="newPassword" type="password" value={values.newPassword} onChange={(e) => onChange('newPassword', e.target.value)} placeholder="••••••••" />
        </div>
        <Button variant="secondary" size="sm" className="mt-3">Update Password</Button>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Two-Factor Authentication</h3>
        <Switch
          checked={values.twoFactorEnabled}
          onChange={(v) => onChange('twoFactorEnabled', v)}
          label="Enable Two-Factor Authentication"
          description="Add an extra layer of security with an authenticator app or SMS code"
        />
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Session &amp; Device Management</h3>
        <div className="space-y-2">
          {security.devices.map((d) => (
            <div key={d.id} className="card rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
              <span className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">💻</span>
              <div className="min-w-0 flex-1">
                <p className="text-fg font-medium text-sm">{d.name}</p>
                <p className="text-fg-muted text-xs mt-0.5">{d.location} · {d.lastActive}</p>
              </div>
              {d.current ? <Badge variant="success" label="This device" dot /> : <Button variant="ghost" size="xs">Sign out</Button>}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Login Activity &amp; IP History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-fg-muted text-xs uppercase tracking-wide text-left">
                <th className="pb-2 font-medium">Device</th>
                <th className="pb-2 font-medium">IP Address</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {security.loginActivity.map((l) => (
                <tr key={l.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-2 text-fg">{l.device}</td>
                  <td className="py-2 text-fg-muted font-mono text-xs">{l.ip}</td>
                  <td className="py-2 text-fg-muted">{l.location}</td>
                  <td className="py-2 text-fg-muted">{l.time}</td>
                  <td className="py-2"><Badge variant="success" label={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

SecuritySection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  security: PropTypes.object.isRequired,
};
