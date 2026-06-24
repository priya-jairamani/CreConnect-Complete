import { useState } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import CampaignHealthRing from './CampaignHealthRing';
import CampaignRiskBadge from './CampaignRiskBadge';
import CampaignPerformanceChart from './CampaignPerformanceChart';
import CampaignTimeline from './CampaignTimeline';
import CreatorContributionTable from './CreatorContributionTable';
import BudgetTracker from './BudgetTracker';
import { STATUS_META } from '@/utils/mockCampaignIntelligence';
import { formatFollowers, formatEngagement, formatCompactPKR } from '@/utils/formatters';

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'creators', label: 'Creators', icon: '✦' },
  { id: 'deliverables', label: 'Deliverables', icon: '🎬' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'payments', label: 'Payments', icon: '💰' },
  { id: 'communications', label: 'Communications', icon: '💬' },
  { id: 'reports', label: 'Reports', icon: '📄' },
  { id: 'activity', label: 'Activity', icon: '🕒' },
];

const PARTICIPANT_STATUS_VARIANT = { Active: 'success', Completed: 'brand', Pending: 'warning', Removed: 'danger' };
const PAYMENT_STATUS_VARIANT = { Paid: 'success', Pending: 'warning', Escrowed: 'brand', Refunded: 'danger' };
const DELIVERABLE_STATUS_VARIANT = { Completed: 'success', 'In Progress': 'brand', Pending: 'neutral', Overdue: 'danger' };
const REVIEW_STATUS_VARIANT = { Approved: 'success', 'Pending Review': 'warning', 'Needs Revision': 'warning', Rejected: 'danger', '—': 'neutral' };
const APPROVAL_VARIANT = { Approved: 'success', Pending: 'warning', Rejected: 'danger' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CampaignDrawer({ campaign, onClose, onAction }) {
  const [subTab, setSubTab] = useState('overview');

  if (!campaign) return <Drawer isOpen={false} onClose={onClose} />;

  const statusMeta = STATUS_META[campaign.activeStatus] ?? STATUS_META.active;
  const { performance } = campaign;

  return (
    <Drawer
      isOpen={!!campaign}
      onClose={onClose}
      size="2xl"
      icon="📋"
      title={campaign.name}
      subtitle={`${campaign.brand} · ${campaign.industry} · ${campaign.id}`}
      headerExtra={<CampaignRiskBadge level={campaign.riskLevel} />}
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusMeta.variant} label={statusMeta.label} dot />
            <Badge variant="neutral" label={campaign.type} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {campaign.activeStatus === 'active' && (
              <Button variant="secondary" size="sm" onClick={() => onAction?.('pause', campaign)}>Pause</Button>
            )}
            {campaign.activeStatus === 'paused' && (
              <Button variant="success" size="sm" onClick={() => onAction?.('resume', campaign)}>Resume</Button>
            )}
            {campaign.activeStatus !== 'archived' && (
              <Button variant="secondary" size="sm" onClick={() => onAction?.('archive', campaign)}>Archive</Button>
            )}
            <Button variant="primary" size="sm" onClick={() => onAction?.('broadcast', campaign)}>Broadcast Update</Button>
          </div>
        </div>
      }
    >
      {/* Sub-tab bar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 px-5 py-3 overflow-x-auto border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              subTab === t.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg hover:bg-white/5'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* ── OVERVIEW ── */}
        {subTab === 'overview' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <CampaignHealthRing score={campaign.healthScore} size={96} />
              <div className="flex-1 space-y-3">
                <p className="text-sm text-fg-muted leading-relaxed">{campaign.description}</p>
                <div>
                  <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Objectives</p>
                  <ul className="space-y-1">
                    {campaign.objectives.map((o, i) => (
                      <li key={i} className="text-sm text-fg flex items-start gap-2">
                        <span className="text-brand-400 mt-0.5">•</span>{o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Industry', value: campaign.industry },
                { label: 'Budget', value: formatCompactPKR(campaign.budget) },
                { label: 'Creator Count', value: campaign.creatorCount },
                { label: 'Completion', value: `${campaign.progress}%` },
                { label: 'Campaign Manager', value: campaign.campaignManager },
                { label: 'Created', value: formatDate(campaign.createdDate) },
                { label: 'Deadline', value: formatDate(campaign.deadline) },
                { label: 'Applications', value: campaign.applications },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs text-fg-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1.5">Deliverables</p>
              <div className="flex items-center gap-2 flex-wrap">
                {campaign.deliverablesList.map((d) => <Badge key={d} variant="brand" label={d} />)}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Timeline Progress</p>
              <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${campaign.progress}%`, transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }} />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-fg-muted">
                <span>{formatDate(campaign.createdDate)}</span>
                <span>{campaign.progress}% complete</span>
                <span>{formatDate(campaign.deadline)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATORS ── */}
        {subTab === 'creators' && (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm" style={{ minWidth: 760 }}>
              <thead>
                <tr className="text-left text-fg-muted text-xs uppercase tracking-wide">
                  <th className="px-2 py-2 font-medium">Creator</th>
                  <th className="px-2 py-2 font-medium">Followers</th>
                  <th className="px-2 py-2 font-medium">Engagement</th>
                  <th className="px-2 py-2 font-medium">Role</th>
                  <th className="px-2 py-2 font-medium">Deliverables</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Score</th>
                  <th className="px-2 py-2 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {campaign.participants.map((p) => (
                  <tr key={p.id} className="border-t border-border-subtle">
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar initials={p.initials} size="sm" color={p.color} />
                        <div className="min-w-0">
                          <p className="text-fg font-medium truncate">{p.name}</p>
                          <p className="text-xs text-fg-muted truncate">{p.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-fg">{formatFollowers(p.followers)}</td>
                    <td className="px-2 py-2.5 text-fg">{formatEngagement(p.engagement / 100)}</td>
                    <td className="px-2 py-2.5 text-fg-muted">{p.role}</td>
                    <td className="px-2 py-2.5 text-fg">{p.deliverables}</td>
                    <td className="px-2 py-2.5"><Badge variant={PARTICIPANT_STATUS_VARIANT[p.status] ?? 'neutral'} label={p.status} /></td>
                    <td className="px-2 py-2.5"><span className="font-semibold text-brand-400">{p.performanceScore}</span></td>
                    <td className="px-2 py-2.5"><Badge variant={PAYMENT_STATUS_VARIANT[p.paymentStatus] ?? 'neutral'} label={p.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── DELIVERABLES ── */}
        {subTab === 'deliverables' && (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm" style={{ minWidth: 680 }}>
              <thead>
                <tr className="text-left text-fg-muted text-xs uppercase tracking-wide">
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Due Date</th>
                  <th className="px-2 py-2 font-medium">Submitted</th>
                  <th className="px-2 py-2 font-medium">Review</th>
                  <th className="px-2 py-2 font-medium">Revisions</th>
                </tr>
              </thead>
              <tbody>
                {campaign.deliverableTracker.map((d) => (
                  <tr key={d.id} className="border-t border-border-subtle">
                    <td className="px-2 py-2.5 text-fg font-medium">{d.type}</td>
                    <td className="px-2 py-2.5"><Badge variant={DELIVERABLE_STATUS_VARIANT[d.status] ?? 'neutral'} label={d.status} /></td>
                    <td className="px-2 py-2.5 text-fg-muted">{formatDate(d.dueDate)}</td>
                    <td className="px-2 py-2.5 text-fg-muted">{d.submissionDate ? formatDate(d.submissionDate) : '—'}</td>
                    <td className="px-2 py-2.5"><Badge variant={REVIEW_STATUS_VARIANT[d.reviewStatus] ?? 'neutral'} label={d.reviewStatus} /></td>
                    <td className="px-2 py-2.5 text-fg">{d.revisionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {subTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Reach', value: formatFollowers(performance.reach) },
                { label: 'Impressions', value: formatFollowers(performance.impressions) },
                { label: 'Engagement', value: formatFollowers(performance.engagement) },
                { label: 'Views', value: formatFollowers(performance.views) },
                { label: 'Clicks', value: formatFollowers(performance.clicks) },
                { label: 'Conversions', value: performance.conversions.toLocaleString() },
                { label: 'ROI', value: `${performance.roi}%` },
                { label: 'Revenue', value: formatCompactPKR(performance.revenue) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs text-fg-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-fg mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <CampaignPerformanceChart
              title="Performance Trend"
              data={campaign.performanceTrend}
              series={[
                { key: 'reach', label: 'Reach', color: '#6d5cff' },
                { key: 'engagement', label: 'Engagement', color: '#22c1ff' },
                { key: 'conversions', label: 'Conversions', color: '#16b364' },
              ]}
            />

            <div>
              <p className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Creator Contribution</p>
              <CreatorContributionTable creators={campaign.creatorContribution} />
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {subTab === 'payments' && (
          <BudgetTracker
            budget={campaign.budget}
            spent={campaign.spent}
            escrow={campaign.escrow}
            remaining={campaign.remaining}
            creatorPayments={campaign.creatorPayments}
            pendingPayments={campaign.pendingPayments}
            refunds={campaign.refunds}
          />
        )}

        {/* ── COMMUNICATIONS ── */}
        {subTab === 'communications' && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Messages</p>
              <div className="space-y-2">
                {campaign.communications.messages.map((m) => (
                  <div key={m.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-sm text-fg"><span className="font-semibold">{m.from}:</span> {m.text}</p>
                    <p className="text-xs text-fg-muted mt-1">{formatDate(m.date)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Announcements</p>
              <div className="space-y-2">
                {campaign.communications.announcements.map((a) => (
                  <div key={a.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-sm text-fg">{a.title}</p>
                    <p className="text-xs text-fg-muted">{formatDate(a.date)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Updates</p>
              <div className="space-y-2">
                {campaign.communications.updates.map((u) => (
                  <div key={u.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-sm text-fg">{u.title}</p>
                    <p className="text-xs text-fg-muted">{formatDate(u.date)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Approval Requests</p>
              <div className="space-y-2">
                {campaign.communications.approvalRequests.map((a) => (
                  <div key={a.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-sm text-fg">{a.title}</p>
                    <Badge variant={APPROVAL_VARIANT[a.status] ?? 'neutral'} label={a.status} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">Feedback Threads</p>
              <div className="space-y-2">
                {campaign.communications.feedbackThreads.map((f) => (
                  <div key={f.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-sm text-fg">{f.title}</p>
                    <span className="text-xs text-fg-muted">{f.replies} replies</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {subTab === 'reports' && (
          <div className="space-y-3">
            <p className="text-sm text-fg-muted">Generate and export reports for this campaign.</p>
            {[
              { id: 'campaign', label: 'Campaign Report', desc: 'Full overview including objectives, timeline & deliverables.' },
              { id: 'performance', label: 'Performance Report', desc: 'Reach, impressions, engagement, conversions & trends.' },
              { id: 'roi', label: 'ROI Report', desc: 'Budget utilisation, revenue generated & return on investment.' },
              { id: 'creator', label: 'Creator Report', desc: 'Per-creator contribution, deliverables & payment status.' },
            ].map((r) => (
              <div key={r.id} className="rounded-xl p-3 flex items-center justify-between gap-3" style={{ background: 'var(--surface-2)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">{r.label}</p>
                  <p className="text-xs text-fg-muted mt-0.5">{r.desc}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => onAction?.('export', campaign)}>Export</Button>
              </div>
            ))}
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {subTab === 'activity' && <CampaignTimeline items={campaign.activity} />}
      </div>
    </Drawer>
  );
}

CampaignDrawer.propTypes = {
  campaign: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};
