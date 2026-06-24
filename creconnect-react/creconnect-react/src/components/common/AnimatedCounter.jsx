import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Animates a numeric value from its previous value to a new one using
 * an ease-out curve, rendering through an optional formatter (e.g. formatFollowers).
 */
export default function AnimatedCounter({ value, format, duration = 900 }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return undefined;

    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (target - from) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = target;
        setDisplay(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  const formatted = typeof format === 'function' ? format(display) : Math.round(display).toLocaleString();
  return <>{formatted}</>;
}

AnimatedCounter.propTypes = {
  value:    PropTypes.number.isRequired,
  format:   PropTypes.func,
  duration: PropTypes.number,
};
