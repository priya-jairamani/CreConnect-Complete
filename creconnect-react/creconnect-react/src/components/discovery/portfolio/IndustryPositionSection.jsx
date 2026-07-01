import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ScoreRing from '@/components/common/ScoreRing';

export default function IndustryPositionSection({ ranking, competitors, onSelectBrand }) {
  if (!ranking && !competitors?.length) return null;
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <ScoreRing value={ranking.percentile} size={64} strokeWidth={5} />
        <div>
          <p className="text-fg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
            #{ranking.rank} of {ranking.totalInIndustry} in {ranking.industry}
          </p>
          <p className="text-fg-muted text-sm mt-0.5">
            Ranks in the top {Math.max(1, 100 - ranking.percentile)}% of {ranking.industry.toLowerCase()} brands on the platform.
          </p>
        </div>
      </div>

      <div>
        <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-2">Competitor Brands</p>
        {competitors.length === 0 ? (
          <p className="text-fg-muted text-sm">No other {ranking.industry.toLowerCase()} brands to compare yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {competitors.map((c) => (
              <div key={c.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <Avatar src={c.logoUrl} initials={c.companyName?.slice(0, 2)?.toUpperCase()} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-fg text-sm font-semibold truncate">{c.companyName}</p>
                  <Badge variant="brand" label={`${c.intel?.matchScore ?? '—'}% match`} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => onSelectBrand(c)}>View</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

IndustryPositionSection.propTypes = {
  ranking: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    totalInIndustry: PropTypes.number.isRequired,
    percentile: PropTypes.number.isRequired,
    industry: PropTypes.string.isRequired,
  }).isRequired,
  competitors: PropTypes.array.isRequired,
  onSelectBrand: PropTypes.func.isRequired,
};
