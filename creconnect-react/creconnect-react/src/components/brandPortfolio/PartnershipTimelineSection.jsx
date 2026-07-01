import PropTypes from 'prop-types';

export default function PartnershipTimelineSection({ timeline }) {
  if (!timeline) return null;
  return (
    <ol className="relative ml-3 space-y-6 border-l" style={{ borderColor: 'var(--border)' }}>
      {timeline.map((event) => (
        <li key={event.id} className="ml-5">
          <span
            className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full text-xs"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {event.icon}
          </span>
          <p className="text-fg-muted text-xs">{event.date}</p>
          <p className="text-fg text-sm font-medium mt-0.5">{event.title}</p>
        </li>
      ))}
    </ol>
  );
}

PartnershipTimelineSection.propTypes = {
  timeline: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
};
