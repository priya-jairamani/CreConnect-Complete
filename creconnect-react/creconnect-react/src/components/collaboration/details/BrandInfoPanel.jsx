import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';

export default function BrandInfoPanel({ item }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <Avatar src={item.brandLogo} initials={item.brandName?.slice(0, 2)?.toUpperCase()} size="lg" />
        <div className="min-w-0">
          <h4 className="text-fg font-semibold text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{item.brandName}</h4>
          <p className="text-fg-muted text-xs mt-0.5">{item.industry || 'General'}</p>
        </div>
      </div>
    </div>
  );
}

BrandInfoPanel.propTypes = {
  item: PropTypes.object.isRequired,
};
