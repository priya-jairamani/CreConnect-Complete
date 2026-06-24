import PropTypes from 'prop-types';

const TREND_META = {
  up: { icon: '↑', className: 'text-danger' },
  down: { icon: '↓', className: 'text-success' },
  flat: { icon: '→', className: 'text-fg-muted' },
};

function loadColor(pct) {
  if (pct >= 85) return 'var(--danger)';
  if (pct >= 60) return 'var(--warning)';
  return 'var(--success)';
}

/** Operations workload view — queue depth vs. capacity across teams. */
export default function QueueMonitor({ queues }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {queues.map((q) => {
        const pct = Math.min(100, Math.round((q.count / q.capacity) * 100));
        const trend = TREND_META[q.trend] ?? TREND_META.flat;
        return (
          <div key={q.id} className="card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-fg-muted">{q.label}</p>
              <span className={`text-xs font-semibold ${trend.className}`}>{trend.icon}</span>
            </div>
            <p className="text-xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{q.count}<span className="text-xs text-fg-muted font-normal"> / {q.capacity}</span></p>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden mt-2">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: loadColor(pct), transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

QueueMonitor.propTypes = {
  queues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    trend: PropTypes.oneOf(['up', 'down', 'flat']).isRequired,
  })).isRequired,
};
