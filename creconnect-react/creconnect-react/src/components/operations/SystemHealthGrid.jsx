import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { SERVICE_STATUS_META } from '@/utils/mockOperations';

/** Service status grid — uptime & response time across core platform services. */
export default function SystemHealthGrid({ services }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {services.map((svc) => {
        const status = SERVICE_STATUS_META[svc.status] ?? SERVICE_STATUS_META.operational;
        return (
          <div key={svc.id} className="card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: 'var(--surface-2)' }}>{svc.icon}</span>
              <Badge variant={status.variant} label={status.label} dot />
            </div>
            <p className="text-sm font-semibold text-fg">{svc.name}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-fg-muted">
              <span>Uptime {svc.uptimePct}%</span>
              <span>{svc.responseMs}ms</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

SystemHealthGrid.propTypes = {
  services: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.node,
    status: PropTypes.string.isRequired,
    uptimePct: PropTypes.number.isRequired,
    responseMs: PropTypes.number.isRequired,
  })).isRequired,
};
