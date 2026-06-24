import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEARCH_INDEX } from '@/utils/mockCampaignIntelligence';

const TYPE_ICON = { campaign: '📋', brand: '🏢', creator: '✦', industry: '🏷️' };

/** Global entity search — find campaigns, brands, creators, industries & campaign IDs. */
export default function CampaignSearchBar({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX.slice(0, 8);
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter((r) => r.label.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [query]);

  function handleSelect(result) {
    setOpen(false);
    setQuery('');
    onSelect?.(result);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface text-fg-muted text-sm transition-colors w-full sm:w-72"
      >
        <span>🔍</span>
        <span className="flex-1 text-left">Search campaigns, brands, creators…</span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/50 backdrop-blur-sm px-4"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="glass w-full max-w-lg rounded-2xl border border-border-subtle shadow-card-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
                  <span className="text-fg-muted">🔍</span>
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search campaigns, brands, creators, industries, IDs…"
                    className="flex-1 bg-transparent outline-none text-sm text-fg placeholder:text-fg-muted"
                  />
                  <kbd className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle">Esc</kbd>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {results.length === 0 ? (
                    <p className="text-center text-sm text-fg-muted py-8">No matches found.</p>
                  ) : (
                    results.map((r) => (
                      <button
                        key={`${r.type}-${r.id}`}
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2 transition-colors text-left"
                        onClick={() => handleSelect(r)}
                      >
                        <span className="w-8 h-8 rounded-lg bg-brand-500/12 text-brand-400 flex items-center justify-center text-sm flex-shrink-0">
                          {TYPE_ICON[r.type] ?? '•'}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm text-fg truncate">{r.label}</span>
                          <span className="block text-xs text-fg-muted truncate">{r.sub}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
