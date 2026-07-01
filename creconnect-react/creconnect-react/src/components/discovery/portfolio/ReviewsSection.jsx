import PropTypes from 'prop-types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Avatar from '@/components/common/Avatar';

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

export default function ReviewsSection({ reviews, satisfactionTrend }) {
  if (!reviews) return null;
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <h4 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Satisfaction Trend</h4>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={satisfactionTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="value" stroke="#16b364" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <Avatar initials={r.creator.slice(0, 2)} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-fg text-sm font-semibold">{r.creator}</p>
                <span className="text-warning text-xs font-semibold flex-shrink-0">★ {r.rating}</span>
              </div>
              <p className="text-fg-muted text-sm mt-1 leading-relaxed">{r.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReviewsSection.propTypes = {
  reviews: PropTypes.array.isRequired,
  satisfactionTrend: PropTypes.array.isRequired,
};
