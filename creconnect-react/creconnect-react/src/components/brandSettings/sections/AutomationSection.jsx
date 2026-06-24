import PropTypes from 'prop-types';
import Switch from '@/components/common/Switch';

const RULES = [
  { key: 'autoApproveCreators', icon: '✅', label: 'Auto-Approve Creators', description: 'Automatically approve applications that meet your screening criteria' },
  { key: 'autoSendInvites', icon: '✉️', label: 'Auto-Send Invites', description: 'Automatically invite recommended creators to new campaigns' },
  { key: 'autoReleasePayments', icon: '💳', label: 'Auto-Release Payments', description: 'Release escrow funds automatically once deliverables are approved' },
  { key: 'smartRecommendations', icon: '🤖', label: 'Smart Campaign Recommendations', description: 'Let AI suggest new campaigns based on your performance data' },
];

export default function AutomationSection({ values, onChange }) {
  return (
    <div className="space-y-1">
      <p className="text-fg-muted text-sm mb-3">Automate repetitive workflows so your team can focus on strategy.</p>
      {RULES.map((r) => (
        <div key={r.key} className="py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
          <Switch
            checked={Boolean(values[r.key])}
            onChange={(v) => onChange(r.key, v)}
            label={`${r.icon} ${r.label}`}
            description={r.description}
          />
        </div>
      ))}
    </div>
  );
}

AutomationSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
