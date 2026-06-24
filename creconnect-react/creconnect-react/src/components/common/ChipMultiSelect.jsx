import PropTypes from 'prop-types';

export default function ChipMultiSelect({ label, options, value = [], onChange, max, readOnly }) {
  const toggle = (opt) => {
    if (readOnly) return;
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, opt]);
    }
  };

  /* In readOnly mode only render selected chips (if any), else all options */
  const visible = readOnly ? (value.length > 0 ? value : options) : options;

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-fg">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {visible.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              disabled={readOnly}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all disabled:cursor-default"
              style={
                active
                  ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                  : {
                      background: 'var(--surface-2)',
                      color: 'var(--fg-muted)',
                      border: '1px solid var(--border)',
                      opacity: readOnly ? 0.55 : 1,
                    }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

ChipMultiSelect.propTypes = {
  label:    PropTypes.string,
  options:  PropTypes.arrayOf(PropTypes.string).isRequired,
  value:    PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  max:      PropTypes.number,
  readOnly: PropTypes.bool,
};
