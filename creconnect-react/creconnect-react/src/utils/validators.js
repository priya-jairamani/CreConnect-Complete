/** Returns true if value is a valid email address. */
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Returns true if value has at least `min` characters. */
export const minLength = (v, min) => v.trim().length >= min;

/** Returns true if two values are equal (for password confirmation). */
export const matches = (a, b) => a === b;

/** Returns true if a string is non-empty after trimming. */
export const required = (v) => v.trim().length > 0;

/**
 * Validate an entire form field map.
 * @param {Record<string, string>} fields
 * @param {Record<string, (v:string) => string|null>} rules
 * @returns {Record<string, string>}  error map (empty = valid)
 */
export function validate(fields, rules) {
  return Object.entries(rules).reduce((errs, [key, fn]) => {
    const msg = fn(fields[key] ?? '');
    if (msg) errs[key] = msg;
    return errs;
  }, {});
}
