import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import IncidentTimeline from './IncidentTimeline';
import { INCIDENT_SEVERITY_META, INCIDENT_STATUS_META } from '@/utils/mockOperations';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Incident detail workspace — severity, lifecycle timeline & postmortem. */
export default function IncidentDrawer({ incident, onClose, onAction }) {
  if (!incident) return <Drawer isOpen={false} onClose={onClose} />;

  const severity = INCIDENT_SEVERITY_META[incident.severity] ?? INCIDENT_SEVERITY_META.sev4;
  const status = INCIDENT_STATUS_META[incident.status] ?? INCIDENT_STATUS_META.open;

  return (
    <Drawer
      isOpen={!!incident}
      onClose={onClose}
      size="lg"
      icon="🚨"
      title={incident.id}
      subtitle={incident.title}
      headerExtra={
        <div className="flex items-center gap-2">
          <Badge variant={severity.variant} label={severity.label} />
          <Badge variant={status.variant} label={status.label} dot />
        </div>
      }
      footer={
        incident.status === 'open' ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-fg-muted">Affected service: {incident.service}</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="secondary" size="sm" onClick={() => onAction?.('escalate', incident)}>Escalate</Button>
              <Button variant="success" size="sm" onClick={() => onAction?.('resolve', incident)}>Resolve Incident</Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Service', value: incident.service },
            { label: 'Severity', value: severity.label },
            { label: 'Status', value: status.label },
            { label: 'Detected', value: formatDate(incident.detectedAt) },
            { label: 'Resolved', value: formatDate(incident.resolvedAt) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs text-fg-muted">{item.label}</p>
              <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">Incident Timeline</p>
          <IncidentTimeline items={incident.timeline} />
        </div>

        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Postmortem</p>
          {incident.postmortem ? (
            <div className="rounded-xl p-3 text-sm text-fg leading-relaxed" style={{ background: 'var(--surface-2)' }}>
              {incident.postmortem}
            </div>
          ) : (
            <p className="text-sm text-fg-muted">Postmortem will be available once the incident is resolved.</p>
          )}
        </div>
      </div>
    </Drawer>
  );
}

IncidentDrawer.propTypes = {
  incident: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
