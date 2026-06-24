import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/common/Button';

/** Sticky search + advanced filters + bulk-action bar shared by Creators / Brands tables. */
export default function EntityToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  filterValues,
  onFilterChange,
  selectedCount = 0,
  bulkActions = [],
  onBulkAction,
  onExport,
}) {
  return (
    <div className="sticky top-0 z-10 space-y-3 pb-1" style={{ background: 'var(--bg)' }}>
      <div className="card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-base flex-1 min-w-[220px]"
        />
        {filters.map((f) => (
          <select
            key={f.key}
            value={filterValues[f.key]}
            onChange={(e) => onFilterChange(f.key, e.target.value)}
            className="input-base text-sm py-1.5 px-3 rounded-lg w-auto"
            aria-label={f.label}
          >
            {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ))}
        {onExport && (
          <Button variant="secondary" size="sm" onClick={onExport} icon="⬇">Export</Button>
        )}
      </div>

      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap"
            style={{ background: 'var(--brand-500)', color: '#fff' }}
          >
            <span className="text-sm font-semibold">{selectedCount} selected</span>
            <div className="flex items-center gap-2 flex-wrap">
              {bulkActions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onBulkAction?.(a.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

EntityToolbar.propTypes = {
  searchValue: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  searchPlaceholder: PropTypes.string,
  filters: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  filterValues: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  selectedCount: PropTypes.number,
  bulkActions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
  })),
  onBulkAction: PropTypes.func,
  onExport: PropTypes.func,
};
