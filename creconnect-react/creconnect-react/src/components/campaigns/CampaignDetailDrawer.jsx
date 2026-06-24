import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@/components/common/Drawer';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import Skeleton from '@/components/common/Skeleton';
import { campaignsApi } from '@/api/campaigns.api';
import { searchApi } from '@/api/search.api';
import { formatPKR, formatFollowers } from '@/utils/formatters';

/* ─── tiny helpers ─────────────────────────────────────────── */

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-fg-muted uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

function InfoGrid({ rows }) {
  return (
    <div
      className="rounded-2xl divide-y"
      style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', '--tw-divide-opacity': 1, borderColor: 'var(--border)' }}
    >
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <span className="text-fg-muted text-xs">{label}</span>
          <span className="text-fg text-xs font-medium text-right max-w-[55%] truncate">
            {value || <span className="text-fg-muted">—</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Tag({ label }) {
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)' }}
    >
      {label}
    </span>
  );
}

function DeliverableChip({ icon, label, count }) {
  if (!count) return null;
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <span>{icon}</span>
      <span className="text-fg text-xs">{label}</span>
      <span className="ml-auto text-fg font-bold text-xs">{count}</span>
    </div>
  );
}


/* ─── main component ────────────────────────────────────────── */

export default function CampaignDetailDrawer({ campaign, isOpen, onClose, onUpdate }) {

  const [applications,  setApplications]  = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [isUpdating,    setIsUpdating]    = useState(false);
  const [respondingId,  setRespondingId]  = useState(null);

  // ── Invite creators ────────────────────────────────────────────
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [inviteQuery,   setInviteQuery]   = useState('');
  const [inviteResults, setInviteResults] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const inviteTimerRef = useRef(null);

  useEffect(() => {
    if (!inviteOpen) return;
    clearTimeout(inviteTimerRef.current);
    inviteTimerRef.current = setTimeout(async () => {
      setInviteLoading(true);
      try {
        const params = {};
        if (inviteQuery.trim()) params.q = inviteQuery.trim();
        const { data } = await searchApi.creators(params);
        setInviteResults(Array.isArray(data) ? data : (data?.data ?? []));
      } catch {
        setInviteResults([]);
      } finally {
        setInviteLoading(false);
      }
    }, 350);
    return () => clearTimeout(inviteTimerRef.current);
  }, [inviteQuery, inviteOpen]);

  const [invitingId, setInvitingId] = useState(null);
  const [invitedIds, setInvitedIds] = useState(new Set());

  // Creator profile IDs that already have any application/invitation for this campaign
  const alreadyEngagedIds = useMemo(
    () => new Set(applications.map((a) => a.creatorId ?? a.creator?.id).filter(Boolean)),
    [applications]
  );

  const handleInviteCreator = async (creator) => {
    const profileId = creator.id;
    setInvitingId(profileId);
    try {
      const { data: newApp } = await campaignsApi.invite(campaign.id, profileId);
      setInvitedIds((prev) => new Set([...prev, profileId]));
      // Add the new invitation directly to the applications list
      if (newApp?.id) {
        setApplications((prev) => [...prev, { ...newApp, creator }]);
      }
    } catch {
      // fail silently — user can retry
    } finally {
      setInvitingId(null);
    }
  };

  const loadApplications = useCallback(async () => {
    if (!campaign?.id) return;
    setIsLoadingApps(true);
    try {
      const { data } = await campaignsApi.getApplications(campaign.id);
      setApplications(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      setApplications([]);
    } finally {
      setIsLoadingApps(false);
    }
  }, [campaign?.id]);

  useEffect(() => {
    if (isOpen && campaign?.id) {
      setApplications([]);
      loadApplications();
      setInvitedIds(new Set());
      setInviteOpen(false);
      setInviteQuery('');
      setInviteResults([]);
    }
  }, [isOpen, campaign?.id, loadApplications]);

  const handleStatusChange = async (newStatus) => {
    if (!campaign?.id) return;
    setIsUpdating(true);
    try {
      const { data } = await campaignsApi.update(campaign.id, { status: newStatus });
      onUpdate?.(data);
    } catch {}
    setIsUpdating(false);
  };

  const handleRespond = async (appId, action) => {
    setRespondingId(appId);
    try {
      await campaignsApi.respondApplication(appId, action);
      await loadApplications();
    } catch {}
    setRespondingId(null);
  };

  if (!campaign) return null;

  const c = campaign;

  const budgetText = c.budgetMin != null && c.budgetMax != null
    ? `${formatPKR(c.budgetMin)} – ${formatPKR(c.budgetMax)}`
    : c.budgetPKR ? formatPKR(c.budgetPKR) : '—';

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      icon="◈"
      title={c.title}
      subtitle={c.brand?.companyName ?? 'Your Campaign'}
      headerExtra={<Badge status={c.status} />}
    >
      {/* All content lives in the Drawer's already-scrollable body — no extra wrapper needed */}
      <div className="p-5 space-y-6">

        {/* ── Status actions ────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {c.status === 'DRAFT' && (
            <Button variant="primary"   size="sm" disabled={isUpdating} onClick={() => handleStatusChange('PUBLISHED')}>
              🚀 Publish Campaign
            </Button>
          )}
          {c.status === 'PUBLISHED' && (
            <Button variant="secondary" size="sm" disabled={isUpdating} onClick={() => handleStatusChange('PAUSED')}>
              ⏸ Pause
            </Button>
          )}
          {c.status === 'PAUSED' && (
            <Button variant="primary"   size="sm" disabled={isUpdating} onClick={() => handleStatusChange('PUBLISHED')}>
              ▶ Resume
            </Button>
          )}
          {(c.status === 'PUBLISHED' || c.status === 'PAUSED') && (
            <Button variant="danger"    size="sm" disabled={isUpdating} onClick={() => handleStatusChange('COMPLETED')}>
              ✓ Mark Complete
            </Button>
          )}
        </div>

        {/* ── Overview ──────────────────────────────────────────── */}
        <Section title="Campaign Overview">
          <InfoGrid rows={[
            { label: 'Status',       value: c.status },
            { label: 'Objective',    value: c.objective },
            { label: 'Niche',        value: c.niche },
            { label: 'Content Type', value: c.contentType },
            { label: 'Start Date',   value: fmtDate(c.startDate) },
            { label: 'Deadline',     value: fmtDate(c.deadline) },
            { label: 'Location',     value: c.targetLocation },
          ]} />
        </Section>

        {/* ── Budget ────────────────────────────────────────────── */}
        <Section title="Budget">
          <InfoGrid rows={[
            { label: 'Total Budget',  value: budgetText },
            { label: 'Budget Type',   value: c.budgetType },
            { label: 'Budget (PKR)',  value: c.budgetPKR  ? formatPKR(c.budgetPKR)  : null },
            { label: 'Min Budget',    value: c.budgetMin  ? formatPKR(c.budgetMin)  : null },
            { label: 'Max Budget',    value: c.budgetMax  ? formatPKR(c.budgetMax)  : null },
          ]} />
        </Section>

        {/* ── Description ───────────────────────────────────────── */}
        <Section title="Description">
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <p className="text-fg-muted text-sm leading-relaxed whitespace-pre-line">
              {c.description || 'No description provided.'}
            </p>
          </div>
        </Section>

        {/* ── Requirements ──────────────────────────────────────── */}
        <Section title="Requirements">
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <p className="text-fg-muted text-sm leading-relaxed whitespace-pre-line">
              {c.requirements || 'No requirements specified.'}
            </p>
          </div>
        </Section>

        {/* ── Creator criteria ──────────────────────────────────── */}
        <Section title="Creator Criteria">
          <InfoGrid rows={[
            { label: 'Min Followers',  value: c.followerMin   ? c.followerMin.toLocaleString('en-PK') : null },
            { label: 'Max Followers',  value: c.followerMax   ? c.followerMax.toLocaleString('en-PK') : null },
            { label: 'Min Engagement', value: c.engagementMin ? `${c.engagementMin}%`                 : null },
          ]} />
        </Section>

        {/* ── Platforms ─────────────────────────────────────────── */}
        <Section title="Platforms">
          {c.platforms?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {c.platforms.map((p) => <Tag key={p} label={p} />)}
            </div>
          ) : (
            <p className="text-fg-muted text-xs">Not specified</p>
          )}
        </Section>

        {/* ── Languages ─────────────────────────────────────────── */}
        <Section title="Languages">
          {c.languages?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {c.languages.map((l) => <Tag key={l} label={l} />)}
            </div>
          ) : (
            <p className="text-fg-muted text-xs">Not specified</p>
          )}
        </Section>

        {/* ── Deliverables ──────────────────────────────────────── */}
        <Section title="Deliverables">
          {(c.reels || c.posts || c.stories || c.videos || c.livestreams) ? (
            <div className="grid grid-cols-2 gap-2">
              <DeliverableChip icon="🎬" label="Reels"       count={c.reels} />
              <DeliverableChip icon="📸" label="Posts"       count={c.posts} />
              <DeliverableChip icon="⭕" label="Stories"     count={c.stories} />
              <DeliverableChip icon="▶️" label="Videos"      count={c.videos} />
              <DeliverableChip icon="📡" label="Livestreams" count={c.livestreams} />
            </div>
          ) : (
            <p className="text-fg-muted text-xs">No deliverables specified.</p>
          )}
        </Section>

        {/* ── Invite Creators ───────────────────────────────────── */}
        <Section title="Invite Creators">
          {!inviteOpen ? (
            <Button variant="secondary" size="sm" onClick={() => setInviteOpen(true)}>
              + Find &amp; Invite Creators
            </Button>
          ) : (
            <div className="space-y-3">
              {/* Search input */}
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={inviteQuery}
                  onChange={(e) => setInviteQuery(e.target.value)}
                  placeholder="Search by name or username…"
                  className="input-base flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => { setInviteOpen(false); setInviteQuery(''); setInviteResults([]); }}>
                  ✕
                </Button>
              </div>

              {/* Results */}
              {inviteLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
              ) : inviteResults.filter((cr) => !invitedIds.has(cr.id) && !alreadyEngagedIds.has(cr.id)).length === 0 ? (
                <p className="text-fg-muted text-xs text-center py-4">
                  {inviteResults.length > 0
                    ? 'All matching creators have already applied or been invited to this campaign.'
                    : inviteQuery ? 'No creators found.' : 'Start typing to search creators.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {inviteResults.filter((cr) => !invitedIds.has(cr.id) && !alreadyEngagedIds.has(cr.id)).map((cr) => (
                    <div
                      key={cr.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <Avatar
                        src={cr.avatarUrl}
                        initials={(cr.displayName || cr.username || '?').slice(0, 2).toUpperCase()}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-fg text-xs font-semibold truncate">
                          {cr.displayName || cr.username}
                        </p>
                        <p className="text-fg-muted text-[10px]">
                          {cr.niche} · {formatFollowers(cr.followerCount || 0)} followers
                        </p>
                      </div>
                      {invitedIds.has(cr.id) ? (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(22,179,100,0.12)', color: '#16b364' }}>
                          ✓ Sent
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="xs"
                          isLoading={invitingId === cr.id}
                          onClick={() => handleInviteCreator(cr)}
                        >
                          Invite
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-fg-muted">
                The creator will receive a notification about this campaign and can apply directly.
              </p>
            </div>
          )}
        </Section>

        {/* ── Applications ──────────────────────────────────────── */}
        <Section title={`Applications${applications.length ? ` (${applications.length})` : ''}`}>
          {isLoadingApps ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : applications.length === 0 ? (
            <div
              className="rounded-2xl px-4 py-6 text-center"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <p className="text-2xl mb-2">📭</p>
              <p className="text-fg-muted text-xs">No applications yet. Publish the campaign to start receiving them.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => {
                const cr = app.creator ?? {};
                const isBusy = respondingId === app.id;
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <Avatar
                      src={cr.avatarUrl}
                      initials={(cr.displayName || cr.username || '?').slice(0, 2).toUpperCase()}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-fg text-xs font-semibold truncate">
                        {cr.displayName || cr.username || '—'}
                      </p>
                      {app.note && (
                        <p className="text-fg-muted text-[10px] truncate">{app.note}</p>
                      )}
                      <p className="text-fg-muted text-[10px]">
                        {new Date(app.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === 'ACCEPTED' ? 'success' :
                        app.status === 'REJECTED' ? 'danger'  :
                        app.status === 'INVITED'  ? 'brand'   : 'warning'
                      }
                      label={app.status === 'INVITED' ? 'Invited' : app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                    />
                    {app.status === 'PENDING' && (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button variant="primary"   size="xs" disabled={isBusy} onClick={() => handleRespond(app.id, 'accept')}>✓ Accept</Button>
                        <Button variant="secondary" size="xs" disabled={isBusy} onClick={() => handleRespond(app.id, 'reject')}>✕</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Bottom padding so last section isn't flush with drawer edge */}
        <div className="h-4" />

      </div>
    </Drawer>
  );
}

CampaignDetailDrawer.propTypes = {
  campaign: PropTypes.object,
  isOpen:   PropTypes.bool.isRequired,
  onClose:  PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
};
