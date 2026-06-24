import PropTypes from 'prop-types';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import Badge from '@/components/common/Badge';
import { formatFollowers } from '@/utils/formatters';
import { getGrowthSeries, getContentPerformance } from '@/utils/mockAnalytics';

const tooltipStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

export default function PerformanceCharts({ seed, baseFollowers }) {
  const series = getGrowthSeries(seed, 6, baseFollowers);
  const content = getContentPerformance(seed);

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Performance Analytics
        </h2>
        <Badge variant="neutral" label="Last 6 months" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Follower Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="pf-followers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d5cff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6d5cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatFollowers} width={42} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatFollowers(v)} />
              <Area type="monotone" dataKey="followers" stroke="#857fff" strokeWidth={2.5} fill="url(#pf-followers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Reach Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="pf-reach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatFollowers} width={42} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatFollowers(v)} />
              <Area type="monotone" dataKey="reach" stroke="#f59e0b" strokeWidth={2.5} fill="url(#pf-reach)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Engagement & Conversion Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} unit="%" width={36} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--fg-muted)' }} />
              <Line type="monotone" dataKey="engagement" name="Engagement %" stroke="#16b364" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Content Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={content}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="type" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatFollowers} width={42} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatFollowers(v)} />
              <Bar dataKey="avgViews" name="Avg. Views" fill="#6d5cff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

PerformanceCharts.propTypes = {
  seed: PropTypes.string.isRequired,
  baseFollowers: PropTypes.number,
};
