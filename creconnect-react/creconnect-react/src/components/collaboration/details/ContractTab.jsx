import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatPKR } from '@/utils/formatters';

const TYPE_LABELS = {
  reels: 'Reel', posts: 'Post', stories: 'Story', videos: 'Video', livestreams: 'Livestream',
  REEL: 'Reel', POST: 'Post', STORY: 'Story', VIDEO: 'Video', LIVESTREAM: 'Livestream',
};

export default function ContractTab({ contract, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  if (!contract) {
    return (
      <EmptyState
        icon="📜"
        title="No contract terms"
        message="Campaign and offer details are not available for this collaboration."
      />
    );
  }

  const deliverableLines = Object.entries(contract.deliverables || {})
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${count}× ${TYPE_LABELS[key] || TYPE_LABELS[key.toUpperCase()] || key}`);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="px-5 py-4" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-fg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>{contract.campaignTitle}</h3>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Badge variant="brand" label={contract.objective?.replace(/_/g, ' ') || 'Campaign'} />
          <Badge variant="neutral" label={contract.status || '—'} />
          {contract.stage && <Badge variant="neutral" label={contract.stage.replace(/_/g, ' ')} />}
        </div>
      </div>

      <div className="p-5 space-y-4 text-sm">
        {contract.description && (
          <div>
            <p className="text-fg-muted text-xs uppercase tracking-wide mb-1">Brief</p>
            <p className="text-fg leading-relaxed whitespace-pre-wrap">{contract.description}</p>
          </div>
        )}

        {contract.requirements && (
          <div>
            <p className="text-fg-muted text-xs uppercase tracking-wide mb-1">Requirements</p>
            <p className="text-fg leading-relaxed whitespace-pre-wrap">{contract.requirements}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
            <p className="text-fg-muted text-xs">Agreed amount</p>
            <p className="text-brand-400 font-bold text-lg">{formatPKR(contract.offerAmountPKR || contract.budgetPKR || 0)}</p>
            {contract.budgetType && <p className="text-fg-muted text-[10px] mt-0.5">{contract.budgetType} budget</p>}
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
            <p className="text-fg-muted text-xs">Timeline</p>
            <p className="text-fg font-medium">
              {contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              {' → '}
              {contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        {deliverableLines.length > 0 && (
          <div>
            <p className="text-fg-muted text-xs uppercase tracking-wide mb-2">Deliverables</p>
            <ul className="space-y-1">
              {deliverableLines.map((line) => (
                <li key={line} className="text-fg flex items-center gap-2">
                  <span className="text-brand-400">✓</span> {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(contract.platforms) && contract.platforms.length > 0 && (
          <div>
            <p className="text-fg-muted text-xs uppercase tracking-wide mb-2">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {contract.platforms.map((p) => (
                <Badge key={p} variant="neutral" label={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ContractTab.propTypes = {
  contract:  PropTypes.object,
  isLoading: PropTypes.bool,
};
