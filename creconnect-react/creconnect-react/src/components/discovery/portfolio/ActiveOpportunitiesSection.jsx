import { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatPKR } from '@/utils/formatters';

export default function ActiveOpportunitiesSection({ campaigns, onApply }) {
  const [appliedIds, setAppliedIds] = useState([]);
  const [applyingId, setApplyingId] = useState(null);

  if (!campaigns.length) {
    return <p className="text-fg-muted text-sm">No open campaigns right now. Check back later for new opportunities.</p>;
  }

  const handleApply = async (campaign) => {
    if (appliedIds.includes(campaign.id)) return;
    setApplyingId(campaign.id);
    try {
      await onApply(campaign);
      setAppliedIds((prev) => [...prev, campaign.id]);
    } catch { /* handled by parent */ }
    setApplyingId(null);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {campaigns.map((c) => {
        const applied = appliedIds.includes(c.id);
        return (
          <div key={c.id} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-fg text-sm font-semibold leading-snug" style={{ fontFamily: 'Sora, sans-serif' }}>{c.title}</h4>
              {(c.budgetMin > 0 || c.budgetMax > 0) && (
                <Badge variant="success" label={c.budgetMin === c.budgetMax ? formatPKR(c.budgetMin) : `${formatPKR(c.budgetMin)} – ${formatPKR(c.budgetMax)}`} />
              )}
            </div>
            {c.timeline && <p className="text-fg-muted text-xs">⏱ Timeline: {c.timeline}</p>}
            {c.niches?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {c.niches.map((n) => <Badge key={n} variant="brand" label={n} />)}
              </div>
            )}
            {c.requirements?.length > 0 && (
              <div>
                <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-1">Requirements</p>
                <ul className="text-fg-muted text-xs space-y-0.5 list-disc list-inside">
                  {c.requirements.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            )}
            {c.deliverables?.length > 0 && (
              <div>
                <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-1">Deliverables</p>
                <ul className="text-fg-muted text-xs space-y-0.5 list-disc list-inside">
                  {c.deliverables.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            )}
            <Button
              variant="primary"
              size="sm"
              isLoading={applyingId === c.id}
              disabled={applied}
              onClick={() => handleApply(c)}
              className="mt-1"
            >
              {applied ? '✓ Applied' : 'Apply Directly'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

ActiveOpportunitiesSection.propTypes = {
  campaigns: PropTypes.array.isRequired,
  onApply:   PropTypes.func.isRequired,
};
