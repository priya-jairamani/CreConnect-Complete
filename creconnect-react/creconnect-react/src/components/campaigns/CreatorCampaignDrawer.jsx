import { useState } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { formatPKR } from '@/utils/formatters';
import { campaignsApi } from '@/api/campaigns.api';
import { useToast } from '@/hooks/useToast';

const SUB_TABS = [
  { id: 'brief',        label: 'Brief',          icon: '📋' },
  { id: 'deliverables', label: 'Deliverables',   icon: '🎬' },
  { id: 'requirements', label: 'Requirements',   icon: '✦'  },
  { id: 'timeline',     label: 'Timeline',       icon: '📅' },
  { id: 'budget',       label: 'Budget',         icon: '💰' },
];

const DELIVERABLE_META = {
  reels:       { label: 'Reels',       icon: '🎬' },
  posts:       { label: 'Posts',       icon: '🖼️' },
  stories:     { label: 'Stories',     icon: '⚡' },
  videos:      { label: 'Videos',      icon: '🎥' },
  livestreams: { label: 'Livestreams', icon: '🔴' },
};

const PLATFORM_COLORS = {
  INSTAGRAM: '#E1306C', TIKTOK: '#010101', YOUTUBE: '#FF0000',
  FACEBOOK:  '#1877F2', LINKEDIN: '#0A66C2', X: '#000000', TWITTER: '#000000',
};
const PLATFORM_LABELS = {
  INSTAGRAM: 'Instagram', TIKTOK: 'TikTok', YOUTUBE: 'YouTube',
  FACEBOOK: 'Facebook', LINKEDIN: 'LinkedIn', X: 'X (Twitter)', TWITTER: 'X (Twitter)',
};

const OBJECTIVE_META = {
  AWARENESS:   { label: 'Brand Awareness', icon: '📣', color: '#6d5cff' },
  ENGAGEMENT:  { label: 'Engagement Boost', icon: '💬', color: '#22c1ff' },
  CONVERSIONS: { label: 'Sales / Conversions', icon: '🛒', color: '#16b364' },
  LAUNCH:      { label: 'Product Launch', icon: '🚀', color: '#f59e0b' },
};

const BUDGET_TYPE_LABELS = {
  FIXED:       'Fixed Price',
  MILESTONE:   'Milestone-Based',
  PERFORMANCE: 'Performance-Based (CPM/CPE)',
};

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-fg-muted text-xs font-medium flex-shrink-0">{label}</span>
      <span className="text-fg text-sm text-right font-medium">{value}</span>
    </div>
  );
}
InfoRow.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node };

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / 86_400_000);
}
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CreatorCampaignDrawer({ campaign, isOpen, onClose, isApplied, onApplySuccess }) {
  const toast              = useToast();
  const [subTab, setSubTab]  = useState('brief');
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applied,   setApplied]   = useState(isApplied ?? false);

  if (!campaign) return null;

  const brand    = campaign.brand ?? {};
  const obj      = OBJECTIVE_META[campaign.objective] ?? OBJECTIVE_META.AWARENESS;
  const platforms= campaign.platforms ?? [];
  const deliverables = {
    reels:       campaign.reels       ?? 0,
    posts:       campaign.posts       ?? 0,
    stories:     campaign.stories     ?? 0,
    videos:      campaign.videos      ?? 0,
    livestreams: campaign.livestreams ?? 0,
  };
  const delivList = Object.entries(deliverables).filter(([, v]) => v > 0);
  const days = daysUntil(campaign.deadline);
  const budgetStr = (() => {
    if (campaign.budgetMin != null && campaign.budgetMax != null) {
      return campaign.budgetMin === campaign.budgetMax
        ? formatPKR(campaign.budgetMin)
        : `${formatPKR(campaign.budgetMin)} – ${formatPKR(campaign.budgetMax)}`;
    }
    return formatPKR(campaign.budgetPKR ?? 0);
  })();

  async function handleApply() {
    if (applied) return;
    setApplying(true);
    try {
      await campaignsApi.apply(campaign.id, { note: coverNote.trim() || undefined });
      setApplied(true);
      onApplySuccess?.(campaign.id);
      toast.success('Application submitted! The brand will be in touch soon.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to apply. Please try again.');
    }
    setApplying(false);
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      icon={obj.icon}
      title={campaign.title}
      subtitle={`${brand.companyName ?? 'Brand'} · ${campaign.niche ?? ''}`}
      headerExtra={
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: `${obj.color}18`, color: obj.color }}>
            {obj.label}
          </span>
          <Badge variant={campaign.status === 'PUBLISHED' ? 'success' : 'neutral'} label={campaign.status ?? 'Open'} dot />
        </div>
      }
      footer={
        applied ? (
          <div className="flex items-center gap-3">
            <span className="text-success font-semibold text-sm">✓ You've applied to this campaign</span>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Add a short cover note to the brand (optional)…"
              rows={2}
              className="input-base w-full resize-none text-sm"
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
              <Button variant="primary" size="sm" isLoading={applying} onClick={handleApply}>
                🚀 Apply Now
              </Button>
            </div>
          </div>
        )
      }
    >
      {/* Sub-tab bar */}
      <div
        className="sticky top-0 z-10 flex items-center gap-1 px-5 py-3 overflow-x-auto border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              subTab === t.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg hover:bg-white/5'
            }`}
          >
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">

        {/* ── BRIEF ── */}
        {subTab === 'brief' && (
          <div className="space-y-5">
            {/* Brand card */}
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <Avatar src={brand.logoUrl} initials={(brand.companyName ?? 'BR').slice(0, 2).toUpperCase()} size="md" />
              <div>
                <p className="font-semibold text-fg">{brand.companyName ?? '—'}</p>
                <p className="text-fg-muted text-xs">{brand.industry ?? ''}</p>
              </div>
              {brand.isVerified && <Badge variant="success" label="✓ Verified Brand" className="ml-auto" />}
            </div>

            {/* Campaign stats tiles */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Budget', value: budgetStr },
                { label: 'Deadline', value: days != null ? (days < 0 ? 'Expired' : `${days} days`) : '—' },
                { label: 'Objective', value: obj.label },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <p className="text-fg font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
                  <p className="text-fg-muted text-[10px] mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {campaign.description && (
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Campaign Brief</p>
                <p className="text-fg-muted text-sm leading-relaxed">{campaign.description}</p>
              </div>
            )}

            {/* Platforms */}
            {platforms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Target Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                      style={{ background: PLATFORM_COLORS[p] ?? '#9aa1b6' }}
                    >
                      {PLATFORM_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content guidelines */}
            {campaign.contentGuidelines && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.15)' }}>
                <p className="text-xs font-semibold text-brand-400 mb-1.5">Content Guidelines</p>
                <p className="text-fg-muted text-sm leading-relaxed">{campaign.contentGuidelines}</p>
              </div>
            )}
          </div>
        )}

        {/* ── DELIVERABLES ── */}
        {subTab === 'deliverables' && (
          <div className="space-y-4">
            <p className="text-xs text-fg-muted">Deliverables you need to create and submit for this campaign.</p>
            {delivList.length > 0 ? (
              <div className="space-y-2">
                {delivList.map(([key, count]) => {
                  const meta = DELIVERABLE_META[key] ?? { label: key, icon: '📌' };
                  return (
                    <div key={key} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <span className="text-2xl flex-shrink-0">{meta.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-fg text-sm">{meta.label}</p>
                        <p className="text-fg-muted text-xs mt-0.5">Submit within campaign timeline</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-fg text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{count}</p>
                        <p className="text-fg-muted text-[10px]">{count === 1 ? 'piece' : 'pieces'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-fg-muted text-sm">Deliverable details not specified. Contact the brand for more information.</p>
            )}

            {/* Content type */}
            {campaign.contentType && (
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <p className="text-xs text-fg-muted mb-1">Primary Content Format</p>
                <Badge variant="brand" label={campaign.contentType.replace(/_/g, ' ')} />
              </div>
            )}
          </div>
        )}

        {/* ── REQUIREMENTS ── */}
        {subTab === 'requirements' && (
          <div className="space-y-4">
            <p className="text-xs text-fg-muted">Make sure you meet these requirements before applying.</p>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="px-4 py-2 text-xs font-semibold text-fg-muted uppercase tracking-wider" style={{ background: 'var(--surface-2)' }}>
                Creator Requirements
              </div>
              <div className="px-4 divide-y" style={{ borderColor: 'var(--border)' }}>
                <InfoRow label="Min. Followers"   value={campaign.followerMin  ? `${(campaign.followerMin  / 1000).toFixed(0)}K+` : 'No minimum'} />
                <InfoRow label="Max. Followers"   value={campaign.followerMax  ? `${(campaign.followerMax  / 1000).toFixed(0)}K`  : 'No maximum'} />
                <InfoRow label="Min. Engagement"  value={campaign.engagementMin ? `${campaign.engagementMin}%+` : 'No minimum'} />
                <InfoRow label="Target Location"  value={campaign.targetLocation ?? 'Any'} />
                <InfoRow label="Niche / Category" value={campaign.niche ?? 'Any'} />
                {campaign.languages?.length > 0 && (
                  <InfoRow label="Languages" value={campaign.languages.join(', ')} />
                )}
              </div>
            </div>

            {/* Required platforms */}
            {platforms.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="px-4 py-2 text-xs font-semibold text-fg-muted uppercase tracking-wider" style={{ background: 'var(--surface-2)' }}>
                  Required Platforms
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                      style={{ background: PLATFORM_COLORS[p] ?? '#9aa1b6' }}
                    >
                      {PLATFORM_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TIMELINE ── */}
        {subTab === 'timeline' && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="px-4 py-2 text-xs font-semibold text-fg-muted uppercase tracking-wider" style={{ background: 'var(--surface-2)' }}>
                Campaign Timeline
              </div>
              <div className="px-4 divide-y" style={{ borderColor: 'var(--border)' }}>
                <InfoRow label="Start Date"      value={fmtDate(campaign.startDate)} />
                <InfoRow label="Final Deadline"  value={fmtDate(campaign.deadline)} />
                <InfoRow label="Days Remaining"  value={days != null ? (days < 0 ? 'Expired' : `${days} days`) : '—'} />
              </div>
            </div>

            {/* Milestone steps */}
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3">Review Stages</p>
              <div className="space-y-3">
                {[
                  { label: 'Application Review',    desc: 'Brand reviews your application',      icon: '📋' },
                  { label: 'Negotiation',           desc: 'Agree on final terms and payout',     icon: '🤝' },
                  { label: 'Content Draft',         desc: 'Submit your draft for brand approval', icon: '✏️' },
                  { label: 'Brand Approval',        desc: 'Brand reviews and approves content',   icon: '✅' },
                  { label: 'Publish & Submit',      desc: 'Publish content and submit proof',     icon: '🚀' },
                  { label: 'Payment Released',      desc: 'Payment released to your account',     icon: '💰' },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      >
                        {step.icon}
                      </div>
                      {i < 5 && <div className="w-px flex-1 mt-1" style={{ height: 16, background: 'var(--border)' }} />}
                    </div>
                    <div className="pb-3">
                      <p className="text-fg text-sm font-medium">{step.label}</p>
                      <p className="text-fg-muted text-xs mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BUDGET ── */}
        {subTab === 'budget' && (
          <div className="space-y-4">
            <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.15)' }}>
              <p className="text-fg-muted text-xs mb-1">Total Campaign Budget</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--brand-400)' }}>{budgetStr}</p>
              {campaign.budgetType && (
                <p className="text-fg-muted text-xs mt-1">{BUDGET_TYPE_LABELS[campaign.budgetType] ?? campaign.budgetType}</p>
              )}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="px-4 py-2 text-xs font-semibold text-fg-muted uppercase tracking-wider" style={{ background: 'var(--surface-2)' }}>
                Payment Details
              </div>
              <div className="px-4 divide-y" style={{ borderColor: 'var(--border)' }}>
                <InfoRow label="Budget Type"  value={BUDGET_TYPE_LABELS[campaign.budgetType] ?? campaign.budgetType ?? '—'} />
                <InfoRow label="Min. Payout"  value={campaign.budgetMin != null ? formatPKR(campaign.budgetMin) : '—'} />
                <InfoRow label="Max. Payout"  value={campaign.budgetMax != null ? formatPKR(campaign.budgetMax) : '—'} />
                <InfoRow label="Currency"     value={campaign.currency ?? 'PKR'} />
              </div>
            </div>

            <div className="rounded-xl p-4 space-y-1.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold text-fg-muted">Payment Protection</p>
              {[
                '✓ All payments are held in escrow until content approval',
                '✓ Funds released within 3 business days of approval',
                '✓ Dispute resolution available if payment is delayed',
              ].map((t) => (
                <p key={t} className="text-xs text-fg-muted">{t}</p>
              ))}
            </div>
          </div>
        )}

      </div>
    </Drawer>
  );
}

CreatorCampaignDrawer.propTypes = {
  campaign:       PropTypes.object,
  isOpen:         PropTypes.bool.isRequired,
  onClose:        PropTypes.func.isRequired,
  isApplied:      PropTypes.bool,
  onApplySuccess: PropTypes.func,
};
