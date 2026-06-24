import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DOCUMENT_FOLDERS } from '@/constants/collaborationOptions';

const FOLDER_ICONS = {
  'Campaign Assets': '🎨',
  'Brand Guidelines': '📐',
  'Contracts': '📜',
  'Submitted Content': '📤',
};

function fileIcon(name) {
  if (/\.(png|jpg|jpeg|gif)$/i.test(name)) return '🖼️';
  if (/\.(mp4|mov)$/i.test(name)) return '🎬';
  if (/\.(zip)$/i.test(name)) return '🗜️';
  return '📄';
}

export default function DocumentsTab({ documents }) {
  const byFolder = useMemo(() => {
    const map = new Map(DOCUMENT_FOLDERS.map((f) => [f, []]));
    documents.forEach((d) => {
      if (!map.has(d.folder)) map.set(d.folder, []);
      map.get(d.folder).push(d);
    });
    return map;
  }, [documents]);

  return (
    <div className="space-y-4">
      {[...byFolder.entries()].map(([folder, files]) => (
        <div key={folder} className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h4 className="text-fg font-semibold text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            <span>{FOLDER_ICONS[folder] ?? '📁'}</span> {folder}
            <span className="text-fg-muted text-xs font-normal">({files.length})</span>
          </h4>
          {files.length === 0 ? (
            <p className="text-fg-muted text-xs">No files yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <span className="text-lg flex-shrink-0">{fileIcon(f.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-fg text-sm truncate">{f.name}</p>
                    <p className="text-fg-muted text-[11px] mt-0.5">{f.size} · {new Date(f.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <button className="text-brand-400 text-xs font-medium flex-shrink-0">Download</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

DocumentsTab.propTypes = {
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
};
