import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import StatCard from '@/components/common/StatCard';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import { getPlatformMeta } from '@/components/common/PlatformIcon';
import Input from '@/components/common/Input';
import MediaUploadModal from './MediaUploadModal';
import { creatorsApi } from '@/api/creators.api';
import { formatFollowers } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

/* ── Filter definitions ─────────────────────────────────────────── */
const FILTER_TABS = [
  { id: 'all',       label: 'All'         },
  { id: 'featured',  label: '★ Featured'  },
  { id: 'photo',     label: 'Photos'      },
  { id: 'video',     label: 'Videos'      },
  { id: 'INSTAGRAM', label: 'Instagram'   },
  { id: 'TIKTOK',    label: 'TikTok'      },
  { id: 'YOUTUBE',   label: 'YouTube'     },
];

const SORT_OPTIONS = [
  { value: 'order',   label: 'Custom Order' },
  { value: 'recent',  label: 'Most Recent'  },
  { value: 'views',   label: 'Most Viewed'  },
  { value: 'likes',   label: 'Most Liked'   },
  { value: 'reach',   label: 'Highest Reach'},
];

const PLATFORM_COLORS = {
  INSTAGRAM: '#E1306C',
  TIKTOK:    '#010101',
  YOUTUBE:   '#FF0000',
  FACEBOOK:  '#1877F2',
  LINKEDIN:  '#0A66C2',
  X:         '#000000',
  OTHER:     '#9aa1b6',
};

/* ── Media card ─────────────────────────────────────────────────── */
function MediaCard({ item, isManage, onEdit, onDelete, onToggleFeatured }) {
  const [deleting, setDeleting] = useState(false);
  const isVideo = item.fileType === 'video';
  const bgStyle = item.fileUrl
    ? { backgroundImage: `url(${item.thumbnailUrl || item.fileUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' };

  const platformColor = PLATFORM_COLORS[item.platform] ?? '#9aa1b6';

  async function handleDelete() {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    setDeleting(true);
    try { await onDelete(item.id); } finally { setDeleting(false); }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden group"
      style={{ ...bgStyle, aspectRatio: '4/5' }}
    >
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-100 transition-opacity" />

      {/* Top badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white backdrop-blur-sm"
          style={{ background: `${platformColor}cc` }}
        >
          {item.platform}
        </span>
        <div className="flex items-center gap-1">
          {item.isFeatured && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm text-white" style={{ background: 'rgba(245,166,35,0.85)' }}>
              ★ Featured
            </span>
          )}
          {isVideo && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.55)' }}>
              ▶ Video
            </span>
          )}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-xs font-semibold truncate leading-tight">{item.title}</p>
        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
          {item.views > 0 && (
            <span className="text-white/80 text-[10px] flex items-center gap-0.5">
              👁 {formatFollowers(item.views)}
            </span>
          )}
          {item.likes > 0 && (
            <span className="text-white/80 text-[10px] flex items-center gap-0.5">
              ♥ {formatFollowers(item.likes)}
            </span>
          )}
          {item.reach > 0 && (
            <span className="text-white/80 text-[10px] flex items-center gap-0.5">
              ◎ {formatFollowers(item.reach)}
            </span>
          )}
        </div>
        {item.contentType && (
          <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full text-white/90" style={{ background: 'rgba(255,255,255,0.15)' }}>
            {item.contentType}
          </span>
        )}
      </div>

      {/* Manage controls — only on own profile */}
      {isManage && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFeatured(item)}
            title={item.isFeatured ? 'Unfeature' : 'Set as Featured'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all"
            style={{ background: item.isFeatured ? 'rgba(245,166,35,0.9)' : 'rgba(255,255,255,0.9)', color: item.isFeatured ? '#fff' : '#000' }}
          >
            ★
          </button>
          <button
            onClick={() => onEdit(item)}
            title="Edit"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}
          >
            ✏
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all disabled:opacity-50"
            style={{ background: 'rgba(240,68,95,0.9)', color: '#fff' }}
          >
            {deleting ? '…' : '✕'}
          </button>
        </div>
      )}
    </div>
  );
}
MediaCard.propTypes = {
  item:             PropTypes.object.isRequired,
  isManage:         PropTypes.bool,
  onEdit:           PropTypes.func,
  onDelete:         PropTypes.func,
  onToggleFeatured: PropTypes.func,
};

/* ── Edit details modal ─────────────────────────────────────────── */

const CONTENT_TYPES = [
  'Photo', 'Video', 'Reel', 'Short', 'UGC Content',
  'Product Shoot', 'Lifestyle Content', 'Review Content', 'Brand Collaboration',
];

function EditMediaModal({ item, onClose, onSave }) {
  const [form,    setForm]    = useState({ title: item.title || '', description: item.description || '', contentType: item.contentType || 'Photo', visibility: item.visibility || 'public' });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    try {
      await onSave(item.id, { title: form.title.trim(), description: form.description.trim(), contentType: form.contentType, visibility: form.visibility });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed.');
    }
    setSaving(false);
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl p-6 animate-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Edit Media</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg text-xl">×</button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fg">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="input-base w-full resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fg">Content Type</label>
            <select value={form.contentType} onChange={(e) => setForm((p) => ({ ...p, contentType: e.target.value }))} className="input-base w-full">
              {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-fg">Visibility</label>
            <select value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))} className="input-base w-full">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          {error && <p className="text-danger text-xs">{error}</p>}
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
EditMediaModal.propTypes = {
  item: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

/* ── Main MediaGallery component ─────────────────────────────────── */

export default function MediaGallery({ isManage, creatorId, mediaApi }) {
  const toast = useToast();
  // mediaApi can be passed to swap creatorsApi for brandsApi or any compatible API
  const api = mediaApi ?? creatorsApi;

  const [media,       setMedia]       = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [filter,      setFilter]      = useState('all');
  const [sortBy,      setSortBy]      = useState('order');
  const [uploadOpen,  setUploadOpen]  = useState(false);
  const [editItem,    setEditItem]    = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.getMedia(creatorId ? { creatorId } : {});
      const list = Array.isArray(data) ? data : (data?.data ?? data?.media ?? []);
      setMedia(list);
    } catch {
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [api, creatorId]);

  useEffect(() => { load(); }, [load]);

  /* Aggregate analytics */
  const analytics = useMemo(() => ({
    total:      media.length,
    totalViews: media.reduce((s, m) => s + (m.views ?? 0), 0),
    totalReach: media.reduce((s, m) => s + (m.reach ?? 0), 0),
    totalEngagement: media.reduce((s, m) => s + (m.likes ?? 0) + (m.comments ?? 0), 0),
    featured:   media.filter((m) => m.isFeatured).length,
  }), [media]);

  /* Filter + sort */
  const displayed = useMemo(() => {
    let list = [...media];

    if (filter === 'featured') list = list.filter((m) => m.isFeatured);
    else if (filter === 'photo')     list = list.filter((m) => m.fileType === 'image');
    else if (filter === 'video')     list = list.filter((m) => m.fileType === 'video');
    else if (['INSTAGRAM', 'TIKTOK', 'YOUTUBE'].includes(filter)) list = list.filter((m) => m.platform === filter);

    if (sortBy === 'views')  list.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    if (sortBy === 'likes')  list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    if (sortBy === 'reach')  list.sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0));
    if (sortBy === 'recent') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'order')  {
      list.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return (a.order ?? 0) - (b.order ?? 0);
      });
    }

    return list;
  }, [media, filter, sortBy]);

  /* Handlers */
  const handleUploadSuccess = useCallback((newItem) => {
    setMedia((prev) => [newItem, ...prev]);
    toast.success('Media uploaded successfully.');
  }, [toast]);

  const handleDelete = useCallback(async (id) => {
    await api.deleteMedia(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
    toast.info('Media deleted.');
  }, [api, toast]);

  const handleToggleFeatured = useCallback(async (item) => {
    const newVal = !item.isFeatured;
    try {
      await api.setFeatured(item.id, newVal);
      setMedia((prev) => prev.map((m) => m.id === item.id ? { ...m, isFeatured: newVal } : m));
      toast.success(newVal ? 'Marked as featured.' : 'Removed from featured.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update featured status.');
    }
  }, [api, toast]);

  const handleSaveEdit = useCallback(async (id, data) => {
    await api.updateMedia(id, data);
    setMedia((prev) => prev.map((m) => m.id === id ? { ...m, ...data } : m));
    toast.success('Media updated.');
  }, [api, toast]);

  return (
    <div className="space-y-5">

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {FILTER_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={filter === t.id
                  ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-base text-xs"
            style={{ width: 'auto', minWidth: 140 }}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {isManage && (
          <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
            + Add Media
          </Button>
        )}
      </div>

      {/* Analytics row — only shown when there's media */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={<AnimatedCounter value={analytics.total} />}            label="Portfolio Items"   icon="🖼️" />
          <StatCard value={<AnimatedCounter value={analytics.totalViews}    format={formatFollowers} />} label="Total Views"    icon="👁" />
          <StatCard value={<AnimatedCounter value={analytics.totalReach}    format={formatFollowers} />} label="Total Reach"   icon="◎" />
          <StatCard value={<AnimatedCounter value={analytics.totalEngagement} format={formatFollowers} />} label="Engagement"  icon="♥" />
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="rounded-2xl" style={{ aspectRatio: '4/5' }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl flex flex-col items-center justify-center gap-4 py-14 text-center" style={{ border: '2px dashed var(--border)', background: 'var(--surface-2)' }}>
          <span className="text-5xl opacity-40">🎬</span>
          <div>
            <p className="font-semibold text-fg">{filter !== 'all' ? 'No media in this category' : 'No portfolio content yet'}</p>
            <p className="text-fg-muted text-sm mt-1">
              {isManage
                ? 'Add product images, campaign creatives, and brand assets.'
                : 'No portfolio content uploaded yet.'
              }
            </p>
          </div>
          {isManage && filter === 'all' && (
            <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
              + Upload First Content
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayed.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              isManage={isManage}
              onEdit={setEditItem}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <MediaUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={handleUploadSuccess} />
      {editItem && <EditMediaModal item={editItem} onClose={() => setEditItem(null)} onSave={handleSaveEdit} />}
    </div>
  );
}

MediaGallery.propTypes = {
  isManage:  PropTypes.bool,
  creatorId: PropTypes.string,
  mediaApi:  PropTypes.object,
};
