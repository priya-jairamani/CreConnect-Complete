import { useCallback, useEffect, useState } from 'react';
import { verificationApi } from '@/api/verification.api';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Drawer from '@/components/common/Drawer';
import EmptyState from '@/components/common/EmptyState';
import Input from '@/components/common/Input';
import ImageLightbox from '@/components/common/ImageLightbox';
import { SkeletonRow } from '@/components/common/Skeleton';
import { useToast } from '@/hooks/useToast';
import { timeAgo } from '@/utils/formatters';
import { resolveMediaUrl } from '@/utils/media';

const PAGE_SIZE = 50;

const STATUS_META = {
  PENDING:      { label: 'Pending',      variant: 'warning' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'brand' },
  VERIFIED:     { label: 'Verified',     variant: 'success' },
  REJECTED:     { label: 'Rejected',     variant: 'danger' },
  EXPIRED:      { label: 'Expired',      variant: 'neutral' },
};

const TYPE_FILTERS = [
  { id: '', label: 'All types' },
  { id: 'nic', label: 'National ID' },
  { id: 'business', label: 'Business' },
  { id: 'domain', label: 'Domain' },
  { id: 'social', label: 'Social' },
];

function unwrapList(res) {
  return Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
}

function typeLabel(type = '') {
  const t = String(type);
  if (t === 'nic') return 'National ID (NIC)';
  if (t === 'business') return 'Business Registration';
  if (t === 'domain') return 'Domain Ownership';
  if (t.startsWith('social_')) {
    const platform = t.replace('social_', '');
    return `${platform.charAt(0).toUpperCase()}${platform.slice(1)} Social`;
  }
  return t.replace(/_/g, ' ');
}

function displayName(user) {
  if (!user) return 'Unknown user';
  return user.creatorProfile?.displayName
    || user.brandProfile?.companyName
    || user.email;
}

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function DataField({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="text-sm text-fg break-all">{value}</p>
    </div>
  );
}

function resolveNicImageUrl(data, side) {
  const raw = side === 'front'
    ? (data.frontImageUrl || data.frontUrl || data.frontDocumentId)
    : (data.backImageUrl || data.backUrl || data.backDocumentId);
  return resolveMediaUrl(raw);
}

function NicDocumentPreview({ label, src }) {
  const [failed, setFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <div>
        <p className="text-xs text-fg-muted mb-2 font-semibold uppercase tracking-wide">{label}</p>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group block w-full rounded-xl overflow-hidden border border-border bg-black/20 hover:border-brand-500/50 transition-colors cursor-zoom-in text-left"
          aria-label={`View ${label} full size`}
        >
          {!failed ? (
            <div className="relative">
              <img
                src={src}
                alt={label}
                className="w-full max-h-56 object-contain bg-surface"
                onError={() => setFailed(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium px-3 py-1.5 rounded-full bg-black/60 transition-opacity">
                  Click to enlarge
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[140px] gap-2 p-4 text-fg-muted text-xs">
              <span>Could not load image</span>
              <span className="text-brand-400 break-all text-center">{src}</span>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="text-xs text-brand-400 hover:underline mt-1.5"
        >
          View full size
        </button>
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={src}
        title={label}
        alt={label}
      />
    </>
  );
}

function VerificationDetail({ item }) {
  const data = item.data || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DataField label="Verification type" value={typeLabel(item.type)} />
        <DataField label="Submitted" value={item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '—'} />
      </div>

      {item.type === 'nic' && (
        <div className="space-y-4 rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
          <DataField label="Full name" value={data.fullName} />
          <DataField label="NIC number" value={data.nicNumber} />
          <div>
            <p className="text-sm font-semibold text-fg mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Submitted documents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NicDocumentPreview label="CNIC — Front" src={resolveNicImageUrl(data, 'front')} />
              <NicDocumentPreview label="CNIC — Back" src={resolveNicImageUrl(data, 'back')} />
            </div>
            {!resolveNicImageUrl(data, 'front') && !resolveNicImageUrl(data, 'back') && (
              <p className="text-xs text-fg-muted mt-2">No document images attached to this submission.</p>
            )}
          </div>
        </div>
      )}

      {item.type === 'business' && (
        <div className="space-y-3 rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
          <DataField label="Legal name" value={data.legalName} />
          <DataField label="Registration number" value={data.registrationNumber} />
          {Array.isArray(data.documentIds) && data.documentIds.length > 0 && (
            <div>
              <p className="text-xs text-fg-muted mb-1">Documents</p>
              <ul className="text-xs text-fg space-y-1">
                {data.documentIds.map((id) => <li key={id} className="font-mono break-all">{id}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {item.type === 'domain' && (
        <div className="space-y-3 rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
          <DataField label="Domain" value={data.domain} />
          <DataField label="DNS challenge" value={data.challengeToken} />
        </div>
      )}

      {String(item.type).startsWith('social_') && (
        <div className="space-y-3 rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
          <DataField label="Platform" value={data.platform} />
          <DataField label="Profile URL" value={data.profileUrl} />
        </div>
      )}

      {item.rejectionReason && (
        <div className="rounded-xl p-3 border border-danger/25 bg-danger/10">
          <p className="text-xs font-semibold text-danger mb-1">Rejection reason</p>
          <p className="text-xs text-fg-muted">{item.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}

export default function VerificationQueueTab() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [tableLightbox, setTableLightbox] = useState(null);

  const fetchQueue = useCallback(() => {
    setLoading(true);
    const params = { limit: PAGE_SIZE };
    if (typeFilter) params.type = typeFilter;
    if (showResolved) params.status = 'VERIFIED,REJECTED';
    verificationApi.adminGetPending(params)
      .then((res) => setItems(unwrapList(res)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [typeFilter, showResolved]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  async function runAction(action, id, payload) {
    setActionId(id);
    try {
      if (action === 'approve') await verificationApi.adminApprove(id);
      else if (action === 'reject') await verificationApi.adminReject(id, payload?.reason);
      else if (action === 'reupload') await verificationApi.adminRequestReupload(id, payload?.note);
      toast.success(action === 'approve' ? 'Verification approved.' : 'Verification updated.');
      setSelected(null);
      setShowRejectForm(false);
      setRejectReason('');
      fetchQueue();
    } catch (err) {
      toast.error(err?.message || 'Action failed.');
    } finally {
      setActionId(null);
    }
  }

  const pendingCount = items.filter((i) => ['PENDING', 'UNDER_REVIEW'].includes(i.status)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-fg-muted">
          Review NIC, business, domain and social verification submissions.
          {!loading && pendingCount > 0 && (
            <span className="text-warning font-medium ml-1">{pendingCount} awaiting review</span>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 overflow-x-auto">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.id || 'all'}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  typeFilter === f.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-fg-muted cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded"
            />
            Show resolved
          </label>
        </div>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 800 }}>
            <thead>
              <tr className="text-xs uppercase text-fg-muted" style={{ background: 'var(--surface-2)' }}>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-3 py-3 text-left">Type</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-left">Submitted</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4"><SkeletonRow /></td></tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon="🛂" title="Queue is empty" message="No verification submissions match your filters." />
                  </td>
                </tr>
              ) : items.map((item) => {
                const user = item.user;
                const name = displayName(user);
                const meta = STATUS_META[item.status] ?? STATUS_META.PENDING;
                const busy = actionId === item.id;
                const canReview = ['PENDING', 'UNDER_REVIEW'].includes(item.status);
                const nicThumb = item.type === 'nic' ? resolveNicImageUrl(item.data || {}, 'front') : null;

                return (
                  <tr
                    key={item.id}
                    className="border-t border-border cursor-pointer hover:bg-surface-2/50 transition-colors"
                    onClick={() => { setSelected(item); setShowRejectForm(false); setRejectReason(''); }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {nicThumb ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTableLightbox({ src: nicThumb, title: `${typeLabel(item.type)} — ${name}` });
                            }}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-surface-2 hover:ring-2 hover:ring-brand-500/40 transition-shadow cursor-zoom-in"
                            aria-label="Preview document"
                          >
                            <img src={nicThumb} alt="" className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <Avatar initials={getInitials(name)} size="sm" color={user?.role === 'BRAND' ? '#4c2dd1' : undefined} />
                        )}
                        <div className="min-w-0">
                          <p className="text-fg font-medium truncate">{name}</p>
                          <p className="text-fg-muted text-xs truncate">{user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="neutral" label={typeLabel(item.type)} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant={meta.variant} label={meta.label} dot />
                    </td>
                    <td className="px-3 py-3 text-fg-muted text-xs whitespace-nowrap">
                      {item.submittedAt ? `${timeAgo(item.submittedAt)} ago` : '—'}
                    </td>
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {canReview && (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="xs" variant="success" disabled={busy} onClick={() => runAction('approve', item.id)}>
                            Approve
                          </Button>
                          <Button size="xs" variant="danger" disabled={busy} onClick={() => { setSelected(item); setShowRejectForm(true); }}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        isOpen={!!selected}
        onClose={() => { setSelected(null); setShowRejectForm(false); setRejectReason(''); }}
        icon="🛂"
        title={selected ? typeLabel(selected.type) : ''}
        subtitle={selected ? `${displayName(selected.user)} · ${selected.user?.email}` : ''}
        size="lg"
        headerExtra={selected && (
          <Badge
            variant={(STATUS_META[selected.status] ?? STATUS_META.PENDING).variant}
            label={(STATUS_META[selected.status] ?? STATUS_META.PENDING).label}
            dot
          />
        )}
        footer={selected && ['PENDING', 'UNDER_REVIEW'].includes(selected.status) && (
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {!showRejectForm ? (
              <>
                <Button variant="secondary" size="sm" disabled={actionId === selected.id} onClick={() => runAction('reupload', selected.id, { note: 'Please re-upload clearer documents.' })}>
                  Request re-upload
                </Button>
                <Button variant="danger" size="sm" onClick={() => setShowRejectForm(true)}>Reject</Button>
                <Button variant="success" size="sm" disabled={actionId === selected.id} onClick={() => runAction('approve', selected.id)}>
                  Approve
                </Button>
              </>
            ) : (
              <div className="flex items-end gap-2 w-full flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    label="Rejection reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this was rejected…"
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={!rejectReason.trim() || actionId === selected.id}
                  onClick={() => runAction('reject', selected.id, { reason: rejectReason.trim() })}
                >
                  Confirm reject
                </Button>
              </div>
            )}
          </div>
        )}
      >
        {selected && (
          <div className="p-5">
            <VerificationDetail item={selected} />
          </div>
        )}
      </Drawer>

      <ImageLightbox
        isOpen={!!tableLightbox}
        onClose={() => setTableLightbox(null)}
        src={tableLightbox?.src}
        title={tableLightbox?.title}
      />
    </div>
  );
}
