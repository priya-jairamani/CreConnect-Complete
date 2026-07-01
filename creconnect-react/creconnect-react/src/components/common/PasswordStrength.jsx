import PropTypes from 'prop-types';

const CHECKS = [
  { test: (p) => p.length >= 8,           hint: 'At least 8 characters'          },
  { test: (p) => p.length >= 12,          hint: '12+ characters is even stronger' },
  { test: (p) => /[A-Z]/.test(p),         hint: 'Add an uppercase letter'         },
  { test: (p) => /[a-z]/.test(p),         hint: 'Add a lowercase letter'          },
  { test: (p) => /[0-9]/.test(p),         hint: 'Add a number'                    },
  { test: (p) => /[^A-Za-z0-9]/.test(p), hint: 'Add a special character (!@#$…)' },
];

const LEVELS = [
  { min: 0, max: 1, label: 'Weak',   color: '#ef4444', bars: 1 },
  { min: 2, max: 3, label: 'Fair',   color: '#f59e0b', bars: 2 },
  { min: 4, max: 4, label: 'Good',   color: '#84cc16', bars: 3 },
  { min: 5, max: 6, label: 'Strong', color: '#22c55e', bars: 4 },
];

function getLevel(score) {
  return LEVELS.find(l => score >= l.min && score <= l.max) ?? LEVELS[0];
}

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const score   = CHECKS.filter(c => c.test(password)).length;
  const level   = getLevel(score);
  const missing = CHECKS.find(c => !c.test(password));

  return (
    <div className="space-y-1.5 -mt-1">
      {/* Bar strip + label */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                background: n <= level.bars ? level.color : 'var(--border)',
              }}
            />
          ))}
        </div>
        <span
          className="text-[11px] font-semibold flex-shrink-0 transition-colors duration-300"
          style={{ color: level.color, minWidth: 44, textAlign: 'right' }}
        >
          {level.label}
        </span>
      </div>

      {/* Tip */}
      <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>
        {missing ? `💡 ${missing.hint}` : '✓ Great password!'}
      </p>
    </div>
  );
}

PasswordStrength.propTypes = {
  password: PropTypes.string.isRequired,
};
