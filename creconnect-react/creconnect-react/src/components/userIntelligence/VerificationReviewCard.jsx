import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import VerificationBadge from './VerificationBadge';
import RiskIndicator from './RiskIndicator';
import { timeAgo } from '@/utils/formatters';

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

/** Single item row inside the Verification Queue list. */
export default function VerificationReviewCard({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-colors border"
      style={{
        background: active ? 'var(--surface-2)' : 'var(--surface)',
        borderColor: active ? 'var(--brand-500)' : 'var(--border)',
      }}
    >
      <Avatar initials={getInitials(item.avatarLabel)} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-fg truncate">{item.name}</p>
          <Badge variant="neutral" label={item.entityType === 'creator' ? 'Creator' : 'Brand'} />
        </div>
        <p className="text-xs text-fg-muted truncate mt-0.5">{item.handle}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <VerificationBadge status={item.status} />
          <RiskIndicator level={item.riskLevel} />
        </div>
      </div>
      <span className="text-xs text-fg-muted flex-shrink-0 self-start">{timeAgo(item.submittedAt)} ago</span>
    </button>
  );
}

VerificationReviewCard.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    handle: PropTypes.string,
    avatarLabel: PropTypes.string,
    entityType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    riskLevel: PropTypes.string.isRequired,
    submittedAt: PropTypes.string.isRequired,
  }).isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
