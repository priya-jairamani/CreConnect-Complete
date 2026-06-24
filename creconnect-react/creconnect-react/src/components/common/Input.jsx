import PropTypes from 'prop-types';
import { clsx } from 'clsx';

export default function Input({
  label,
  name,
  type        = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  error,
  required    = false,
  disabled    = false,
  prefix,
  suffix,
  className   = '',
}) {
  const id = `input-${name}`;

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-fg-muted flex items-center pointer-events-none select-none z-10">
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'input-base w-full',
            prefix && 'pl-10',
            suffix && 'pr-10',
            error  && '!border-danger focus:!shadow-[0_0_0_3px_rgba(240,68,95,0.15)]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        {suffix && (
          <span className="absolute right-3 text-fg-muted flex items-center pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-danger text-xs">{error}</p>
      )}
    </div>
  );
}

Input.propTypes = {
  label:       PropTypes.string,
  name:        PropTypes.string.isRequired,
  type:        PropTypes.string,
  value:       PropTypes.string,
  onChange:    PropTypes.func,
  onBlur:      PropTypes.func,
  placeholder: PropTypes.string,
  error:       PropTypes.string,
  required:    PropTypes.bool,
  disabled:    PropTypes.bool,
  prefix:      PropTypes.node,
  suffix:      PropTypes.node,
  className:   PropTypes.string,
};
