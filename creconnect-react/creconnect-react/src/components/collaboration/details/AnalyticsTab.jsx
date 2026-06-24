import PropTypes from 'prop-types';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import StatCard from '@/components/common/StatCard';
import { formatFollowers, formatEngagement } from '@/utils/formatters';
import { tooltipStyle, axisTick } from '@/components/collaboration/details/chartTheme';

function MiniChart({ title, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <h4 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h4>
      <ResponsiveContainer width="100%" height={150}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
MiniChart.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

export default function AnalyticsTab({ performance }) {
  const { reach, impressions, views, clicks, engagement, conversions, roi, series } = performance;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="👁️" value={formatFollowers(reach)} label="Reach" />
        <StatCard icon="📣" value={formatFollowers(impressions)} label="Impressions" />
        <StatCard icon="▶️" value={formatFollowers(views)} label="Views" />
        <StatCard icon="🖱️" value={formatFollowers(clicks)} label="Clicks" />
        <StatCard icon="❤️" value={formatEngagement(engagement / 100)} label="Engagement" />
        <StatCard icon="🛒" value={formatFollowers(conversions)} label="Conversions" />
        <StatCard icon="📈" value={`${roi}%`} label="ROI" highlight />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <MiniChart title="Performance Over Time (Reach)">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="collabReachFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6d5cff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6d5cff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => formatFollowers(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatFollowers(v)} />
            <Area type="monotone" dataKey="reach" stroke="#6d5cff" fill="url(#collabReachFill)" strokeWidth={2} />
          </AreaChart>
        </MiniChart>

        <MiniChart title="Engagement Trend">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="engagement" stroke="#16b364" strokeWidth={2} dot={false} />
          </LineChart>
        </MiniChart>

        <MiniChart title="Audience Growth">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="collabFollowersFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5a623" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => formatFollowers(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatFollowers(v)} />
            <Area type="monotone" dataKey="followers" stroke="#f5a623" fill="url(#collabFollowersFill)" strokeWidth={2} />
          </AreaChart>
        </MiniChart>
      </div>
    </div>
  );
}

AnalyticsTab.propTypes = {
  performance: PropTypes.object.isRequired,
};
