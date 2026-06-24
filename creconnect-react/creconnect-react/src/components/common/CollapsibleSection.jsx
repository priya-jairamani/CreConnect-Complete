import { useState } from 'react';
import PropTypes from 'prop-types';

export default function CollapsibleSection({
  icon, title, subtitle, badge, defaultOpen = true, children, actions,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="card rounded-2xl overflow-hidden">
      <div className="flex items-center w-full">
        {/* Clickable expand/collapse area */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex-1 flex items-center gap-4 p-5 text-left min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {icon && (
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-fg truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {title}
                </h2>
                {badge}
              </div>
              {subtitle && <p className="text-fg-muted text-xs mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <span
            className="text-fg-muted text-sm flex-shrink-0 transition-transform"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▾
          </span>
        </button>

        {/* Section-level action buttons (Edit / Save / Cancel) */}
        {actions && (
          <div
            className="flex items-center gap-1.5 pr-4 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="pt-5">{children}</div>
        </div>
      )}
    </section>
  );
}

CollapsibleSection.propTypes = {
  icon:        PropTypes.node,
  title:       PropTypes.string.isRequired,
  subtitle:    PropTypes.string,
  badge:       PropTypes.node,
  defaultOpen: PropTypes.bool,
  children:    PropTypes.node.isRequired,
  actions:     PropTypes.node,
};
