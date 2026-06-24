import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';

/** Team productivity row — efficiency, resolution time, cases closed & quality score. */
export default function ProductivityScoreCard({ member }) {
  return (
    <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)' }}>
      <Avatar initials={member.initials} color={member.color} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-fg truncate">{member.name}</p>
        <p className="text-xs text-fg-muted">{member.casesClosed} cases closed · {member.resolutionTimeMin}m avg</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{member.efficiency}%</p>
        <p className="text-xs text-fg-muted">Quality {member.qualityScore}%</p>
      </div>
    </div>
  );
}

ProductivityScoreCard.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    efficiency: PropTypes.number.isRequired,
    resolutionTimeMin: PropTypes.number.isRequired,
    casesClosed: PropTypes.number.isRequired,
    qualityScore: PropTypes.number.isRequired,
  }).isRequired,
};
