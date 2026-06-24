/**
 * Format a number into a compact human-readable follower count.
 * @param {number} n
 * @returns {string}  e.g. 128000 → "128K"
 */
export function formatFollowers(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

/**
 * Format a decimal engagement rate as a percentage string.
 * @param {number} rate  e.g. 0.034
 * @returns {string}     e.g. "3.4%"
 */
export function formatEngagement(rate) {
  const n = Number(rate);
  if (rate == null || Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

/**
 * Format PKR currency.
 * @param {number} amount
 * @returns {string}  e.g. "PKR 26,000"
 */
export function formatPKR(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return 'PKR —';
  return `PKR ${Number(amount).toLocaleString('en-PK')}`;
}

/**
 * Format PKR currency compactly for tight spaces (KPI cards, sparkline labels).
 * @param {number} amount
 * @returns {string}  e.g. 18650000 → "PKR 18.7M", 326000 → "PKR 326K"
 */
export function formatCompactPKR(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return 'PKR —';
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `PKR ${(n / 1_000).toFixed(0)}K`;
  return `PKR ${n.toLocaleString('en-PK')}`;
}

/**
 * Format a UTC ISO string into a relative time label.
 * @param {string} isoString
 * @returns {string}
 */
export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)   return 'now';
  if (mins  < 60)  return `${mins}m`;
  if (hours < 24)  return `${hours}h`;
  return `${days}d`;
}

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalise(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
