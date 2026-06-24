import PropTypes from 'prop-types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { seededRandom } from '@/utils/mockAnalytics';

const tooltipStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

export default function ReviewsPanel({ reviews, seed }) {
  const rand = seededRandom(`${seed}-rating-trend`);
  const trend = Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    rating: Math.round((4 + rand() * 1) * 10) / 10,
  }));
  const repeatClientRate = Math.round(20 + rand() * 50);
  const avgRating = reviews?.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : trend[trend.length - 1].rating.toFixed(1);

  return (
    <div className="card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Reviews
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="brand" label={`★ ${avgRating}`} />
          <Badge variant="success" label={`${repeatClientRate}% repeat clients`} />
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <h3 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Rating Trend</h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={trend}>
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis domain={[3, 5]} tick={axisTick} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="rating" stroke="#f5a623" strokeWidth={2.5} dot={{ r: 3, fill: '#f5a623' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!reviews?.length ? (
        <EmptyState icon="★" title="No reviews yet" message="Reviews from completed collaborations will appear here." />
      ) : (
        <div className="space-y-4">
          {reviews.map(({ id, reviewer, rating, comment, createdAt }, idx) => {
            const reviewerName = reviewer?.brandProfile?.companyName
              ?? reviewer?.creatorProfile?.displayName
              ?? 'Anonymous';
            const date = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '';
            return (
              <div
                key={id}
                className="flex items-start gap-3 pt-4"
                style={idx > 0 ? { borderTop: '1px solid var(--border)' } : {}}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--surface-2)' }}
                >
                  {reviewerName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-fg text-sm">{reviewerName}</span>
                    <span className="text-fg-muted text-xs">{date}</span>
                    <span className="text-accent text-xs">{'★'.repeat(rating)}</span>
                  </div>
                  {comment && <p className="text-fg-muted text-sm mt-0.5 leading-relaxed">{comment}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

ReviewsPanel.propTypes = {
  reviews: PropTypes.array,
  seed: PropTypes.string.isRequired,
};
