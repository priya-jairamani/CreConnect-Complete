import PropTypes from 'prop-types';

export default function SettingsSidebar({ sections, activeId, search, onSearchChange, onNavigate }) {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? sections.filter((s) => s.label.toLowerCase().includes(query))
    : sections;

  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)]">
      <div className="card rounded-2xl p-3 flex flex-col gap-1 overflow-hidden">
        <div className="px-1 pb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search settings…"
            className="input-base w-full text-sm"
          />
        </div>
        <nav className="flex flex-col gap-0.5 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onNavigate(s.id)}
              className="sidebar-link w-full text-left"
              style={
                activeId === s.id
                  ? { background: 'var(--brand-500)', color: '#fff' }
                  : undefined
              }
            >
              <span className="text-base w-5 flex-shrink-0 leading-none">{s.icon}</span>
              <span className="truncate text-sm">{s.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-fg-muted text-xs text-center py-4">No settings match &ldquo;{search}&rdquo;</p>
          )}
        </nav>
      </div>
    </aside>
  );
}

SettingsSidebar.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  activeId: PropTypes.string,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
