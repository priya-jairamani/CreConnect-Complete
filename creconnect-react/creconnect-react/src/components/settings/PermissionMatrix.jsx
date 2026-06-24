import PropTypes from 'prop-types';

/** Generic granular permission / access matrix — rows of capabilities × columns of roles or audiences. */
export default function PermissionMatrix({ title, description, rows, columns, value, onToggle }) {
  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h3>
        {description && <p className="text-fg-muted text-xs mt-0.5">{description}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 480 }}>
          <thead>
            <tr className="text-xs uppercase tracking-wider font-semibold text-fg-muted" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-4 py-3 text-left">Capability</th>
              {columns.map((col) => (
                <th key={col} className="px-3 py-3 text-center whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} style={{ borderTop: '1px solid var(--border)' }}>
                <td className="px-4 py-3 text-fg font-medium whitespace-nowrap">{row}</td>
                {columns.map((col) => {
                  const checked = !!value?.[row]?.[col];
                  return (
                    <td key={col} className="px-3 py-3 text-center">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => onToggle(row, col, !checked)}
                        className="w-5 h-5 rounded-md flex items-center justify-center mx-auto transition-colors"
                        style={{
                          background: checked ? 'var(--brand-500)' : 'var(--surface-2)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {checked && <span className="text-white text-xs leading-none">✓</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

PermissionMatrix.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  rows: PropTypes.arrayOf(PropTypes.string).isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
};
