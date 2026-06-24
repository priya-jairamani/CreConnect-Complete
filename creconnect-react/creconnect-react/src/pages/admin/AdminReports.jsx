import { useState, useEffect } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import { adminApi } from '@/api/admin.api';

export default function AdminReports() {
  const [reports,   setReports]   = useState([]);
  const [filter,    setFilter]    = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    adminApi.getReports().then(({ data }) => {
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setReports(list);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const resolve = async (id) => {
    setResolving(id);
    try {
      await adminApi.resolveReport(id, 'resolve', { resolution: 'Resolved by admin' });
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'RESOLVED' } : r));
    } catch {}
    setResolving(null);
  };

  const dismiss = async (id) => {
    setResolving(id);
    try {
      await adminApi.resolveReport(id, 'dismiss', { resolution: 'Dismissed by admin' });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {}
    setResolving(null);
  };

  const visible = filter === 'all'
    ? reports
    : reports.filter((r) => r.status?.toLowerCase() === filter);

  const pendingCount = reports.filter((r) => r.status?.toUpperCase() === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Reports
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">Review and resolve violation reports submitted by users.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          {['all', 'pending', 'resolved'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={filter === t
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { color: 'var(--fg-muted)' }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {pendingCount > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}
        >
          <span>⚠</span>
          <span className="text-warning">
            {pendingCount} report{pendingCount !== 1 ? 's' : ''} pending review
          </span>
        </div>
      )}

      <div className="card rounded-2xl overflow-hidden">
        <div
          className="grid grid-cols-6 px-5 py-3 text-xs uppercase tracking-wider font-semibold text-fg-muted"
          style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
        >
          <span>Reporter</span><span>Reported</span><span>Violation</span><span>Date</span><span>Status</span><span>Actions</span>
        </div>

        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 m-2 rounded-xl" />)
          : visible.length === 0
            ? <div className="px-5 py-10 text-center text-fg-muted text-sm">No reports in this category.</div>
            : visible.map((r) => {
                const reporterName = r.reporter?.creatorProfile?.displayName
                  || r.reporter?.brandProfile?.companyName
                  || r.reporter?.email
                  || 'Unknown';
                const reportedName = r.reported?.creatorProfile?.displayName
                  || r.reported?.brandProfile?.companyName
                  || r.reported?.email
                  || 'Unknown';
                const isResolving = resolving === r.id;

                return (
                  <div
                    key={r.id}
                    className="grid grid-cols-6 px-5 py-3.5 items-center text-sm"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <span className="text-fg font-medium truncate">{reporterName}</span>
                    <span className="text-fg-muted truncate">{reportedName}</span>
                    <span className="text-fg-muted text-xs">{r.type?.replace(/_/g, ' ')}</span>
                    <span className="text-fg-muted text-xs">
                      {new Date(r.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </span>
                    <Badge status={r.status?.toLowerCase()} />
                    <div className="flex gap-2">
                      {r.status?.toUpperCase() !== 'RESOLVED' && (
                        <Button variant="primary" size="xs" disabled={isResolving} onClick={() => resolve(r.id)}>
                          Resolve
                        </Button>
                      )}
                      <Button variant="ghost" size="xs" disabled={isResolving} onClick={() => dismiss(r.id)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })
        }
      </div>
    </div>
  );
}
