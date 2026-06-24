import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import UserScoreRing from './UserScoreRing';
import VerificationBadge from './VerificationBadge';
import RiskIndicator from './RiskIndicator';
import UserTimeline from './UserTimeline';
import { STATUS_META } from '@/utils/mockUserIntelligence';
import { formatPKR, timeAgo } from '@/utils/formatters';

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

const SCORE_FIELDS = [
  { key: 'trustScore', label: 'Trust Score' },
  { key: 'creatorSatisfaction', label: 'Creator Satisfaction' },
  { key: 'paymentReliability', label: 'Payment Reliability' },
  { key: 'fraudRisk', label: 'Fraud Risk' },
];

const DOC_LABELS = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected' };
const DOC_VARIANT = { approved: 'success', pending: 'warning', rejected: 'danger' };
const PAY_VARIANT = { Paid: 'success', Pending: 'warning', Failed: 'danger' };

/** Slide-over intelligence panel for a single brand. */
export default function BrandDrawer({ brand, onClose, onAction }) {
  if (!brand) return null;
  const statusMeta = STATUS_META[brand.status] ?? STATUS_META.active;

  return (
    <Drawer
      isOpen={!!brand}
      onClose={onClose}
      icon="🏢"
      title={brand.companyName}
      subtitle={`${brand.industry} · ${brand.country}`}
      size="2xl"
      headerExtra={<RiskIndicator level={brand.riskLevel} />}
      footer={
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusMeta.variant} label={statusMeta.label} dot />
            <VerificationBadge status={brand.verification} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {brand.verification !== 'verified' && (
              <Button variant="success" size="sm" onClick={() => onAction?.('verify', brand)}>Verify</Button>
            )}
            {brand.status !== 'suspended' ? (
              <Button variant="danger" size="sm" onClick={() => onAction?.('suspend', brand)}>Suspend</Button>
            ) : (
              <Button variant="success" size="sm" onClick={() => onAction?.('activate', brand)}>Restore</Button>
            )}
          </div>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        {/* ── Company Information ─────────────────────── */}
        <CollapsibleSection icon="🏢" title="Company Information">
          <div className="flex items-start gap-4 flex-wrap">
            <Avatar initials={getInitials(brand.companyName)} size="2xl" color="#4c2dd1" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-fg font-semibold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{brand.companyName}</p>
              <p className="text-fg-muted text-sm">{brand.documents.website}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {brand.tags.map((t) => <Badge key={t} variant="neutral" label={t} />)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><p className="text-fg-muted text-xs">Industry</p><p className="text-fg font-semibold">{brand.industry}</p></div>
              <div><p className="text-fg-muted text-xs">Country</p><p className="text-fg font-semibold">{brand.country}</p></div>
              <div><p className="text-fg-muted text-xs">Campaigns</p><p className="text-fg font-semibold">{brand.campaigns}</p></div>
              <div><p className="text-fg-muted text-xs">Total Spend</p><p className="text-fg font-semibold">{formatPKR(brand.totalSpend)}</p></div>
              <div><p className="text-fg-muted text-xs">Joined</p><p className="text-fg font-semibold">{new Date(brand.joinedAt).toLocaleDateString()}</p></div>
              <div><p className="text-fg-muted text-xs">Last Active</p><p className="text-fg font-semibold">{timeAgo(brand.lastActive)} ago</p></div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ── Brand Score System ──────────────────────── */}
        <CollapsibleSection icon="🏆" title="Trust & Performance Scores">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SCORE_FIELDS.map((f) => (
              <UserScoreRing key={f.key} value={brand[f.key]} label={f.label} />
            ))}
          </div>
        </CollapsibleSection>

        {/* ── Campaign Analytics ──────────────────────── */}
        <CollapsibleSection icon="📊" title="Campaign Analytics" subtitle={`${brand.campaignAnalytics.length} campaigns`}>
          <div className="space-y-2">
            {brand.campaignAnalytics.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-fg font-medium truncate">{c.name}</p>
                  <p className="text-xs text-fg-muted">{c.creators} creators · {new Date(c.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-fg font-semibold">{formatPKR(c.budget)}</span>
                  <Badge variant={c.status === 'Active' ? 'brand' : c.status === 'Completed' ? 'success' : 'neutral'} label={c.status} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* ── Spend History ───────────────────────────── */}
        <CollapsibleSection icon="💰" title="Spend History">
          <div className="flex items-end gap-3 h-32">
            {brand.spendHistory.map((r) => {
              const max = Math.max(...brand.spendHistory.map((x) => x.amount));
              const heightPct = Math.max(8, (r.amount / max) * 100);
              return (
                <div key={r.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-brand-gradient" style={{ height: `${heightPct}%` }} title={formatPKR(r.amount)} />
                  <span className="text-xs text-fg-muted">{r.label}</span>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* ── Creator Reviews ──────────────────────────── */}
        <CollapsibleSection icon="⭐" title="Creator Reviews" subtitle={`${brand.creatorReviews.length} reviews`}>
          <div className="space-y-3">
            {brand.creatorReviews.map((r) => (
              <div key={r.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-fg">{r.from}</p>
                  <span className="text-xs font-semibold text-warning">★ {r.rating}</span>
                </div>
                <p className="text-xs text-fg-muted mt-1">{r.comment}</p>
                <p className="text-[11px] text-fg-muted mt-1">{new Date(r.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* ── Payment History ──────────────────────────── */}
        <CollapsibleSection icon="💳" title="Payment History" subtitle={`${brand.paymentHistory.length} transactions`}>
          <div className="space-y-2">
            {brand.paymentHistory.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-fg font-medium truncate">{p.creator}</p>
                  <p className="text-xs text-fg-muted">{new Date(p.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-fg font-semibold">{formatPKR(p.amount)}</span>
                  <Badge variant={PAY_VARIANT[p.status] ?? 'neutral'} label={p.status} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* ── Verification ─────────────────────────────── */}
        <CollapsibleSection icon="🛂" title="Verification">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Business Documents</span>
              <Badge variant={DOC_VARIANT[brand.documents.business]} label={DOC_LABELS[brand.documents.business]} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Registration Records</span>
              <Badge variant={DOC_VARIANT[brand.documents.registration]} label={DOC_LABELS[brand.documents.registration]} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Website</span>
              <span className="text-sm text-fg">{brand.documents.website}</span>
            </div>
            {brand.adminNotes && (
              <div className="rounded-xl p-3 mt-2 border border-warning/25 bg-warning/10">
                <p className="text-xs font-semibold text-warning mb-1">Admin Notes</p>
                <p className="text-xs text-fg-muted">{brand.adminNotes}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ── Reports ──────────────────────────────────── */}
        <CollapsibleSection icon="🚩" title="Reports" subtitle={`${brand.reports.length} filed`} defaultOpen={brand.reports.length > 0}>
          {brand.reports.length === 0 ? (
            <p className="text-sm text-fg-muted">No reports filed against this brand.</p>
          ) : (
            <div className="space-y-2">
              {brand.reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-fg font-medium truncate">{r.reason}</p>
                    <p className="text-xs text-fg-muted">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={r.severity === 'high' ? 'danger' : r.severity === 'medium' ? 'warning' : 'brand'} label={r.status} />
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* ── Activity Timeline ───────────────────────── */}
        <CollapsibleSection icon="🕒" title="Activity Timeline">
          <UserTimeline items={brand.timeline} />
        </CollapsibleSection>
      </div>
    </Drawer>
  );
}

BrandDrawer.propTypes = {
  brand: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
