import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

export default function BrandCard({ brand, onView, onApply }) {
  return (
    <div className="card card-hover rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar
          initials={brand.companyName.slice(0, 2).toUpperCase()}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
              {brand.companyName}
            </h3>
            {brand.isVerified && (
              <Badge variant="success" label="Verified" dot />
            )}
          </div>
          <p className="text-fg-muted text-sm mt-0.5">{brand.industry}</p>
          {brand.budgetRange && (
            <p className="text-brand-400 text-xs font-medium mt-1">{brand.budgetRange}</p>
          )}
        </div>
      </div>

      {brand.description && (
        <p className="text-fg-muted text-sm leading-relaxed line-clamp-2">{brand.description}</p>
      )}

      <div className="flex gap-2 pt-1">
        {onView && (
          <Button variant="secondary" size="sm" onClick={() => onView(brand)}>
            View Profile
          </Button>
        )}
        {onApply && (
          <Button variant="primary" size="sm" onClick={() => onApply(brand)} className="ml-auto">
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}

BrandCard.propTypes = {
  brand: PropTypes.shape({
    id:          PropTypes.string.isRequired,
    companyName: PropTypes.string.isRequired,
    industry:    PropTypes.string,
    isVerified:  PropTypes.bool,
    budgetRange: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onView:  PropTypes.func,
  onApply: PropTypes.func,
};
