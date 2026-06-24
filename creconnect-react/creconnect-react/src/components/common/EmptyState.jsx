import PropTypes from 'prop-types';

export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-3xl mb-5 border border-brand-500/20">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-fg mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
        {title}
      </h3>
      {message && (
        <p className="text-fg-muted text-sm max-w-xs mb-6 leading-relaxed">{message}</p>
      )}
      {action}
    </div>
  );
}

EmptyState.propTypes = {
  icon:    PropTypes.string,
  title:   PropTypes.string.isRequired,
  message: PropTypes.string,
  action:  PropTypes.node,
};
