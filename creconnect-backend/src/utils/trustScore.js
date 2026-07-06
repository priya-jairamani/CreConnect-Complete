const CREATOR_WEIGHTS = {
  email: 10,
  phone: 15,
  social: 20,
  nic: 35,
};

const BRAND_WEIGHTS = {
  email: 10,
  phone: 15,
  business: 30,
  domain: 20,
  nic: 25,
};

function weightsForRole(role) {
  return String(role || '').toUpperCase() === 'BRAND' ? BRAND_WEIGHTS : CREATOR_WEIGHTS;
}

function isVerifiedStatus(status) {
  return String(status || '').toUpperCase() === 'VERIFIED';
}

function latestByType(verifications = []) {
  const latest = {};
  for (const row of verifications) {
    const type = row.type ?? row.verificationType;
    if (!type) continue;
    const submittedAt = row.submittedAt ?? row.createdAt ?? 0;
    if (!latest[type] || new Date(submittedAt) > new Date(latest[type].submittedAt ?? 0)) {
      latest[type] = row;
    }
  }
  return latest;
}

function hasVerifiedSocial(latest) {
  return Object.entries(latest).some(([type, row]) => type.startsWith('social_') && isVerifiedStatus(row.status));
}

/**
 * Compute trust score (0–max) from verification records and email verification.
 */
function computeTrustScore({ role, verifications = [], emailVerified = false }) {
  const weights = weightsForRole(role);
  const latest = latestByType(verifications);
  const breakdown = {};
  let score = 0;

  for (const [key, maxPoints] of Object.entries(weights)) {
    let verified = false;

    if (key === 'email') {
      verified = !!emailVerified || isVerifiedStatus(latest.email?.status);
    } else if (key === 'social') {
      verified = hasVerifiedSocial(latest);
    } else {
      verified = isVerifiedStatus(latest[key]?.status);
    }

    if (verified) {
      score += maxPoints;
      breakdown[key] = { verified: true, points: maxPoints, maxPoints };
    } else {
      breakdown[key] = { verified: false, points: 0, maxPoints };
    }
  }

  const maxTrustScore = Object.values(weights).reduce((sum, n) => sum + n, 0);
  return {
    trustScore: Math.min(score, maxTrustScore),
    maxTrustScore,
    breakdown,
  };
}

function computeTrustScoresForUsers(users, verificationRows = []) {
  const byUser = verificationRows.reduce((acc, row) => {
    const uid = row.userId;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(row);
    return acc;
  }, {});

  return users.map((user) => {
    const json = user.toJSON ? user.toJSON() : user;
    const { trustScore, maxTrustScore, breakdown } = computeTrustScore({
      role: json.role,
      verifications: byUser[json.id] || [],
      emailVerified: json.emailVerified,
    });
    return { ...json, trustScore, maxTrustScore, trustBreakdown: breakdown };
  });
}

module.exports = {
  CREATOR_WEIGHTS,
  BRAND_WEIGHTS,
  computeTrustScore,
  computeTrustScoresForUsers,
  weightsForRole,
};
