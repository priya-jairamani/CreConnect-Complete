import PropTypes from 'prop-types';
import StatCard from '@/components/common/StatCard';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { formatPKR, timeAgo } from '@/utils/formatters';
import { seededRandom } from '@/utils/mockAnalytics';

function groupByBrand(collaborations) {
  const map = new Map();
  collaborations.forEach((c) => {
    const key = c.brandId ?? c.brand?.companyName ?? 'unknown';
    if (!map.has(key)) {
      map.set(key, {
        brandId: key,
        brandName: c.brand?.companyName ?? 'Brand',
        industry: c.brand?.industry,
        logoUrl: c.brand?.logoUrl,
        items: [],
      });
    }
    map.get(key).items.push(c);
  });
  return [...map.values()];
}

export function CollaborationStats({ collaborations, metrics, seed }) {
  const rand = seededRandom(`${seed}-collab-stats`);
  const total = metrics?.totalCollaborations ?? collaborations.length;
  const completed = metrics?.completedCollabs ?? collaborations.filter((c) => c.status === 'COMPLETED').length;
  const groups = groupByBrand(collaborations);
  const repeatClients = groups.filter((g) => g.items.length > 1).length;

  const rates = collaborations.map((c) => c.agreedRate ?? 0).filter((r) => r > 0);
  const avgBudget = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
  const maxBudget = rates.length ? Math.max(...rates) : 0;

  let longestRelationship = '—';
  const multi = groups.filter((g) => g.items.length > 1);
  if (multi.length) {
    const longest = multi.reduce((best, g) => {
      const dates = g.items.map((c) => new Date(c.createdAt).getTime());
      const span = Math.max(...dates) - Math.min(...dates);
      return span > (best.span ?? -1) ? { ...g, span } : best;
    }, {});
    const months = Math.max(1, Math.round(longest.span / (1000 * 60 * 60 * 24 * 30)));
    longestRelationship = `${months} mo · ${longest.brandName}`;
  }

  const industries = collaborations.map((c) => c.brand?.industry).filter(Boolean);
  const industryCounts = industries.reduce((acc, i) => ({ ...acc, [i]: (acc[i] ?? 0) + 1 }), {});
  const favoriteCategories = Object.entries(industryCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

  const avgRating = collaborations.length
    ? (Math.round((4 + rand() * 1) * 10) / 10).toFixed(1)
    : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard value={total} label="Total Collaborations" icon="🤝" />
      <StatCard value={completed} label="Completed Campaigns" icon="✅" />
      <StatCard value={repeatClients} label="Repeat Clients" icon="🔁" />
      <StatCard value={avgRating} label="Avg. Campaign Rating" icon="★" />
      <StatCard value={formatPKR(avgBudget)} label="Avg. Campaign Budget" icon="💰" />
      <StatCard value={formatPKR(maxBudget)} label="Highest Campaign Budget" icon="🏆" />
      <StatCard value={longestRelationship} label="Longest Brand Relationship" icon="⏳" />
      <div className="card rounded-2xl p-5 flex flex-col gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">🎯</div>
        <div>
          <p className="text-fg-muted text-sm mb-2">Favorite Brand Categories</p>
          {favoriteCategories.length ? (
            <div className="flex flex-wrap gap-1.5">
              {favoriteCategories.map((c) => <Badge key={c} variant="brand" label={c} />)}
            </div>
          ) : (
            <p className="text-fg-muted text-xs">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

CollaborationStats.propTypes = {
  collaborations: PropTypes.array.isRequired,
  metrics: PropTypes.object,
  seed: PropTypes.string.isRequired,
};

export function BrandRelationships({ collaborations, seed }) {
  const groups = groupByBrand(collaborations)
    .sort((a, b) => b.items.length - a.items.length);

  if (!groups.length) {
    return <EmptyState icon="🏢" title="No brand relationships yet" message="Brands you collaborate with will be tracked here, including project history and ratings." />;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((g) => {
        const rand = seededRandom(`${seed}-${g.brandId}-rating`);
        const rating = (Math.round((3.8 + rand() * 1.2) * 10) / 10).toFixed(1);
        const last = g.items.reduce((latest, c) => (
          new Date(c.createdAt) > new Date(latest.createdAt) ? c : latest
        ), g.items[0]);
        const initials = g.brandName.slice(0, 2).toUpperCase();

        return (
          <div key={g.brandId} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              {g.logoUrl ? (
                <img src={g.logoUrl} alt={g.brandName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}>
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-fg text-sm font-semibold truncate">{g.brandName}</p>
                {g.industry && <p className="text-fg-muted text-xs truncate">{g.industry}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg py-2" style={{ background: 'var(--surface)' }}>
                <p className="text-fg font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{g.items.length}</p>
                <p className="text-fg-muted text-[10px] mt-0.5">Projects</p>
              </div>
              <div className="rounded-lg py-2" style={{ background: 'var(--surface)' }}>
                <p className="text-fg font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>★ {rating}</p>
                <p className="text-fg-muted text-[10px] mt-0.5">Rating</p>
              </div>
            </div>
            <p className="text-fg-muted text-xs">Last collaboration: {timeAgo(last.createdAt)} ago</p>
          </div>
        );
      })}
    </div>
  );
}

BrandRelationships.propTypes = {
  collaborations: PropTypes.array.isRequired,
  seed: PropTypes.string.isRequired,
};
