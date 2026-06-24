import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

function compactTick(v) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return v;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-border-subtle shadow-card-lg">
      <p className="text-fg-muted mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/** Multi-series area chart used for Verification Trends & User Activity Trends. */
export default function MultiSeriesChart({ title, data, series, height = 220 }) {
  return (
    <div className="card rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`msc-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={20} />
            <YAxis tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={36} tickFormatter={compactTick} />
            <Tooltip content={<CustomTooltip />} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.5}
                fill={`url(#msc-${s.key})`}
                animationDuration={600}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-muted)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

MultiSeriesChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  series: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  })).isRequired,
  height: PropTypes.number,
};
