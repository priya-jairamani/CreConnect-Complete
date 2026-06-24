import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { formatFollowers, formatEngagement } from '@/utils/formatters';
import { getPlatformStats } from '@/utils/mockAnalytics';
import { getPlatformMeta } from '@/components/common/PlatformIcon';
import { creatorsApi } from '@/api/creators.api';

/* ─── Single media thumbnail ─────────────────────────────────────────── */
function MediaThumb({ post, onOpen }) {
  const isVideo = post.mediaType === 'VIDEO' || post.mediaType === 'REEL' || post.mediaType === 'SHORT';

  return (
    <button
      onClick={() => onOpen(post)}
      className="relative aspect-square rounded-lg overflow-hidden group focus:outline-none"
      style={{ background: 'var(--surface)' }}
    >
      {post.thumbnailUrl || post.mediaUrl ? (
        <img
          src={post.thumbnailUrl || post.mediaUrl}
          alt={post.caption?.slice(0, 40) || 'Post'}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-fg-muted text-xl">
          {isVideo ? '▶' : '🖼'}
        </div>
      )}

      {isVideo && (
        <div className="absolute top-1.5 right-1.5 bg-black/60 rounded px-1 py-0.5 text-white text-[9px] font-bold">▶</div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
        <div className="flex gap-2 text-white text-[10px] font-semibold">
          {post.likeCount > 0 && <span>♥ {formatFollowers(post.likeCount)}</span>}
          {post.viewCount > 0 && <span>▶ {formatFollowers(post.viewCount)}</span>}
        </div>
      </div>
    </button>
  );
}

MediaThumb.propTypes = {
  post:   PropTypes.object.isRequired,
  onOpen: PropTypes.func.isRequired,
};

/* ─── Lightbox ───────────────────────────────────────────────────────── */
function Lightbox({ post, onClose }) {
  if (!post) return null;
  const isVideo = post.mediaType === 'VIDEO' || post.mediaType === 'REEL' || post.mediaType === 'SHORT';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="aspect-square bg-black flex items-center justify-center">
          {isVideo ? (
            <div className="text-center space-y-3 p-8">
              {post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" className="max-h-64 mx-auto rounded-lg object-cover" />}
              {post.permalink && (
                <a href={post.permalink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:underline">
                  ▶ Watch video ↗
                </a>
              )}
            </div>
          ) : post.mediaUrl ? (
            <img src={post.mediaUrl} alt={post.caption?.slice(0, 60) || ''} className="max-h-[480px] max-w-full object-contain" />
          ) : (
            <p className="text-fg-muted text-sm p-8 text-center">No preview available</p>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          {post.caption && (
            <p className="text-fg text-sm leading-relaxed line-clamp-3">{post.caption}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-fg-muted">
            {post.likeCount > 0    && <span>♥ {post.likeCount.toLocaleString()} likes</span>}
            {post.commentCount > 0 && <span>💬 {post.commentCount.toLocaleString()} comments</span>}
            {post.viewCount > 0    && <span>▶ {post.viewCount.toLocaleString()} views</span>}
            {post.shareCount > 0   && <span>↗ {post.shareCount.toLocaleString()} shares</span>}
            {post.postedAt && <span className="ml-auto">{new Date(post.postedAt).toLocaleDateString()}</span>}
          </div>
          {post.permalink && (
            <a href={post.permalink} target="_blank" rel="noopener noreferrer"
              className="block text-xs text-brand-400 hover:underline truncate">
              {post.permalink}
            </a>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

Lightbox.propTypes = { post: PropTypes.object, onClose: PropTypes.func.isRequired };

/* ─── Single platform card ───────────────────────────────────────────── */
function PlatformCard({ platform, seed }) {
  const [posts,    setPosts]    = useState(null);   // null = not loaded yet
  const [loading,  setLoading]  = useState(false);
  const [syncing,  setSyncing]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(null);

  const meta     = getPlatformMeta(platform.name);
  const Icon     = meta.Icon;
  const stats    = getPlatformStats(`${seed}-${platform.name}-${platform.handle}`, platform.followerCount || 0);
  const hasToken = !!platform.accessToken || platform.isConnected;

  const loadPosts = useCallback(async () => {
    if (!platform.id || loading) return;
    setLoading(true);
    try {
      const res = await creatorsApi.getPlatformPosts(platform.id);
      setPosts(res.data?.data ?? res.data ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [platform.id, loading]);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await creatorsApi.syncPlatformPosts(platform.id);
      await loadPosts();
    } catch { /* noop */ }
    finally { setSyncing(false); }
  };

  // Load posts when expanded for the first time
  useEffect(() => {
    if (expanded && posts === null) loadPosts();
  }, [expanded, posts, loadPosts]);

  return (
    <>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {/* Header row */}
        <div className="flex items-center gap-3 p-4">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface)' }}>
            <Icon size={20} color={meta.color} />
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-fg text-sm font-semibold">{meta.label}</p>
            {platform.handle && <p className="text-fg-muted text-xs truncate">{platform.handle}</p>}
          </div>

          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
            style={platform.isConnected
              ? { background: 'rgba(22,179,100,0.12)', color: '#16b364' }
              : { background: 'rgba(240,68,95,0.12)',  color: '#f0445f' }}
          >
            {platform.isConnected ? '● Connected' : 'Not connected'}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-3">
          <div className="rounded-lg py-2 text-center" style={{ background: 'var(--surface)' }}>
            <p className="text-fg font-bold text-sm">{formatFollowers(platform.followerCount || 0)}</p>
            <p className="text-fg-muted text-[10px]">Followers</p>
          </div>
          <div className="rounded-lg py-2 text-center" style={{ background: 'var(--surface)' }}>
            <p className="text-fg font-bold text-sm">{formatEngagement((platform.engagementRate || 0) / 100)}</p>
            <p className="text-fg-muted text-[10px]">Engagement</p>
          </div>
          <div className="rounded-lg py-2 text-center" style={{ background: 'var(--surface)' }}>
            <p className="text-fg font-bold text-sm">{formatFollowers(stats.avgViews)}</p>
            <p className="text-fg-muted text-[10px]">Avg Views</p>
          </div>
          <div className="rounded-lg py-2 text-center" style={{ background: 'var(--surface)' }}>
            <p className="text-fg font-bold text-sm">{platform.mediaCount || stats.avgReach}</p>
            <p className="text-fg-muted text-[10px]">Posts</p>
          </div>
        </div>

        {/* Media toggle + sync */}
        {hasToken && (
          <div className="px-4 pb-3 flex items-center justify-between gap-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-fg-muted hover:text-fg transition-colors font-medium flex items-center gap-1"
            >
              {expanded ? '▲ Hide media' : '▼ Show media'}
            </button>
            {expanded && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg disabled:opacity-50 transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                {syncing ? '↻ Syncing…' : '↻ Sync'}
              </button>
            )}
          </div>
        )}

        {/* Media grid */}
        {expanded && (
          <div className="px-4 pb-4">
            {loading ? (
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />
                ))}
              </div>
            ) : posts?.length ? (
              <div className="grid grid-cols-3 gap-1.5">
                {posts.slice(0, 9).map((post) => (
                  <MediaThumb key={post.id || post.externalId} post={post} onOpen={setSelected} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-fg-muted text-xs">
                  {platform.accessToken
                    ? 'No posts found. Try syncing.'
                    : 'Reconnect this platform to load your media.'}
                </p>
              </div>
            )}
            {platform.lastSyncedAt && (
              <p className="text-fg-muted text-[10px] mt-2 text-center">
                Last synced: {new Date(platform.lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      <Lightbox post={selected} onClose={() => setSelected(null)} />
    </>
  );
}

PlatformCard.propTypes = {
  platform: PropTypes.object.isRequired,
  seed:     PropTypes.string.isRequired,
};

/* ─── Grid ───────────────────────────────────────────────────────────── */
export default function PlatformGrid({ platforms, seed }) {
  if (!platforms?.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
        Connected Platforms
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((p) => (
          <PlatformCard key={p.id || p.name} platform={p} seed={seed} />
        ))}
      </div>
    </div>
  );
}

PlatformGrid.propTypes = {
  platforms: PropTypes.array,
  seed:      PropTypes.string.isRequired,
};
