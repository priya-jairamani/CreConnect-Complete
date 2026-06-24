import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { SUGGESTED_SEARCHES } from '@/constants/discoveryOptions';

function BrandRow({ brand, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(brand)}
      className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:border-brand-500/40"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <Avatar src={brand.logoUrl} initials={brand.companyName?.slice(0, 2)?.toUpperCase()} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-fg text-sm font-semibold truncate">{brand.companyName}</p>
        <p className="text-fg-muted text-xs truncate">{brand.industry || 'General'}</p>
      </div>
      {brand.intel?.matchScore != null && <Badge variant="brand" label={`${brand.intel.matchScore}% match`} />}
    </button>
  );
}
BrandRow.propTypes = { brand: PropTypes.object.isRequired, onSelect: PropTypes.func.isRequired };

export default function DiscoveryEmptyState({ recommended, trending, onSelectBrand, onSuggestedSearch, onClear }) {
  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-3xl border border-brand-500/20">🔍</div>
        <h3 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>No brands match those filters</h3>
        <p className="text-fg-muted text-sm max-w-sm">Try a different search, or explore these AI-recommended and trending opportunities instead.</p>
        <Button variant="secondary" size="sm" onClick={onClear}>Clear search & filters</Button>
      </div>

      {recommended.length > 0 && (
        <div>
          <h4 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>✨ Recommended for you</h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {recommended.map((b) => <BrandRow key={b.id} brand={b} onSelect={onSelectBrand} />)}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div>
          <h4 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>🔥 Trending brands</h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {trending.map((b) => <BrandRow key={b.id} brand={b} onSelect={onSelectBrand} />)}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-fg text-sm font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>💡 Suggested searches</h4>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SEARCHES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestedSearch(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

DiscoveryEmptyState.propTypes = {
  recommended:       PropTypes.array.isRequired,
  trending:          PropTypes.array.isRequired,
  onSelectBrand:     PropTypes.func.isRequired,
  onSuggestedSearch: PropTypes.func.isRequired,
  onClear:           PropTypes.func.isRequired,
};
