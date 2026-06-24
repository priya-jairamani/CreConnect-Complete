import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import UserScoreRing from './UserScoreRing';
import VerificationBadge from './VerificationBadge';
import RiskIndicator from './RiskIndicator';
import UserAnalyticsPanel from './UserAnalyticsPanel';
import UserTimeline from './UserTimeline';
import { STATUS_META } from '@/utils/mockUserIntelligence';
import { formatFollowers, formatEngagement, formatPKR, timeAgo } from '@/utils/formatters';

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

const SCORE_FIELDS = [
  { key: 'creatorScore', label: 'Creator Score' },
  { key: 'audienceQuality', label: 'Audience Quality' },
  { key: 'trustScore', label: 'Trust Score' },
  { key: 'collaborationScore', label: 'Collaboration' },
  { key: 'brandSatisfaction', label: 'Brand Satisfaction' },
  { key: 'authenticityScore', label: 'Authenticity' },
];

const DOC_LABELS = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected' };
const DOC_VARIANT = { approved: 'success', pending: 'warning', rejected: 'danger' };

/** Slide-over intelligence panel for a single creator. */
export default function CreatorDrawer({ creator, onClose, onAction }) {
  if (!creator) return null;
  const statusMeta = STATUS_META[creator.status] ?? STATUS_META.active;

  const growthSeries = creator.followerGrowth.map((value, i) => ({
    label: `M${i + 1}`,
    value,
  }));

  return (
    <Drawer
      isOpen={!!creator}
      onClose={onClose}
      icon="✦"
      title={creator.name}
      subtitle={`${creator.handle} · ${creator.niche} · ${creator.country}`}
      size="2xl"
      headerExtra={<RiskIndicator level={creator.riskLevel} />}
      footer={
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusMeta.variant} label={statusMeta.label} dot />
            <VerificationBadge status={creator.verification} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {creator.verification !== 'verified' && (
              <Button variant="success" size="sm" onClick={() => onAction?.('verify', creator)}>Verify</Button>
            )}
            {creator.status !== 'suspended' ? (
              <Button variant="danger" size="sm" onClick={() => onAction?.('suspend', creator)}>Suspend</Button>
            ) : (
              <Button variant="success" size="sm" onClick={() => onAction?.('activate', creator)}>Restore</Button>
            )}
          </div>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        {/* ── Profile Overview ───────────────────────── */}
        <CollapsibleSection icon="👤" title="Profile Overview">
          <div className="flex items-start gap-4 flex-wrap">
            <Avatar initials={getInitials(creator.name)} size="2xl" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-fg font-semibold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{creator.name}</p>
              <p className="text-fg-muted text-sm">{creator.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {creator.tags.map((t) => <Badge key={t} variant="neutral" label={t} />)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><p className="text-fg-muted text-xs">Followers</p><p className="text-fg font-semibold">{formatFollowers(creator.followers)}</p></div>
              <div><p className="text-fg-muted text-xs">Engagement Rate</p><p className="text-fg font-semibold">{formatEngagement(creator.engagementRate / 100)}</p></div>
              <div><p className="text-fg-muted text-xs">Campaigns</p><p className="text-fg font-semibold">{creator.campaigns}</p></div>
              <div><p className="text-fg-muted text-xs">Earnings</p><p className="text-fg font-semibold">{formatPKR(creator.earnings)}</p></div>
              <div><p className="text-fg-muted text-xs">Joined</p><p className="text-fg font-semibold">{new Date(creator.joinedAt).toLocaleDateString()}</p></div>
              <div><p className="text-fg-muted text-xs">Last Active</p><p className="text-fg font-semibold">{timeAgo(creator.lastActive)} ago</p></div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ── Creator Score System ───────────────────── */}
        <CollapsibleSection icon="🏆" title="Creator Score System" subtitle="Performance & trust signals">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SCORE_FIELDS.map((f) => (
              <UserScoreRing key={f.key} value={creator[f.key]} label={f.label} />
            ))}
            <UserScoreRing value={creator.fraudRisk} label="Fraud Risk" />
          </div>
        </CollapsibleSection>

        {/* ── Audience Analytics ─────────────────────── */}
        <CollapsibleSection icon="📊" title="Audience Analytics">
          <UserAnalyticsPanel
            series={growthSeries}
            seriesLabel="Follower"
            ageBreakdown={creator.audienceBreakdown.age}
            genderBreakdown={creator.audienceBreakdown.gender}
          />
        </CollapsibleSection>

        {/* ── Campaign History ───────────────────────── */}
        <CollapsibleSection icon="🤝" title="Campaign History" subtitle={`${creator.campaignHistory.length} campaigns`}>
          <div className="space-y-2">
            {creator.campaignHistory.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-fg font-medium truncate">{c.name}</p>
                  <p className="text-xs text-fg-muted">{c.brand} · {new Date(c.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-fg font-semibold">{formatPKR(c.payout)}</span>
                  <Badge variant={c.status === 'Completed' ? 'success' : c.status === 'Cancelled' ? 'danger' : 'brand'} label={c.status} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* ── Revenue History ─────────────────────────── */}
        <CollapsibleSection icon="💰" title="Revenue History">
          <div className="flex items-end gap-3 h-32">
            {creator.revenueHistory.map((r) => {
              const max = Math.max(...creator.revenueHistory.map((x) => x.amount));
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

        {/* ── Reviews ──────────────────────────────────── */}
        <CollapsibleSection icon="⭐" title="Reviews" subtitle={`${creator.reviews.length} reviews`}>
          <div className="space-y-3">
            {creator.reviews.map((r) => (
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

        {/* ── Reports ──────────────────────────────────── */}
        <CollapsibleSection icon="🚩" title="Reports" subtitle={`${creator.reports.length} filed`} defaultOpen={creator.reports.length > 0}>
          {creator.reports.length === 0 ? (
            <p className="text-sm text-fg-muted">No reports filed against this creator.</p>
          ) : (
            <div className="space-y-2">
              {creator.reports.map((r) => (
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

        {/* ── Verification Status ─────────────────────── */}
        <CollapsibleSection icon="🛂" title="Verification Status">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Identity Documents</span>
              <Badge variant={DOC_VARIANT[creator.documents.identity]} label={DOC_LABELS[creator.documents.identity]} />
            </div>
            {creator.documents.socialAccounts.map((s) => (
              <div key={s.platform} className="flex items-center justify-between">
                <span className="text-sm text-fg-muted">{s.platform} ({s.handle})</span>
                <Badge variant={s.verified ? 'success' : 'neutral'} label={s.verified ? 'Verified' : 'Unverified'} />
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Website</span>
              <span className="text-sm text-fg">{creator.documents.website ?? '—'}</span>
            </div>
            {creator.adminNotes && (
              <div className="rounded-xl p-3 mt-2 border border-warning/25 bg-warning/10">
                <p className="text-xs font-semibold text-warning mb-1">Admin Notes</p>
                <p className="text-xs text-fg-muted">{creator.adminNotes}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ── Activity Timeline ───────────────────────── */}
        <CollapsibleSection icon="🕒" title="Activity Timeline">
          <UserTimeline items={creator.timeline} />
        </CollapsibleSection>
      </div>
    </Drawer>
  );
}

CreatorDrawer.propTypes = {
  creator: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
