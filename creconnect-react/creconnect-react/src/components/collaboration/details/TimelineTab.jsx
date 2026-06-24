import PropTypes from 'prop-types';

export default function TimelineTab({ timeline }) {
  return (
    <div className="max-w-xl mx-auto">
      <ol className="relative pl-8">
        <div className="absolute left-[15px] top-2 bottom-2 w-px" style={{ background: 'var(--border)' }} />
        {timeline.map((step, idx) => (
          <li key={step.key} className="relative pb-8 last:pb-0">
            <div
              className="absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={step.done
                ? { background: 'var(--brand-500)', color: '#fff', boxShadow: '0 0 0 4px rgba(109,92,255,0.15)' }
                : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              {step.done ? '✓' : idx + 1}
            </div>
            <div className="pl-2">
              <p className={step.done ? 'text-fg font-semibold text-sm' : 'text-fg-muted font-medium text-sm'}>{step.label}</p>
              {step.cancelled ? (
                <p className="text-danger text-xs mt-0.5">Cancelled at this stage</p>
              ) : step.date ? (
                <p className="text-fg-muted text-xs mt-0.5">
                  {new Date(step.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                  {new Date(step.date).toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' })}
                </p>
              ) : (
                <p className="text-fg-muted text-xs mt-0.5">Pending</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

TimelineTab.propTypes = {
  timeline: PropTypes.arrayOf(PropTypes.object).isRequired,
};
