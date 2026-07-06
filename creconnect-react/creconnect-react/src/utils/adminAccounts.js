/** Presentation admin — always shows rich mock data (no live DB reads). */
export const MOCK_ADMIN_EMAIL = 'admin@creconnect.pk';

/** Operations admin — reads and writes the live PostgreSQL database. */
export const LIVE_ADMIN_EMAIL = 'admin@creconnect.com';

export function isMockAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === MOCK_ADMIN_EMAIL;
}

export function isLiveAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === LIVE_ADMIN_EMAIL;
}
