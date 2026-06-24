import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { SETTINGS_SECTIONS, SETTINGS_SEARCH_INDEX } from '@/utils/mockSettings';

/** Sticky settings navigation with a global "search any setting" box. */
export default function SettingsSidebar({ activeSection, onSelectSection, onSelectField, modifiedBySection }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SETTINGS_SEARCH_INDEX.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.groupTitle.toLowerCase().includes(q) ||
      item.sectionLabel.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  function handleSelect(item) {
    onSelectField(item.sectionId, item.fieldId);
    setQuery('');
  }

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="lg:sticky lg:top-6 space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm pointer-events-none">🔎</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search settings… e.g. "commission", "verification", "AI"'
            className="input-base w-full pl-9"
          />
          {results.length > 0 && (
            <div
              className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-20 shadow-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {results.map((item) => (
                <button
                  key={`${item.sectionId}-${item.fieldId}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-brand-500/10 transition-colors border-b last:border-b-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <p className="text-sm font-medium text-fg">{item.label}</p>
                  <p className="text-xs text-fg-muted mt-0.5">{item.sectionIcon} {item.sectionLabel} · {item.groupTitle}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="card rounded-2xl p-2 space-y-1">
          {SETTINGS_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;
            const changed = modifiedBySection?.[section.id] ?? 0;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelectSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  isActive ? 'bg-brand-gradient text-white' : 'text-fg hover:bg-surface-2'
                }`}
              >
                <span className="text-base flex-shrink-0">{section.icon}</span>
                <span className="flex-1 min-w-0 truncate">{section.label}</span>
                {changed > 0 && (
                  <span
                    className="flex-shrink-0 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    style={isActive ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: 'var(--brand-500)', color: '#fff' }}
                  >
                    {changed}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

SettingsSidebar.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSelectSection: PropTypes.func.isRequired,
  onSelectField: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  modifiedBySection: PropTypes.object,
};
