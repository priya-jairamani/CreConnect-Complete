import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AI_SEARCH_EXAMPLES } from '@/constants/discoveryOptions';

export default function AISearchBar({ value, onChange, onSubmit }) {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    if (value) return undefined;
    const timer = setInterval(() => {
      setExampleIndex((i) => (i + 1) % AI_SEARCH_EXAMPLES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="space-y-3">
      <div
        className="glass flex items-center gap-3 px-4 py-3.5 rounded-2xl"
        style={{ border: '1px solid var(--border)' }}
      >
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #857fff, #4c2dd1)' }}
        >
          ✨
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(value); }}
          placeholder={`Try: "${AI_SEARCH_EXAMPLES[exampleIndex]}"`}
          className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-fg-muted"
        />
        {value && (
          <button onClick={() => onChange('')} className="text-fg-muted text-sm flex-shrink-0">✕</button>
        )}
        <span className="hidden sm:inline-flex text-[10px] font-semibold text-fg-muted uppercase tracking-widest px-2 py-1 rounded-full flex-shrink-0" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          AI Search
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {AI_SEARCH_EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => { onChange(ex); onSubmit?.(ex); }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

AISearchBar.propTypes = {
  value:    PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};
