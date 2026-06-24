import PropTypes from 'prop-types';
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { formatPKR } from '@/utils/formatters';

function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-border-subtle shadow-card-lg">
      {label && <p className="text-fg-muted mb-0.5">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatPKR(p.value) : `${p.value}%`}
        </p>
      ))}
    </div>
  );
}

/**
 * Versatile revenue chart used across the Revenue Intelligence section.
 * `type`: 'trend' | 'sources' | 'distribution' | 'projection'
 */
export default function RevenueChart({ type, data, title, height = 220 }) {
  return (
    <div className="card rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          {type === 'trend' ? (
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rev-trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d5cff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6d5cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={48}
                     tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<MoneyTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6d5cff" strokeWidth={2.5} fill="url(#rev-trend)" animationDuration={600} />
            </AreaChart>
          ) : type === 'projection' ? (
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={48}
                     tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<MoneyTooltip />} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="#6d5cff" strokeWidth={2.5} dot={false} connectNulls animationDuration={600} />
              <Line type="monotone" dataKey="projected" name="Projected" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 5" dot={false} connectNulls animationDuration={600} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-muted)' }} />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                animationDuration={600}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<MoneyTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-muted)' }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

RevenueChart.propTypes = {
  type: PropTypes.oneOf(['trend', 'sources', 'distribution', 'projection']).isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
};
