import PropTypes from 'prop-types';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

const _backendRoot = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1')
  .replace(/\/api\/v1\/?$/, '');

function resolveUrl(url = '') {
  if (!url) return url;
  if (url.startsWith('/uploads/')) return `${_backendRoot}${url}`;
  return url;
}

export default function DocumentsTab({ documents, isLoading }) {
  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>;
  }

  const list = Array.isArray(documents) ? documents : [];

  if (list.length === 0) {
    return (
      <EmptyState
        icon="📁"
        title="No shared files yet"
        message="Deliverable links and chat attachments shared in this collaboration will appear here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {list.map((doc) => (
        <a
          key={doc.id}
          href={resolveUrl(doc.url)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.03]"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <span className="text-xl flex-shrink-0">{doc.source === 'message' ? '💬' : '🎬'}</span>
          <div className="min-w-0 flex-1">
            <p className="text-fg text-sm font-medium truncate">{doc.name}</p>
            <p className="text-fg-muted text-[10px] capitalize">{doc.source} · {new Date(doc.at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <span className="text-brand-400 text-xs flex-shrink-0">Open ↗</span>
        </a>
      ))}
    </div>
  );
}

DocumentsTab.propTypes = {
  documents: PropTypes.array,
  isLoading: PropTypes.bool,
};
