import { useState, useCallback, useRef } from 'react';

export function useCopy(duration = 1500) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text ?? '');
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = text ?? '';
      el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), duration);
  }, [duration]);

  return { copy, copied };
}
