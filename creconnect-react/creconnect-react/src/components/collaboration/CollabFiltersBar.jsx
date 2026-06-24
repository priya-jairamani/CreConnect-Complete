import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';
import Input from '@/components/common/Input';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import Button from '@/components/common/Button';
import {
  VIEW_MODES, KANBAN_STAGES, PRIORITIES, PAYMENT_STATUSES,
} from '@/constants/collaborationOptions';

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);
  return [open, setOpen, ref];
}

export default function CollabFiltersBar({
  viewMode, onViewModeChange,
  search, onSearchChange,
  filters, onFiltersChange,
  savedViews, onSaveView, onApplyView, onDeleteView,
  onOpenCopilot, onOpenNotifications, notificationCount = 0,
}) {
  const [filtersOpen, setFiltersOpen, filtersRef] = usePopover();
  const [viewsOpen, setViewsOpen, viewsRef] = usePopover();
  const [newViewName, setNewViewName] = useState('');

  const activeFilterCount = (filters.stages?.length ?? 0) + (filters.priorities?.length ?? 0) + (filters.paymentStatuses?.length ?? 0);

  const clearFilters = () => onFiltersChange({ stages: [], priorities: [], paymentStatuses: [] });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* View switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {VIEW_MODES.map((v) => (
            <button
              key={v.key}
              onClick={() => onViewModeChange(v.key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                viewMode === v.key ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
              )}
              title={v.label}
            >
              <span>{v.icon}</span>
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[160px]">
          <Input
            name="collab-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by brand or campaign…"
            prefix="🔍"
          />
        </div>

        {/* Quick filters */}
        <div className="relative" ref={filtersRef}>
          <Button variant="secondary" size="sm" onClick={() => setFiltersOpen((v) => !v)}>
            ⚲ Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
          {filtersOpen && (
            <div className="absolute right-0 mt-2 w-72 z-30 rounded-2xl p-4 space-y-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <ChipMultiSelect label="Pipeline Stage" options={KANBAN_STAGES} value={filters.stages ?? []} onChange={(stages) => onFiltersChange({ ...filters, stages })} />
              <ChipMultiSelect label="Priority" options={PRIORITIES} value={filters.priorities ?? []} onChange={(priorities) => onFiltersChange({ ...filters, priorities })} />
              <ChipMultiSelect label="Payment Status" options={PAYMENT_STATUSES} value={filters.paymentStatuses ?? []} onChange={(paymentStatuses) => onFiltersChange({ ...filters, paymentStatuses })} />
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-brand-400 hover:underline">Clear all filters</button>
              )}
            </div>
          )}
        </div>

        {/* Saved views */}
        <div className="relative" ref={viewsRef}>
          <Button variant="secondary" size="sm" onClick={() => setViewsOpen((v) => !v)}>
            ⭐ Saved Views{savedViews.length > 0 ? ` (${savedViews.length})` : ''}
          </Button>
          {viewsOpen && (
            <div className="absolute right-0 mt-2 w-64 z-30 rounded-2xl p-3 space-y-2 shadow-[0_24px_80px_rgba(0,0,0,0.5)]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {savedViews.length === 0 && <p className="text-fg-muted text-xs px-1">No saved views yet.</p>}
              {savedViews.map((v) => (
                <div key={v.name} className="flex items-center gap-2">
                  <button onClick={() => { onApplyView(v); setViewsOpen(false); }} className="flex-1 text-left px-2.5 py-1.5 rounded-lg text-xs text-fg hover:bg-white/5 transition-colors truncate">
                    {v.name}
                  </button>
                  <button onClick={() => onDeleteView(v.name)} className="text-fg-muted hover:text-danger text-xs px-1.5">✕</button>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <input
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="View name…"
                  className="flex-1 input-base text-xs py-1.5"
                />
                <Button
                  size="xs"
                  variant="outline"
                  disabled={!newViewName.trim()}
                  onClick={() => { onSaveView(newViewName.trim()); setNewViewName(''); }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-colors hover:bg-white/5"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          title="Notifications"
        >
          🔔
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* AI Copilot */}
        <Button variant="primary" size="sm" onClick={onOpenCopilot}>
          🤖 Copilot
        </Button>
      </div>
    </div>
  );
}

CollabFiltersBar.propTypes = {
  viewMode:        PropTypes.string.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  search:          PropTypes.string.isRequired,
  onSearchChange:  PropTypes.func.isRequired,
  filters:         PropTypes.object.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  savedViews:      PropTypes.array.isRequired,
  onSaveView:      PropTypes.func.isRequired,
  onApplyView:     PropTypes.func.isRequired,
  onDeleteView:    PropTypes.func.isRequired,
  onOpenCopilot:   PropTypes.func.isRequired,
  onOpenNotifications: PropTypes.func.isRequired,
  notificationCount: PropTypes.number,
};
