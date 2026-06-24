import { useMemo, useState } from 'react';
import Badge from '@/components/common/Badge';
import DisputeCard from './DisputeCard';
import InvestigationTimeline from './InvestigationTimeline';
import { DISPUTES_TS, DISPUTE_STAGE_META, DISPUTE_FILTER_OPTIONS, DISPUTE_STAGE_VARIANT } from '@/utils/mockTrustSafety';
import { formatPKR } from '@/utils/formatters';

const VARIANT_COLOR = {
  brand: 'var(--brand-500)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  neutral: 'var(--fg-muted)',
};

/** Dispute Resolution Center — payment, contract, deliverable & content approval disputes. */
export default function DisputesTab() {
  const [typeFilter, setTypeFilter] = useState(DISPUTE_FILTER_OPTIONS.type[0]);
  const [stageFilter, setStageFilter] = useState(DISPUTE_FILTER_OPTIONS.stage[0]);
  const [expanded, setExpanded] = useState(null);

  const stageCounts = useMemo(() => {
    const counts = {};
    DISPUTE_STAGE_META.forEach((s) => { counts[s.id] = 0; });
    DISPUTES_TS.forEach((d) => { counts[d.stage] += 1; });
    return counts;
  }, []);

  const totalAmount = useMemo(() => DISPUTES_TS.reduce((sum, d) => sum + d.amount, 0), []);

  const filtered = useMemo(() => {
    return DISPUTES_TS.filter((d) => {
      if (typeFilter !== DISPUTE_FILTER_OPTIONS.type[0] && d.type !== typeFilter) return false;
      if (stageFilter !== DISPUTE_FILTER_OPTIONS.stage[0] && d.status !== stageFilter) return false;
      return true;
    });
  }, [typeFilter, stageFilter]);

  return (
    <div className="space-y-6">
      {/* Dispute resolution flow */}
      <div>
        <h3 className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Dispute Resolution Flow</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DISPUTE_STAGE_META.map((stage) => (
            <div key={stage.id} className="card rounded-2xl p-4">
              <p className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{stageCounts[stage.id]}</p>
              <p className="text-xs text-fg-muted mt-1">{stage.label}</p>
              <div className="h-1 rounded-full mt-2" style={{ background: VARIANT_COLOR[DISPUTE_STAGE_VARIANT[stage.id]] ?? VARIANT_COLOR.neutral, opacity: 0.6 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Summary + filters */}
      <div className="card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[160px]">
          <p className="text-xs text-fg-muted">Total Amount Involved</p>
          <p className="text-lg font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{formatPKR(totalAmount)}</p>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-base text-sm py-1.5 px-3 rounded-lg w-auto"
          aria-label="Dispute Type"
        >
          {DISPUTE_FILTER_OPTIONS.type.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="input-base text-sm py-1.5 px-3 rounded-lg w-auto"
          aria-label="Dispute Stage"
        >
          {DISPUTE_FILTER_OPTIONS.stage.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      {/* Dispute cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((dispute) => {
          const isExpanded = expanded === dispute.id;
          return (
            <div key={dispute.id}>
              <DisputeCard dispute={dispute} onAction={() => setExpanded(isExpanded ? null : dispute.id)} />
              {isExpanded && (
                <div className="card rounded-2xl p-4 mt-2 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Evidence</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {dispute.evidence.map((e) => <Badge key={e} variant="brand" label={e} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Timeline</p>
                    <InvestigationTimeline items={dispute.timeline} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
