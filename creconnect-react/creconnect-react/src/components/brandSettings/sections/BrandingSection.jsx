import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext';

const THEMES = [
  { value: 'dark', icon: '🌙', label: 'Dark' },
  { value: 'light', icon: '☀️', label: 'Light' },
];

const ACCENT_COLORS = ['#6d5cff', '#16b364', '#f5a623', '#f0445f', '#3aa0ff', '#a855f7', '#ec4899', '#14b8a6'];

export default function BrandingSection({ values, onChange }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Theme</h3>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTheme(t.value)}
              className="flex-1 card rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
              style={theme === t.value ? { border: '1px solid var(--brand-500)', background: 'rgba(109,92,255,0.08)' } : { background: 'var(--surface-2)' }}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-sm font-medium text-fg">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Workspace Accent Color</h3>
        <p className="text-fg-muted text-xs mb-2">Used for buttons, highlights, and active states across your workspace.</p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange('accentColor', c)}
              className="w-8 h-8 rounded-full flex-shrink-0 transition-transform"
              style={{
                background: c,
                outline: values.accentColor === c ? `2px solid ${c}` : 'none',
                outlineOffset: '2px',
                transform: values.accentColor === c ? 'scale(1.1)' : 'scale(1)',
                border: '2px solid var(--surface)',
              }}
              aria-label={`Use accent ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Dashboard Appearance</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {['compact', 'comfortable'].map((density) => (
            <button
              key={density}
              type="button"
              onClick={() => onChange('density', density)}
              className="card rounded-2xl p-4 text-left transition-all capitalize"
              style={values.density === density ? { border: '1px solid var(--brand-500)', background: 'rgba(109,92,255,0.08)' } : { background: 'var(--surface-2)' }}
            >
              <p className="text-fg font-medium text-sm">{density}</p>
              <p className="text-fg-muted text-xs mt-0.5">
                {density === 'compact' ? 'More content per screen, tighter spacing' : 'Spacious layout with larger touch targets'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

BrandingSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
