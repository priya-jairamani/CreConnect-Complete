import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import { formatFollowers, formatEngagement } from '@/utils/formatters';

/** Leaderboard table of creator contributions within a campaign. */
export default function CreatorContributionTable({ creators }) {
  if (!creators?.length) {
    return <p className="text-sm text-fg-muted py-4 text-center">No creator contributions yet.</p>;
  }

  const sorted = [...creators].sort((a, b) => b.performanceScore - a.performanceScore);

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm" style={{ minWidth: 640 }}>
        <thead>
          <tr className="text-left text-fg-muted text-xs uppercase tracking-wide">
            <th className="px-2 py-2 font-medium">Creator</th>
            <th className="px-2 py-2 font-medium">Reach</th>
            <th className="px-2 py-2 font-medium">Engagement</th>
            <th className="px-2 py-2 font-medium">ROI</th>
            <th className="px-2 py-2 font-medium">Conversion</th>
            <th className="px-2 py-2 font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={c.handle} className="border-t border-border-subtle">
              <td className="px-2 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs text-fg-muted w-4 flex-shrink-0">#{i + 1}</span>
                  <Avatar initials={c.initials} size="sm" color={c.color} />
                  <div className="min-w-0">
                    <p className="text-fg font-medium truncate">{c.creator}</p>
                    <p className="text-xs text-fg-muted truncate">{c.handle}</p>
                  </div>
                </div>
              </td>
              <td className="px-2 py-2.5 text-fg">{formatFollowers(c.reach)}</td>
              <td className="px-2 py-2.5 text-fg">{formatEngagement(c.engagement / 100)}</td>
              <td className="px-2 py-2.5 text-fg">{c.roi}%</td>
              <td className="px-2 py-2.5 text-fg">{c.conversionRate}%</td>
              <td className="px-2 py-2.5">
                <span className="font-semibold text-brand-400">{c.performanceScore}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

CreatorContributionTable.propTypes = {
  creators: PropTypes.arrayOf(PropTypes.shape({
    creator: PropTypes.string.isRequired,
    handle: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    color: PropTypes.string,
    reach: PropTypes.number.isRequired,
    engagement: PropTypes.number.isRequired,
    roi: PropTypes.number.isRequired,
    conversionRate: PropTypes.number.isRequired,
    performanceScore: PropTypes.number.isRequired,
  })).isRequired,
};
