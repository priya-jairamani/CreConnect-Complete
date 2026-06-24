import { useState, useEffect } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import { adminApi } from '@/api/admin.api';

const TABS = ['all', 'PENDING', 'APPROVED', 'REJECTED'];

export default function ContentManagement() {
  const [items,     setItems]     = useState([]);
  const [query,     setQuery]     = useState('');
  const [filter,    setFilter]    = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => {
    adminApi.getContent().then(({ data }) => {
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setItems(list);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const moderate = async (id, status) => {
    setUpdating(id);
    try {
      await adminApi.moderateContent(id, status.toLowerCase());
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    } catch {}
    setUpdating(null);
  };

  const visible = items.filter((i) => {
    const matchFilter = filter === 'all' || i.status?.toUpperCase() === filter;
    const matchQuery  = !query || (i.creator?.creatorProfile?.displayName || i.creator?.email || '').toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Content Management
        </h1>
        <p className="text-fg-muted text-sm mt-0.5">Review and moderate content submitted by creators.</p>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={filter === t
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { color: 'var(--fg-muted)' }
              }
            >
              {t === 'all' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
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
        <div
          className="grid grid-cols-5 px-5 py-3 text-xs uppercase tracking-wider font-semibold text-fg-muted"
          style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
        >
          <span>Creator</span><span>Type</span><span>Platform</span><span>Status</span><span>Actions</span>
        </div>

        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 m-2 rounded-xl" />)
          : visible.length === 0
            ? <div className="px-5 py-10 text-center text-fg-muted text-sm">No content items found.</div>
            : visible.map((item) => {
                const creatorName = item.creator?.creatorProfile?.displayName
                  || item.creator?.email
                  || '—';
                const isUpdating = updating === item.id;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-5 px-5 py-3.5 items-center text-sm"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <span className="text-fg font-medium truncate">{creatorName}</span>
                    <span className="text-fg-muted text-xs">{item.type?.replace(/_/g, ' ')}</span>
                    <span className="text-fg-muted text-xs">{item.platform || '—'}</span>
                    <Badge status={item.status?.toLowerCase()} />
                    <div className="flex gap-2">
                      {item.status?.toUpperCase() !== 'APPROVED' && (
                        <Button variant="primary" size="xs" disabled={isUpdating} onClick={() => moderate(item.id, 'APPROVED')}>
                          Approve
                        </Button>
                      )}
                      {item.status?.toUpperCase() !== 'REJECTED' && (
                        <Button variant="danger" size="xs" disabled={isUpdating} onClick={() => moderate(item.id, 'REJECTED')}>
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
        }
      </div>
    </div>
  );
}
