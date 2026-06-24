'use strict';

const { contentBasedScore, isAvailable } = require('./scorer');
const MatrixFactorization = require('./collaborative');

/**
 * HybridEngine — the top-level recommender.
 *
 * Combines:
 *   1. Content-Based Filtering  (profile similarity, 7-factor formula)
 *   2. Collaborative Filtering  (SGD matrix factorization on collab history)
 *   3. Context-Aware Rules      (availability, blocked categories)
 *
 * Dynamic weighting (cold-start aware):
 *   New brand   (0 collabs)  → 90% content + 10% collaborative
 *   Growing     (1–3 collabs)→ 70% content + 30% collaborative
 *   Established (4+ collabs) → 50% content + 50% collaborative
 */
class HybridEngine {
  constructor() {
    this.creators       = [];
    this.brands         = [];
    this.collaborations = [];
    this.feedback       = [];
    this.cf             = new MatrixFactorization({ factors: 10, epochs: 60, lr: 0.01, regularize: 0.02 });
    this._cfTrained     = false;
  }

  /**
   * Load data into the engine.
   * Call this once before getMatches() / runForAll().
   */
  loadData({ creators, brands, collaborations = [], feedback = [] }) {
    this.creators       = creators;
    this.brands         = brands;
    this.collaborations = collaborations;
    this.feedback       = feedback;

    // Train collaborative model only if there is history
    if (collaborations.length > 0) {
      this.cf.train(collaborations);
      this._cfTrained = true;
    }
  }

  /**
   * Returns the top N creator matches for a given brand.
   *
   * @param {string} brandId
   * @param {number} topN       - number of results (default 10)
   * @param {boolean} availOnly - skip unavailable creators (default true)
   * @returns {Array<{ creatorId, creatorName, niche, score, breakdown, method }>}
   */
  getMatches(brandId, topN = 10, availOnly = true) {
    const brand = this.brands.find((b) => b.id === brandId);
    if (!brand) throw new Error(`Brand not found: ${brandId}`);

    // How many collabs has this brand completed? → determines CF weight
    const brandCollabs = this.collaborations.filter((c) => c.brandId === brandId);
    const cfWeight     = this._cfWeight(brandCollabs.length);
    const cbWeight     = 1 - cfWeight;

    const results = [];

    for (const creator of this.creators) {
      // Context-Aware Rule: skip unavailable creators
      if (availOnly && !isAvailable(creator)) continue;

      // Context-Aware Rule: skip if creator's niche is in brand's blocked categories
      if (this._isBlocked(creator, brand)) continue;

      // 1. Content-based score (0–100)
      const { score: cbScore, breakdown } = contentBasedScore(
        creator, brand, this.collaborations, this.feedback,
      );

      // 2. Collaborative score (0–100), or fall back to content if no CF signal
      let cfScore = cbScore; // default fallback
      if (this._cfTrained) {
        const cfRaw = this.cf.predict(brandId, creator.id);
        if (cfRaw !== null) cfScore = Math.round(cfRaw * 100);
      }

      // 3. Hybrid combination
      const finalScore = Math.round(cbScore * cbWeight + cfScore * cfWeight);

      results.push({
        creatorId:   creator.id,
        creatorName: creator.displayName,
        username:    creator.username,
        niche:       creator.niche,
        score:       finalScore,
        breakdown,
        weights: { contentBased: Math.round(cbWeight * 100), collaborative: Math.round(cfWeight * 100) },
        method: this._cfTrained ? 'hybrid' : 'content-based',
      });
    }

    // Sort descending by score, take top N
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topN);
  }

  /**
   * Runs the engine for every brand and returns a map of brandId → matches.
   *
   * @param {number} topN - matches per brand
   * @returns {object} { [brandId]: matches[] }
   */
  runForAll(topN = 10) {
    const output = {};
    for (const brand of this.brands) {
      output[brand.id] = this.getMatches(brand.id, topN);
    }
    return output;
  }

  /**
   * Returns creator brands — i.e., which brands a creator would best match.
   *
   * @param {string} creatorId
   * @param {number} topN
   */
  getMatchesForCreator(creatorId, topN = 10) {
    const creator = this.creators.find((c) => c.id === creatorId);
    if (!creator) throw new Error(`Creator not found: ${creatorId}`);

    const results = [];

    for (const brand of this.brands) {
      if (this._isBlocked(creator, brand)) continue;

      const brandCollabs = this.collaborations.filter((c) => c.brandId === brand.id);
      const cfWeight     = this._cfWeight(brandCollabs.length);
      const cbWeight     = 1 - cfWeight;

      const { score: cbScore, breakdown } = contentBasedScore(
        creator, brand, this.collaborations, this.feedback,
      );

      let cfScore = cbScore;
      if (this._cfTrained) {
        const cfRaw = this.cf.predict(brand.id, creatorId);
        if (cfRaw !== null) cfScore = Math.round(cfRaw * 100);
      }

      const finalScore = Math.round(cbScore * cbWeight + cfScore * cfWeight);

      results.push({
        brandId:     brand.id,
        brandName:   brand.companyName,
        industry:    brand.industry,
        score:       finalScore,
        breakdown,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topN);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  _cfWeight(collabCount) {
    if (collabCount === 0)      return 0.10;
    if (collabCount <= 3)       return 0.30;
    return 0.50;
  }

  _isBlocked(creator, brand) {
    if (!Array.isArray(brand.blockedCategories) || brand.blockedCategories.length === 0) return false;
    const creatorNiches = [creator.niche, ...(creator.niches || [])].filter(Boolean);
    return creatorNiches.some((n) => brand.blockedCategories.includes(n));
  }
}

module.exports = HybridEngine;
