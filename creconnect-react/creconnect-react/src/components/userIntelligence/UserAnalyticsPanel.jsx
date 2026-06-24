import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatFollowers } from '@/utils/formatters';

function GrowthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-border-subtle shadow-card-lg">
      <p className="text-fg-muted mb-0.5">{label}</p>
      <p className="font-semibold text-brand-400">{formatFollowers(payload[0].value)}</p>
    </div>
  );
}

/** Audience / growth analytics block used inside creator & brand intelligence panels. */
export default function UserAnalyticsPanel({ series, seriesLabel = 'Followers', ageBreakdown, genderBreakdown }) {
  return (
    <div className="space-y-5">
      {series?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">{seriesLabel} Growth</p>
          <div style={{ width: '100%', height: 140 }}>
            <ResponsiveContainer>
              <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="ua-growth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d5cff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6d5cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--fg-muted)', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis hide />
                <Tooltip content={<GrowthTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#6d5cff" strokeWidth={2.5} fill="url(#ua-growth)" animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {ageBreakdown?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Audience Age</p>
            <div className="space-y-2">
              {ageBreakdown.map((a) => (
                <div key={a.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-fg-muted">{a.label}</span>
                    <span className="text-fg font-medium">{a.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${a.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {genderBreakdown?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Audience Gender</p>
            <div style={{ width: '100%', height: 120 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={genderBreakdown} dataKey="value" nameKey="label" innerRadius="50%" outerRadius="85%" paddingAngle={2} animationDuration={500}>
                    {genderBreakdown.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'var(--fg-muted)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

UserAnalyticsPanel.propTypes = {
  series: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.number })),
  seriesLabel: PropTypes.string,
  ageBreakdown: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.number })),
  genderBreakdown: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.number, color: PropTypes.string })),
};
