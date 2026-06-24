import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatPKR } from '@/utils/formatters';

export default function OfferCard({ offer, onWithdraw }) {
  const brand    = offer.campaign?.brand?.companyName ?? offer.brand ?? 'Brand';
  const title    = offer.campaign?.title              ?? offer.title ?? 'Campaign';
  const budget   = offer.campaign?.budgetPKR          ?? offer.budget ?? 0;
  const note     = offer.note                         ?? '';
  const appliedAt = offer.createdAt
    ? new Date(offer.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="card card-hover rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
      <div className="flex-shrink-0 pt-0.5">
        <Badge variant="warning" label="Awaiting Response" dot />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-fg mb-0.5" style={{ fontFamily: 'Sora, sans-serif' }}>
          {brand}
        </h3>
        <p className="text-fg-muted text-xs mb-2">{title}</p>
        {note && <p className="text-fg-muted text-sm mb-2 leading-relaxed line-clamp-2">{note}</p>}
        <div className="flex items-center gap-2.5 flex-wrap">
          {budget > 0 && (
            <span className="text-brand-400 font-semibold text-sm">{formatPKR(budget)}</span>
          )}
          {appliedAt && (
            <span className="text-xs text-fg-muted">Applied {appliedAt}</span>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col gap-2 items-end justify-end flex-shrink-0">
        <p className="text-fg-muted text-xs italic text-right mb-1">Waiting for brand to respond</p>
        <Button variant="danger" size="sm" onClick={() => onWithdraw?.(offer)}>
          Withdraw
        </Button>
      </div>
    </div>
  );
}

OfferCard.propTypes = {
  offer: PropTypes.shape({
    id:        PropTypes.string.isRequired,
    note:      PropTypes.string,
    createdAt: PropTypes.string,
    campaign:  PropTypes.shape({
      title:    PropTypes.string,
      budgetPKR: PropTypes.number,
      brand:    PropTypes.shape({ companyName: PropTypes.string }),
    }),
  }).isRequired,
  onWithdraw: PropTypes.func,
};
