import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import { formatCompactPKR } from '@/utils/formatters';

function formatMetric(value, format) {
  if (format === 'pkr') return formatCompactPKR(value);
  if (format === 'percent') return `${value.toFixed(0)}%`;
  return Math.round(value).toLocaleString();
}

/** Leaderboard row — a top-spending brand ranked by a given financial metric. */
export default function BrandSpendCard({ brand, rank, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(brand)}
      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-white/5"
      style={{ background: 'var(--surface-2)' }}
    >
      <span className="text-sm font-bold text-fg-muted w-5 text-center flex-shrink-0">#{rank}</span>
      <Avatar initials={brand.initials} color={brand.color} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-fg truncate">{brand.name}</p>
        <p className="text-xs text-fg-muted truncate">{brand.industry} · {brand.metricLabel}</p>
      </div>
      <span className="text-sm font-bold text-fg flex-shrink-0">{formatMetric(brand.metricValue, brand.metricFormat)}</span>
    </button>
  );
}

BrandSpendCard.propTypes = {
  brand: PropTypes.object.isRequired,
  rank: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};
