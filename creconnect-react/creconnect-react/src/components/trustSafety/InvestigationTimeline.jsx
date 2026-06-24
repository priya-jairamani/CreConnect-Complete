import PropTypes from 'prop-types';

/** Chronological investigation timeline — Report Created → Evidence Added → ... → Case Closed. */
export default function InvestigationTimeline({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-fg-muted py-4 text-center">No timeline activity recorded yet.</p>;
  }

  return (
    <ol className="relative pl-8">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border-subtle" />
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <li key={item.id} className="relative pb-5 last:pb-0">
            <span
              className="absolute -left-8 top-0 w-8 h-8 rounded-full flex items-center justify-center text-sm border"
              style={isLast
                ? { background: 'rgba(109,92,255,0.14)', borderColor: 'var(--brand-500)', color: 'var(--brand-400)' }
                : { background: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >
              {item.icon}
            </span>
            <p className="text-sm text-fg font-medium leading-snug">{item.label}</p>
            <p className="text-xs text-fg-muted mt-0.5">
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

InvestigationTimeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      icon: PropTypes.node,
      label: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
};
