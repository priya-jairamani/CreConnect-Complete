import PropTypes from 'prop-types';

/** Chronological activity timeline for a creator or brand. */
export default function UserTimeline({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-fg-muted py-4 text-center">No activity recorded yet.</p>;
  }

  return (
    <ol className="relative pl-8">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border-subtle" />
      {items.map((item, i) => (
        <li key={i} className="relative pb-5 last:pb-0">
          <span className="absolute -left-8 top-0 w-8 h-8 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center text-sm">
            {item.icon}
          </span>
          <p className="text-sm text-fg font-medium leading-snug">{item.label}</p>
          <p className="text-xs text-fg-muted mt-0.5">
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </li>
      ))}
    </ol>
  );
}

UserTimeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      label: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
};
