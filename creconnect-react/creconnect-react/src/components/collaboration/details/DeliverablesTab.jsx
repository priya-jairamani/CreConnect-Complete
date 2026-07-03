import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Skeleton from '@/components/common/Skeleton';
import { campaignsApi } from '@/api/campaigns.api';
import { useToast } from '@/hooks/useToast';

const STATUS_META = {
  SUBMITTED:           { label: 'Submitted',      variant: 'warning' },
  APPROVED:            { label: 'Approved',       variant: 'success' },
  REVISION_REQUESTED:  { label: 'Needs Revision', variant: 'danger'  },
};

const TYPE_META = {
  REEL:       { label: 'Reel',       icon: '🎥' },
  POST:       { label: 'Post',       icon: '🖼️' },
  STORY:      { label: 'Story',      icon: '📱' },
  VIDEO:      { label: 'Video',      icon: '🎬' },
  LIVESTREAM: { label: 'Livestream', icon: '📡' },
};

export default function DeliverablesTab({ collaborationId, requirements }) {
  const toast = useToast();
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [type, setType] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Only offer content types the campaign actually asked for
  const availableTypes = useMemo(
    () => Object.entries(requirements ?? {}).filter(([, count]) => count > 0).map(([t]) => t),
    [requirements]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await campaignsApi.getDeliverables(collaborationId);
      setDeliverables(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load deliverables');
    } finally {
      setLoading(false);
    }
  }, [collaborationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const openSubmit = () => {
    setType(availableTypes[0] ?? '');
    setShowSubmit(true);
  };

  const handleSubmit = async () => {
    if (!note.trim()) { toast.error('Please add a short note describing your submission'); return; }
    setSubmitting(true);
    try {
      await campaignsApi.submitDeliverable(collaborationId, { type: type || undefined, note, link: link || undefined });
      toast.success('Deliverable submitted for review');
      setShowSubmit(false);
      setNote('');
      setLink('');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit deliverable');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="xs" onClick={openSubmit}>📤 Submit for Review</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : deliverables.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface-2)' }}>
          <p className="text-fg-muted text-sm">No deliverables submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliverables.map((d) => {
            const meta = STATUS_META[d.status] ?? STATUS_META.SUBMITTED;
            const typeMeta = TYPE_META[d.type];
            return (
              <div key={d.id} className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {typeMeta && (
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        {typeMeta.icon}
                      </span>
                    )}
                    <div className="min-w-0">
                      {typeMeta && <p className="text-fg-muted text-[10px] font-semibold uppercase tracking-wide">{typeMeta.label}</p>}
                      <p className="text-fg text-sm">{d.note}</p>
                    </div>
                  </div>
                  <Badge variant={meta.variant} label={meta.label} />
                </div>
                {d.link && (
                  <a href={d.link} target="_blank" rel="noreferrer" className="text-brand-400 text-xs underline mt-2 inline-block break-all">
                    {d.link}
                  </a>
                )}
                {d.feedback && (
                  <div className="mt-3 rounded-xl p-3 text-sm flex items-start gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <span className="flex-shrink-0">💬</span>
                    <p className="text-fg-muted">{d.feedback}</p>
                  </div>
                )}
                <p className="text-fg-muted text-[10px] mt-2">
                  {new Date(d.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        title="Submit deliverable"
        description="Pick what you're submitting and describe the work, with a link to the posted content if applicable."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowSubmit(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={submitting} disabled={submitting} onClick={handleSubmit}>Submit</Button>
          </div>
        }
      >
        <div className="space-y-3">
          {availableTypes.length > 0 && (
            <select
              className="w-full rounded-xl p-2.5 text-sm"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {availableTypes.map((t) => (
                <option key={t} value={t}>{TYPE_META[t]?.icon} {TYPE_META[t]?.label}</option>
              ))}
            </select>
          )}
          <textarea
            className="w-full rounded-xl p-3 text-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            rows={4}
            placeholder="What did you deliver?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <input
            className="w-full rounded-xl p-2.5 text-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            placeholder="Link (optional) — e.g. posted content URL"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

DeliverablesTab.propTypes = {
  collaborationId: PropTypes.string.isRequired,
  requirements: PropTypes.object,
};
