import PropTypes from 'prop-types';

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Vertical timeline of an incident's lifecycle stages (Detected → Resolved). */
export default function IncidentTimeline({ items }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={item.stage} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                background: item.completed ? 'var(--success)' : 'var(--surface-2)',
                border: item.completed ? 'none' : '1px solid var(--border)',
              }}
            />
            {i < items.length - 1 && (
              <span className="w-px flex-1" style={{ minHeight: 28, background: item.completed ? 'var(--success)' : 'var(--border)' }} />
            )}
          </div>
          <div className="pb-5">
            <p className={`text-sm font-medium ${item.completed ? 'text-fg' : 'text-fg-muted'}`}>{item.stage}</p>
            <p className="text-xs text-fg-muted mt-0.5">{item.date ? formatDate(item.date) : 'Pending'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

IncidentTimeline.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    stage: PropTypes.string.isRequired,
    date: PropTypes.string,
    completed: PropTypes.bool,
  })).isRequired,
};
