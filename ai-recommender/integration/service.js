'use strict';

const HybridEngine = require('../engine/index');

/**
 * AiRecommenderService connects the HybridEngine to the live database.
 * All methods that touch the DB receive the `db` models object from the caller.
 */
class AiRecommenderService {
  constructor() {
    this.engine = new HybridEngine();
  }

  /**
   * Loads all required data from the database and trains the engine.
   * Call this before runAndStore() or getMatchesForBrand().
   *
   * @param {object} db - Sequelize models (db.CreatorProfile, db.BrandProfile, etc.)
   */
  async loadFromDB(db) {
    const [creators, brands, collaborations, feedback] = await Promise.all([
      db.CreatorProfile.findAll({ raw: true }),
      db.BrandProfile.findAll({ raw: true }),
      db.Collaboration.findAll({ raw: true }),
      // AiMatch rows where feedbackAccepted is set = explicit brand feedback
      db.AiMatch
        ? db.AiMatch.findAll({
            where: { feedbackAccepted: { [db.Sequelize.Op.ne]: null } },
            attributes: ['brandId', 'creatorId', 'feedbackAccepted'],
            raw: true,
          }).then((rows) =>
            rows.map((r) => ({ brandId: r.brandId, creatorId: r.creatorId, accepted: r.feedbackAccepted })),
          )
        : Promise.resolve([]),
    ]);

    this.engine.loadData({ creators, brands, collaborations, feedback });
  }

  /**
   * Runs the hybrid engine for ALL brands and upserts results into ai_matches.
   *
   * @param {object} db   - Sequelize models
   * @param {number} topN - matches to store per brand (default 20)
   */
  async runAndStore(db, topN = 20) {
    if (!db.AiMatch) throw new Error('AiMatch model not registered in db');

    const allMatches = this.engine.runForAll(topN);
    const now        = new Date();

    let totalUpserted = 0;

    for (const [brandId, matches] of Object.entries(allMatches)) {
      for (const m of matches) {
        await db.AiMatch.upsert({
          brandId,
          creatorId:    m.creatorId,
          matchScore:   m.score,
          breakdown:    m.breakdown,
          method:       m.method,
          weights:      m.weights,
          generatedAt:  now,
        });
        totalUpserted++;
      }
    }

    return { brandsProcessed: Object.keys(allMatches).length, matchesUpserted: totalUpserted };
  }

  /**
   * Returns stored matches for a brand from ai_matches (fast DB read).
   *
   * @param {object} db
   * @param {string} brandId
   * @param {number} limit
   */
  async getMatchesForBrand(db, brandId, limit = 10) {
    if (!db.AiMatch) return this._liveMatch(brandId, limit);

    const rows = await db.AiMatch.findAll({
      where:  { brandId },
      order:  [['matchScore', 'DESC']],
      limit,
      include: db.CreatorProfile
        ? [{ model: db.CreatorProfile, as: 'creator', attributes: ['username', 'displayName', 'niche', 'avatarUrl', 'engagementRate', 'followerCount'] }]
        : [],
    });

    return rows.map((r) => r.toJSON());
  }

  /**
   * Returns stored brand matches for a creator from ai_matches.
   *
   * @param {object} db
   * @param {string} creatorId
   * @param {number} limit
   */
  async getMatchesForCreator(db, creatorId, limit = 10) {
    if (!db.AiMatch) return this._liveMatchCreator(creatorId, limit);

    const rows = await db.AiMatch.findAll({
      where:  { creatorId },
      order:  [['matchScore', 'DESC']],
      limit,
      include: db.BrandProfile
        ? [{ model: db.BrandProfile, as: 'brand', attributes: ['companyName', 'industry', 'logoUrl', 'location'] }]
        : [],
    });

    return rows.map((r) => r.toJSON());
  }

  /**
   * Records explicit brand feedback (accepted/rejected a suggested creator).
   * Updates the feedbackAccepted field on the existing ai_match row.
   *
   * @param {object} db
   * @param {string} brandId
   * @param {string} creatorId
   * @param {boolean} accepted
   */
  async recordFeedback(db, brandId, creatorId, accepted) {
    if (!db.AiMatch) throw new Error('AiMatch model not registered');

    const [row] = await db.AiMatch.findOrCreate({
      where:    { brandId, creatorId },
      defaults: { matchScore: 0, generatedAt: new Date() },
    });

    await row.update({ feedbackAccepted: accepted, feedbackAt: new Date() });
    return row.toJSON();
  }

  // ── Live fallback (no DB) ───────────────────────────────────────────────────

  _liveMatch(brandId, limit) {
    return this.engine.getMatches(brandId, limit);
  }

  _liveMatchCreator(creatorId, limit) {
    return this.engine.getMatchesForCreator(creatorId, limit);
  }
}

module.exports = new AiRecommenderService();
