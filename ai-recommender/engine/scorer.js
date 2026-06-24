'use strict';

const {
  nicheIndustryScore,
  engagementScore,
  audienceFitScore,
  locationScore,
  normalize,
} = require('./utils');

// Weights from spec: must sum to 1.0
const WEIGHTS = {
  niche:      0.30,
  engagement: 0.20,
  audience:   0.15,
  location:   0.10,
  rating:     0.10,
  history:    0.10,
  feedback:   0.05,
};

/**
 * Computes the content-based compatibility score (0–100) for a single
 * brand–creator pair, using only profile data and collaboration history.
 *
 * @param {object} creator
 * @param {object} brand
 * @param {object[]} collaborations - all collaboration records
 * @param {object[]} feedback       - all AI feedback records
 * @returns {{ score: number, breakdown: object }}
 */
function contentBasedScore(creator, brand, collaborations = [], feedback = []) {
  // ── 1. Niche Match (30%) ─────────────────────────────────────────────
  const nicheRaw = nicheIndustryScore(creator, brand); // 0–1

  // ── 2. Engagement Score (20%) ────────────────────────────────────────
  const engagementRaw = engagementScore(creator.engagementRate || 0); // 0–1

  // ── 3. Audience Fit (15%) ────────────────────────────────────────────
  const audienceRaw = audienceFitScore(creator, brand); // 0–1

  // ── 4. Location Match (10%) ──────────────────────────────────────────
  const locationRaw = locationScore(creator, brand); // 0–1

  // ── 5. Rating Score (10%) ────────────────────────────────────────────
  const ratingRaw = normalize(creator.rating || 0, 0, 5); // 0–1

  // ── 6. History Score (10%) ───────────────────────────────────────────
  // How often this creator appeared in COMPLETED collabs with ANY brand
  const creatorCollabs = collaborations.filter((c) => c.creatorId === creator.id);
  const completed = creatorCollabs.filter((c) => c.status === 'COMPLETED').length;
  const total     = creatorCollabs.length;
  const historyRaw = total === 0 ? 0.3 : Math.min(1, completed / total); // default 0.3 for new

  // ── 7. Feedback Score (5%) ───────────────────────────────────────────
  // Past decisions by THIS brand on recommendations
  const brandFeedback = feedback.filter(
    (f) => f.brandId === brand.id && f.creatorId === creator.id,
  );
  let feedbackRaw = 0.5; // neutral when no signal
  if (brandFeedback.length > 0) {
    const accepted = brandFeedback.filter((f) => f.accepted).length;
    feedbackRaw = accepted / brandFeedback.length;
  }

  // ── Weighted Sum → 0–100 ─────────────────────────────────────────────
  const raw =
    nicheRaw      * WEIGHTS.niche      +
    engagementRaw * WEIGHTS.engagement +
    audienceRaw   * WEIGHTS.audience   +
    locationRaw   * WEIGHTS.location   +
    ratingRaw     * WEIGHTS.rating     +
    historyRaw    * WEIGHTS.history    +
    feedbackRaw   * WEIGHTS.feedback;

  const score = Math.round(raw * 100);

  return {
    score,
    breakdown: {
      nicheMatch:    Math.round(nicheRaw      * 100),
      engagement:    Math.round(engagementRaw * 100),
      audienceFit:   Math.round(audienceRaw   * 100),
      locationMatch: Math.round(locationRaw   * 100),
      rating:        Math.round(ratingRaw     * 100),
      history:       Math.round(historyRaw    * 100),
      feedback:      Math.round(feedbackRaw   * 100),
    },
  };
}

/**
 * Availability filter — returns false if creator is not accepting work.
 */
function isAvailable(creator) {
  return !creator.availabilityStatus || creator.availabilityStatus === 'AVAILABLE';
}

module.exports = { contentBasedScore, isAvailable, WEIGHTS };
