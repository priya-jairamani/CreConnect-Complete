import { useMemo, useState } from 'react';
import Badge from '@/components/common/Badge';
import RiskBadge from './RiskBadge';
import InvestigationTimeline from './InvestigationTimeline';
import { INVESTIGATIONS, INVESTIGATION_STATUS_META, SEVERITY_META } from '@/utils/mockTrustSafety';

const STATUS_ORDER = ['open', 'under_review', 'escalated', 'resolved', 'closed'];

const VARIANT_COLOR = {
  brand: 'var(--brand-500)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  neutral: 'var(--fg-muted)',
};

/** Investigations workspace — dedicated case dashboard with status pipeline & timelines. */
export default function InvestigationsTab() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const counts = useMemo(() => {
    const c = { open: 0, under_review: 0, escalated: 0, resolved: 0, closed: 0 };
    INVESTIGATIONS.forEach((inv) => { c[inv.status] += 1; });
    return c;
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return INVESTIGATIONS;
    return INVESTIGATIONS.filter((inv) => inv.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Status pipeline KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`card rounded-2xl p-4 text-left transition-colors ${statusFilter === 'all' ? 'ring-2 ring-brand-500' : ''}`}
        >
          <p className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{INVESTIGATIONS.length}</p>
          <p className="text-xs text-fg-muted mt-1">All Investigations</p>
        </button>
        {STATUS_ORDER.map((key) => {
          const meta = INVESTIGATION_STATUS_META[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`card rounded-2xl p-4 text-left transition-colors ${statusFilter === key ? 'ring-2 ring-brand-500' : ''}`}
            >
              <p className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{counts[key]}</p>
              <p className="text-xs text-fg-muted mt-1">{meta.label}</p>
              <div className="h-1 rounded-full mt-2" style={{ background: VARIANT_COLOR[meta.variant] ?? VARIANT_COLOR.neutral, opacity: 0.6 }} />
            </button>
          );
        })}
      </div>

      {/* Investigation cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((inv) => {
          const statusMeta = INVESTIGATION_STATUS_META[inv.status];
          const severityMeta = SEVERITY_META[inv.severity] ?? SEVERITY_META.low;
          const isExpanded = expanded === inv.id;
          return (
            <div key={inv.id} className="card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg truncate">{inv.title}</p>
                  <p className="text-xs text-fg-muted mt-0.5">{inv.id} · Assigned to {inv.admin}</p>
                </div>
                <Badge variant={statusMeta.variant} label={statusMeta.label} dot />
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                <Badge variant={severityMeta.variant} label={`${severityMeta.label} Severity`} />
                <RiskBadge level={inv.riskLevel} />
                <Badge variant="neutral" label={`Priority: ${inv.priority}`} />
                <Badge variant="neutral" label={`${inv.relatedReports.length} related report${inv.relatedReports.length === 1 ? '' : 's'}`} />
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-fg-muted">Risk Score: <span className="text-fg font-semibold">{inv.riskScore}</span></span>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : inv.id)}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  {isExpanded ? 'Hide Timeline ▲' : 'View Timeline ▼'}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <InvestigationTimeline items={inv.timeline} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
