import PropTypes from 'prop-types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import Badge from '@/components/common/Badge';
import {
  getAudienceAge, getAudienceGender, getAudienceCountries,
  getAudienceCities, getActiveHours, getAudienceInterests,
} from '@/utils/mockAnalytics';

const tooltipStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h3>
      {children}
    </div>
  );
}
ChartCard.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

export default function AudienceCharts({ seed }) {
  const age = getAudienceAge(seed);
  const gender = getAudienceGender(seed);
  const countries = getAudienceCountries(seed);
  const cities = getAudienceCities(seed);
  const hours = getActiveHours(seed);
  const interests = getAudienceInterests(seed);

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Audience Insights
        </h2>
        <Badge variant="neutral" label="Estimated" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ChartCard title="Age Distribution">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={age}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} unit="%" width={36} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              <Bar dataKey="value" fill="#6d5cff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Split">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={gender} dataKey="value" nameKey="label" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {gender.map((g) => <Cell key={g.label} fill={g.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-1">
            {gender.map((g) => (
              <span key={g.label} className="flex items-center gap-1.5 text-xs text-fg-muted">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                {g.label} {g.value}%
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top Countries">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={countries} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="label" tick={axisTick} axisLine={false} tickLine={false} width={84} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Cities">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cities} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="label" tick={axisTick} axisLine={false} tickLine={false} width={84} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              <Bar dataKey="value" fill="#16b364" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Audience Interests">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={interests}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="label" tick={axisTick} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#857fff" fill="#6d5cff" fillOpacity={0.35} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Active Hours">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hours}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ ...axisTick, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#857fff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

AudienceCharts.propTypes = { seed: PropTypes.string.isRequired };
