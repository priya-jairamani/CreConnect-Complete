import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/api/admin.api';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ImageLightbox from '@/components/common/ImageLightbox';
import Skeleton from '@/components/common/Skeleton';
import { useToast } from '@/hooks/useToast';
import { timeAgo } from '@/utils/formatters';
import { resolveMediaUrl } from '@/utils/media';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
];

const STATUS_VARIANT = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

function unwrapList(res) {
  return Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
}

function creatorName(item) {
  return item.creator?.displayName
    || item.creator?.creatorProfile?.displayName
    || item.creator?.email
    || item.creator?.user?.email
    || '—';
}

export default function ContentManagement() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const fetchContent = useCallback(() => {
    setIsLoading(true);
    const params = { limit: 100 };
    if (filter !== 'all') params.status = filter;
    if (debouncedQuery) params.q = debouncedQuery;

    adminApi.getContent(params)
      .then((res) => setItems(unwrapList(res)))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [filter, debouncedQuery]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  async function moderate(id, status) {
    setUpdating(id);
    try {
      await adminApi.moderateContent(id, status.toLowerCase());
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status, moderationStatus: status } : i)));
      toast.success(`Content ${status.toLowerCase()}.`);
    } catch (err) {
      toast.error(err?.message || 'Failed to update content.');
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = items.filter((i) => i.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Content Management
        </h1>
        <p className="text-fg-muted text-sm mt-0.5">
          Review creator portfolio uploads from the database.
          {!isLoading && pendingCount > 0 && (
            <span className="text-warning font-medium ml-1">{pendingCount} pending review</span>
          )}
        </p>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filter === t.id
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { color: 'var(--fg-muted)' }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by creator…"
          className="input-base w-52"
        />
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 880 }}>
            <thead>
              <tr
                className="text-xs uppercase tracking-wider font-semibold text-fg-muted"
                style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
              >
                <th className="px-4 py-3 text-left">Preview</th>
                <th className="px-3 py-3 text-left">Creator</th>
                <th className="px-3 py-3 text-left">Title / Type</th>
                <th className="px-3 py-3 text-left">Platform</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-left">Submitted</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-2"><Skeleton className="h-14 rounded-xl" /></td></tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-fg-muted text-sm">
                    No content items found. Creators upload portfolio media from their profile.
                  </td>
                </tr>
              ) : items.map((item) => {
                const name = creatorName(item);
                const status = item.status || item.moderationStatus || 'PENDING';
                const thumb = resolveMediaUrl(item.thumbnailUrl || item.fileUrl);
                const busy = updating === item.id;
                const isVideo = String(item.fileType).toLowerCase() === 'video';

                return (
                  <tr key={item.id} className="border-t border-border hover:bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3">
                      {thumb ? (
                        <button
                          type="button"
                          onClick={() => setLightbox({ src: resolveMediaUrl(item.fileUrl), title: item.title || name })}
                          className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-surface-2 hover:ring-2 hover:ring-brand-500/40 cursor-zoom-in"
                        >
                          {isVideo ? (
                            <div className="w-full h-full flex items-center justify-center text-lg bg-black/30">▶</div>
                          ) : (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          )}
                        </button>
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-surface-2 flex items-center justify-center text-fg-muted text-xs">—</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar
                          src={item.creator?.avatarUrl}
                          initials={name.slice(0, 2).toUpperCase()}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-fg font-medium truncate">{name}</p>
                          {item.creator?.username && (
                            <p className="text-fg-muted text-xs truncate">@{item.creator.username}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-fg truncate max-w-[180px]">{item.title || 'Untitled'}</p>
                      <p className="text-fg-muted text-xs capitalize">{String(item.type || 'media').replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-3 py-3 text-fg-muted text-xs">{item.platform || '—'}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant={STATUS_VARIANT[status] || 'neutral'} label={status} dot />
                    </td>
                    <td className="px-3 py-3 text-fg-muted text-xs whitespace-nowrap">
                      {item.createdAt ? `${timeAgo(item.createdAt)} ago` : '—'}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {status !== 'APPROVED' && (
                          <Button size="xs" variant="success" disabled={busy} onClick={() => moderate(item.id, 'APPROVED')}>
                            Approve
                          </Button>
                        )}
                        {status !== 'REJECTED' && (
                          <Button size="xs" variant="danger" disabled={busy} onClick={() => moderate(item.id, 'REJECTED')}>
                            Reject
                          </Button>
                        )}
                        {status !== 'PENDING' && (
                          <Button size="xs" variant="secondary" disabled={busy} onClick={() => moderate(item.id, 'PENDING')}>
                            Re-queue
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ImageLightbox
        isOpen={!!lightbox}
        onClose={() => setLightbox(null)}
        src={lightbox?.src}
        title={lightbox?.title}
      />
    </div>
  );
}
