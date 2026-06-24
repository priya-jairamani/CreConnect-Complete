import PropTypes from 'prop-types';
import Button from '@/components/common/Button';
import PlatformIcon from '@/components/common/PlatformIcon';

const NICHES    = ['Beauty', 'Fashion', 'Gaming', 'Tech', 'Food', 'Travel', 'Fitness', 'Lifestyle'];
const PLATFORMS = ['instagram', 'tiktok', 'youtube'];

export default function CreatorSearchFilters({ filters, onUpdate, onSearch, onClear }) {
  const handlePlatform = (p) => {
    const current = filters.platforms || [];
    const next    = current.includes(p) ? current.filter((x) => x !== p) : [...current, p];
    onUpdate('platforms', next);
  };

  const maxFollVal = filters.maxFollowers ?? 500000;
  const maxFollDisp = maxFollVal >= 500000 ? '500K+' : `${Math.round(maxFollVal / 1000)}K`;

  return (
    <aside
      className="w-64 flex-shrink-0 rounded-2xl p-5 space-y-5 h-fit"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
          Filters
        </h2>
        <button
          onClick={onClear}
          className="text-xs transition-colors"
          style={{ color: 'var(--fg-muted)' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-400)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--fg-muted)'}
        >
          Clear all
        </button>
      </div>

      {/* Niche */}
      <div className="space-y-1.5">
        <label className="text-fg-muted text-xs uppercase tracking-wider font-semibold">Niche</label>
        <select
          value={filters.niche || ''}
          onChange={(e) => onUpdate('niche', e.target.value)}
          className="input-base"
          style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
        >
          <option value="">All Niches</option>
          {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Followers slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-fg-muted text-xs uppercase tracking-wider font-semibold">Followers</label>
          <span className="text-brand-400 text-xs font-semibold">{maxFollDisp}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={500000}
          step={10000}
          value={maxFollVal}
          onChange={(e) => onUpdate('maxFollowers', Number(e.target.value))}
          className="w-full"
          style={{ accentColor: 'var(--brand-500)' }}
        />
        <div className="flex justify-between text-fg-muted text-xs">
          <span>50K</span><span>500K+</span>
        </div>
      </div>

      {/* Engagement slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-fg-muted text-xs uppercase tracking-wider font-semibold">Engagement</label>
          <span className="text-brand-400 text-xs font-semibold">{(filters.minEngagement ?? 2.5).toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min={2.5}
          max={8}
          step={0.1}
          value={filters.minEngagement ?? 2.5}
          onChange={(e) => onUpdate('minEngagement', Number(e.target.value))}
          className="w-full"
          style={{ accentColor: 'var(--brand-500)' }}
        />
        <div className="flex justify-between text-fg-muted text-xs">
          <span>2.5%</span><span>8.0%</span>
        </div>
      </div>

      {/* Budget slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-fg-muted text-xs uppercase tracking-wider font-semibold">Budget</label>
          <span className="text-brand-400 text-xs font-semibold">
            PKR {(filters.maxBudget ?? 50000).toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={50000}
          step={1000}
          value={filters.maxBudget ?? 50000}
          onChange={(e) => onUpdate('maxBudget', Number(e.target.value))}
          className="w-full"
          style={{ accentColor: 'var(--brand-500)' }}
        />
        <div className="flex justify-between text-fg-muted text-xs">
          <span>PKR 0</span><span>PKR 50K</span>
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-2">
        <label className="text-fg-muted text-xs uppercase tracking-wider font-semibold">Platform</label>
        {PLATFORMS.map((p) => {
          const checked = (filters.platforms || []).includes(p);
          return (
            <label
              key={p}
              className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg transition-colors"
              style={checked ? { background: 'rgba(109,92,255,0.08)' } : {}}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handlePlatform(p)}
                style={{ accentColor: 'var(--brand-500)' }}
              />
              <span className="text-sm flex items-center gap-1.5" style={{ color: checked ? 'var(--brand-400)' : 'var(--fg-muted)' }}>
                <PlatformIcon platform={p} size={14} />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </span>
            </label>
          );
        })}
      </div>

      <Button variant="primary" size="full" onClick={onSearch}>Search</Button>
    </aside>
  );
}

CreatorSearchFilters.propTypes = {
  filters:  PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onClear:  PropTypes.func.isRequired,
};
