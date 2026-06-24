import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';

export default function CompareTray({ brands, onRemove, onClear, onCompare }) {
  if (!brands.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-[220px] z-30 px-6 py-4 flex items-center gap-3 flex-wrap" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <span className="text-fg-muted text-sm flex-shrink-0">Compare ({brands.length}/4):</span>
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        {brands.map((b) => (
          <span key={b.id} className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <Avatar src={b.logoUrl} initials={b.companyName?.slice(0, 2)?.toUpperCase()} size="xs" />
            <span className="text-fg text-xs">{b.companyName}</span>
            <button onClick={() => onRemove(b.id)} className="text-fg-muted text-xs hover:text-fg">✕</button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>
        <Button variant="primary" size="sm" disabled={brands.length < 2} onClick={onCompare}>
          Compare Brands
        </Button>
      </div>
    </div>
  );
}

CompareTray.propTypes = {
  brands:    PropTypes.array.isRequired,
  onRemove:  PropTypes.func.isRequired,
  onClear:   PropTypes.func.isRequired,
  onCompare: PropTypes.func.isRequired,
};
