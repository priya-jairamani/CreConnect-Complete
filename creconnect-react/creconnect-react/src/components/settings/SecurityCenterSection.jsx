import PropTypes from 'prop-types';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import Badge from '@/components/common/Badge';
import { timeAgo } from '@/utils/formatters';
import GenericSettingsSection from './GenericSettingsSection';
import PermissionMatrix from './PermissionMatrix';
import SecurityHealthCard from './SecurityHealthCard';
import { ACCESS_CONTROL_MATRIX } from '@/utils/mockSettings';

const SEVERITY_VARIANT = { high: 'danger', medium: 'warning', low: 'neutral' };

/** Enterprise security controls — authentication policy, role/access matrix, security health & live monitoring. */
export default function SecurityCenterSection({
  values, onChange, modifiedFields, highlightFieldId,
  accessMatrix, onToggleAccess,
  securityHealthScore, securityHealthFactors,
  monitoringStats, securityEvents,
}) {
  return (
    <div className="space-y-5">
      <SecurityHealthCard score={securityHealthScore} factors={securityHealthFactors} />

      <GenericSettingsSection
        sectionId="security"
        values={values}
        onChange={onChange}
        modifiedFields={modifiedFields}
        highlightFieldId={highlightFieldId}
      />

      <PermissionMatrix
        title={ACCESS_CONTROL_MATRIX.title}
        description={ACCESS_CONTROL_MATRIX.description}
        rows={ACCESS_CONTROL_MATRIX.rows}
        columns={ACCESS_CONTROL_MATRIX.columns}
        value={accessMatrix}
        onToggle={onToggleAccess}
      />

      <CollapsibleSection icon="📡" title="Security Monitoring" subtitle="Live signals from authentication & access systems.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Failed Logins (24h)', value: monitoringStats.failedLogins },
              { label: 'Suspicious Logins', value: monitoringStats.suspiciousLogins },
              { label: 'Access Attempts', value: monitoringStats.accessAttempts },
              { label: 'Privilege Escalation Events', value: monitoringStats.privilegeEscalationEvents },
            ].map((m) => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-xs text-fg-muted">{m.label}</p>
                <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {securityEvents.map((event) => (
              <div key={event.id} className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-2)' }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={SEVERITY_VARIANT[event.severity] ?? 'neutral'} label={event.severity} dot />
                    <p className="text-sm text-fg">{event.description}</p>
                  </div>
                  <p className="text-xs text-fg-muted mt-0.5">{event.actor} · {event.location}</p>
                </div>
                <span className="text-xs text-fg-muted whitespace-nowrap">{timeAgo(event.timestamp)} ago</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

SecurityCenterSection.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  accessMatrix: PropTypes.object.isRequired,
  onToggleAccess: PropTypes.func.isRequired,
  securityHealthScore: PropTypes.number.isRequired,
  securityHealthFactors: PropTypes.arrayOf(PropTypes.object).isRequired,
  monitoringStats: PropTypes.shape({
    failedLogins: PropTypes.number.isRequired,
    suspiciousLogins: PropTypes.number.isRequired,
    accessAttempts: PropTypes.number.isRequired,
    privilegeEscalationEvents: PropTypes.number.isRequired,
  }).isRequired,
  securityEvents: PropTypes.arrayOf(PropTypes.object).isRequired,
};
