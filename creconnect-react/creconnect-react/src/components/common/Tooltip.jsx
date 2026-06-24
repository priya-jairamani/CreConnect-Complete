import { useState } from 'react';
import PropTypes from 'prop-types';

export default function Tooltip({ children, content, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  const posClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full  left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full  top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          className={`absolute z-50 pointer-events-none animate-fade-in ${posClasses[position] ?? posClasses.top}`}
        >
          <div className="px-3 py-1.5 rounded-lg text-xs text-fg whitespace-nowrap shadow-card-lg border border-[var(--border)]"
            style={{ background: 'var(--surface-2)' }}>
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

Tooltip.propTypes = {
  children:  PropTypes.node.isRequired,
  content:   PropTypes.node,
  position:  PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};
