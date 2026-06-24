import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import { formatPKR } from '@/utils/formatters';

function formatBudget(campaign) {
  const { budgetMin, budgetMax, budgetPKR, currency = 'PKR' } = campaign;
  if (budgetMin != null && budgetMax != null) {
    return budgetMin === budgetMax
      ? `${currency} ${budgetMin.toLocaleString('en-PK')}`
      : `${currency} ${budgetMin.toLocaleString('en-PK')} – ${budgetMax.toLocaleString('en-PK')}`;
  }
  return formatPKR(budgetPKR);
}

export default function CampaignCard({ campaign, onViewDetails }) {
  const brandName = campaign.brand?.companyName;

  return (
    <div className="card card-hover rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="font-semibold text-fg text-base leading-snug min-w-0 line-clamp-2"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {campaign.title}
        </h3>
        <Badge status={campaign.status} className="flex-shrink-0" />
      </div>

      {/* Budget */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: 'var(--surface-2)' }}
      >
        <div>
          <p className="text-fg-muted text-xs uppercase tracking-widest mb-0.5">Budget</p>
          <p className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
            {formatBudget(campaign)}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onViewDetails?.(campaign)}>
          Details
        </Button>
      </div>

      {/* Brand row */}
      <div
        className="flex items-center gap-2.5 pt-1 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        {brandName ? (
          <>
            <Avatar initials={brandName.slice(0, 2)} size="sm" />
            <span className="text-fg-muted text-xs">{brandName}</span>
          </>
        ) : campaign.niche ? (
          <span className="text-fg-muted text-xs">{campaign.niche}</span>
        ) : null}
        {campaign.deadline && (
          <span className="ml-auto text-fg-muted text-xs">
            Due {new Date(campaign.deadline).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

CampaignCard.propTypes = {
  campaign: PropTypes.shape({
    id:        PropTypes.string.isRequired,
    title:     PropTypes.string.isRequired,
    status:    PropTypes.string.isRequired,
    niche:     PropTypes.string,
    budgetMin: PropTypes.number,
    budgetMax: PropTypes.number,
    budgetPKR: PropTypes.number,
    currency:  PropTypes.string,
    brand:     PropTypes.shape({ companyName: PropTypes.string }),
    deadline:  PropTypes.string,
  }).isRequired,
  onViewDetails: PropTypes.func,
};
