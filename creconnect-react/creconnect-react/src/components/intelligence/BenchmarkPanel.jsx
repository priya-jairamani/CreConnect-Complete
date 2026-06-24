import PropTypes from 'prop-types';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend,
} from 'recharts';
import Badge from '@/components/common/Badge';

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

export default function BenchmarkPanel({ benchmark }) {
  const data = benchmark.map((b) => ({ label: b.label, You: b.creator, Average: b.average }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Badge variant="neutral" label="Estimated category benchmarks" />
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="label" tick={axisTick} />
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
            <Radar name="You" dataKey="You" stroke="#6d5cff" fill="#6d5cff" fillOpacity={0.35} />
            <Radar name="Niche Average" dataKey="Average" stroke="#9aa1b6" fill="#9aa1b6" fillOpacity={0.15} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-muted)' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {benchmark.map((b) => (
          <div key={b.label} className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-fg text-sm font-semibold">{b.label}</p>
              <span className="text-xs font-semibold text-brand-400">Top {100 - b.percentile}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
              <div className="h-full rounded-full" style={{ width: `${b.percentile}%`, background: 'linear-gradient(90deg, #6d5cff, #4c2dd1)' }} />
            </div>
            <p className="text-fg-muted text-xs mt-1.5">
              You: <span className="text-fg font-medium">{b.creator}</span> · Niche avg: <span className="text-fg font-medium">{b.average}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

BenchmarkPanel.propTypes = {
  benchmark: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    creator: PropTypes.number.isRequired,
    average: PropTypes.number.isRequired,
    percentile: PropTypes.number.isRequired,
  })).isRequired,
};
