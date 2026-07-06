/** Trust score weights — keep in sync with backend `utils/trustScore.js` */

export const CREATOR_TRUST_WEIGHTS = {
  email: 10,
  phone: 15,
  social: 20,
  nic: 35,
};

export const BRAND_TRUST_WEIGHTS = {
  email: 10,
  phone: 15,
  business: 30,
  domain: 20,
  nic: 25,
};

export function maxTrustScoreForRole(role) {
  const weights = String(role || '').toUpperCase() === 'BRAND'
    ? BRAND_TRUST_WEIGHTS
    : CREATOR_TRUST_WEIGHTS;
  return Object.values(weights).reduce((sum, n) => sum + n, 0);
}

export function computeTrustScoreFromStatuses(statuses = {}, role = 'CREATOR', emailVerified = false) {
  const weights = String(role).toUpperCase() === 'BRAND' ? BRAND_TRUST_WEIGHTS : CREATOR_TRUST_WEIGHTS;
  let score = 0;

  for (const [key, points] of Object.entries(weights)) {
    if (key === 'email') {
      if (emailVerified || statuses.email === 'verified') score += points;
    } else if (key === 'social') {
      const socialVerified = Object.entries(statuses).some(
        ([type, status]) => type.startsWith('social_') && status === 'verified',
      );
      if (socialVerified) score += points;
    } else if (statuses[key] === 'verified') {
      score += points;
    }
  }

  return Math.min(score, maxTrustScoreForRole(role));
}
