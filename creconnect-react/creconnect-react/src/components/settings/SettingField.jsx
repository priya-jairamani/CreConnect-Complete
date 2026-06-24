import PropTypes from 'prop-types';
import Input from '@/components/common/Input';
import Switch from '@/components/common/Switch';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import Badge from '@/components/common/Badge';

/** Renders a single governance setting control based on its declared type, with impact warnings & change indicators. */
export default function SettingField({ field, value, onChange, isModified }) {
  const { id, label, description, type, options, unit, min, max, step, impact } = field;

  const header = (
    <div className="flex items-start justify-between gap-2 mb-1.5">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <label htmlFor={`setting-${id}`} className="text-sm font-medium text-fg">{label}</label>
          {isModified && <Badge variant="brand" label="Modified" />}
          {impact === 'high' && <Badge variant="warning" label="High Impact" />}
        </div>
        {description && <p className="text-fg-muted text-xs mt-0.5">{description}</p>}
      </div>
    </div>
  );

  if (type === 'toggle') {
    return (
      <div className="card rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
        <Switch
          checked={!!value}
          onChange={(v) => onChange(id, v)}
          label={label}
          description={description}
        />
        <div className="flex items-center gap-1.5 mt-2">
          {isModified && <Badge variant="brand" label="Modified" />}
          {impact === 'high' && <Badge variant="warning" label="High Impact" />}
        </div>
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div>
        {header}
        <select
          id={`setting-${id}`}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className="input-base w-full"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'multiselect') {
    return (
      <div>
        {header}
        <ChipMultiSelect options={options} value={value} onChange={(v) => onChange(id, v)} />
      </div>
    );
  }

  if (type === 'slider') {
    return (
      <div>
        {header}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={min ?? 0}
            max={max ?? 100}
            step={step ?? 1}
            value={value}
            onChange={(e) => onChange(id, Number(e.target.value))}
            className="w-full accent-[var(--brand-500)]"
          />
          <span className="text-sm font-semibold text-fg w-16 text-right flex-shrink-0" style={{ fontFamily: 'Sora, sans-serif' }}>
            {value}{unit ?? ''}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'number' || type === 'percent') {
    return (
      <div>
        {header}
        <Input
          name={id}
          type="number"
          value={String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(id, raw === '' ? '' : Number(raw));
          }}
          suffix={unit ?? (type === 'percent' ? '%' : undefined)}
          min={min}
          max={max}
          step={step}
        />
      </div>
    );
  }

  // text / email
  return (
    <div>
      {header}
      <Input
        name={id}
        type={type === 'email' ? 'email' : 'text'}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
      />
    </div>
  );
}

SettingField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string.isRequired,
    options: PropTypes.array,
    unit: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    impact: PropTypes.string,
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  isModified: PropTypes.bool,
};
