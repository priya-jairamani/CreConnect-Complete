import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import SystemHealthGrid from './SystemHealthGrid';
import OpsChart from './OpsChart';
import { timeAgo } from '@/utils/formatters';
import {
  SERVICES, SYSTEM_METRICS, INCIDENTS, INCIDENT_SEVERITY_META, INCIDENT_STATUS_META,
} from '@/utils/mockOperations';

const METRIC_COLORS = ['#6d5cff', '#857fff', '#16b364', '#f59e0b', '#0ea5e9', '#d946ef', '#f0445f', '#10b981'];

/** Enterprise monitoring dashboard — service status grid, system metrics & incident management. */
export default function SystemHealthTab({ onSelectIncident }) {
  const openIncidents = INCIDENTS.filter((i) => i.status === 'open');
  const resolvedIncidents = INCIDENTS.filter((i) => i.status === 'resolved');
  const postmortems = INCIDENTS.filter((i) => i.postmortem).length;

  return (
    <div className="space-y-6">
      {/* Service Status Grid */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Service Status Grid</h3>
        <SystemHealthGrid services={SERVICES} />
      </div>

      {/* System Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>System Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SYSTEM_METRICS.map((m, i) => (
            <div key={m.id} className="card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-fg-muted">{m.label}</p>
                <p className="text-sm font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value.toLocaleString()}{m.unit}</p>
              </div>
              <div style={{ height: 60 }}>
                <OpsChart bare data={m.series} series={[{ key: 'value', label: m.label, color: METRIC_COLORS[i % METRIC_COLORS.length] }]} type="line" height={60} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Management */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Incident Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Open Incidents', value: openIncidents.length },
            { label: 'Resolved Incidents', value: resolvedIncidents.length },
            { label: 'Postmortems Available', value: postmortems },
            { label: 'SEV-1 Incidents', value: INCIDENTS.filter((i) => i.severity === 'sev1').length },
          ].map((m) => (
            <div key={m.label} className="card rounded-2xl p-4">
              <p className="text-xs text-fg-muted">{m.label}</p>
              <p className="text-lg font-bold text-fg mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 820 }}>
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-4 py-3 text-left">Incident</th>
                  <th className="px-3 py-3 text-left">Service</th>
                  <th className="px-3 py-3 text-center">Severity</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-center">Detected</th>
                  <th className="px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {INCIDENTS.map((inc) => {
                  const severity = INCIDENT_SEVERITY_META[inc.severity] ?? INCIDENT_SEVERITY_META.sev4;
                  const status = INCIDENT_STATUS_META[inc.status] ?? INCIDENT_STATUS_META.open;
                  return (
                    <tr key={inc.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-4 py-3">
                        <p className="text-fg font-medium whitespace-nowrap">{inc.id}</p>
                        <p className="text-xs text-fg-muted truncate max-w-[260px]">{inc.title}</p>
                      </td>
                      <td className="px-3 py-3 text-fg-muted whitespace-nowrap">{inc.service}</td>
                      <td className="px-3 py-3 text-center"><Badge variant={severity.variant} label={severity.label} /></td>
                      <td className="px-3 py-3 text-center"><Badge variant={status.variant} label={status.label} dot /></td>
                      <td className="px-3 py-3 text-center text-fg-muted whitespace-nowrap">{timeAgo(inc.detectedAt)} ago</td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectIncident?.(inc)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-2 hover:bg-brand-500/12 hover:text-brand-400 text-fg transition-colors whitespace-nowrap"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

SystemHealthTab.propTypes = {
  onSelectIncident: PropTypes.func,
};
