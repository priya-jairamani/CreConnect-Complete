'use strict';

const { Router } = require('express');
const path        = require('path');

// Load engine from the separate ai-recommender folder (sibling of creconnect-backend)
const HybridEngine   = require(path.join(__dirname, '../../../ai-recommender/engine/index'));
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/authorize');
const { hasAI }        = require('../services/entitlements.service');
const db               = require('../models');

const router  = Router();
const engine  = new HybridEngine();
let engineReady = false;

// AI recommender matches are a paid-plan feature for both roles; admins are exempt.
async function requireAI(req, res, next) {
  try {
    if (req.user.role !== 'ADMIN' && !(await hasAI(req.user.id, req.user.role))) {
      return res.status(403).json({ success: false, message: 'AI matching is available on paid plans — upgrade to use it.' });
    }
    next();
  } catch (err) { next(err); }
}

// ── Engine loader ─────────────────────────────────────────────────────────────

async function ensureEngineLoaded() {
  if (engineReady) return;

  const [creators, brands, collaborations] = await Promise.all([
    db.CreatorProfile.findAll({ raw: true }),
    db.BrandProfile.findAll({ raw: true }),
    db.Collaboration.findAll({ raw: true }),
  ]);

  let feedback = [];
  try {
    const rows = await db.AiMatch.findAll({
      where:      { feedbackAccepted: { [db.Sequelize.Op.ne]: null } },
      attributes: ['brandId', 'creatorId', 'feedbackAccepted'],
      raw:        true,
    });
    feedback = rows.map((r) => ({ brandId: r.brandId, creatorId: r.creatorId, accepted: r.feedbackAccepted }));
  } catch (_) { /* AiMatch table may not exist yet */ }

  engine.loadData({ creators, brands, collaborations, feedback });
  engineReady = true;
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/ai/run
 * Runs the engine for all brands and stores results in ai_matches.
 * Admin only.
 */
router.post('/run', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    engineReady = false; // force reload
    await ensureEngineLoaded();

    const topN      = Number(req.query.topN) || 20;
    const allMatch  = engine.runForAll(topN);
    const now       = new Date();
    let upserted    = 0;

    for (const [brandId, matches] of Object.entries(allMatch)) {
      for (const m of matches) {
        await db.AiMatch.upsert({
          brandId,
          creatorId:   m.creatorId,
          matchScore:  m.score,
          breakdown:   m.breakdown,
          method:      m.method,
          weights:     m.weights,
          generatedAt: now,
        });
        upserted++;
      }
    }

    res.json({
      success: true,
      data: { brandsProcessed: Object.keys(allMatch).length, matchesUpserted: upserted },
    });
  } catch (err) { next(err); }
});

/**
 * GET /api/v1/ai/matches/brand/:brandId
 * Returns stored top matches for a brand (BRAND or ADMIN).
 */
router.get('/matches/brand/:brandId', authenticate, requireAI, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const rows = await db.AiMatch.findAll({
      where:   { brandId: req.params.brandId },
      order:   [['matchScore', 'DESC']],
      limit,
      include: [{
        model:      db.CreatorProfile,
        as:         'creator',
        attributes: ['username', 'displayName', 'niche', 'avatarUrl', 'engagementRate', 'followerCount', 'rating'],
      }],
    });

    res.json({ success: true, data: rows.map((r) => r.toJSON()) });
  } catch (err) { next(err); }
});

/**
 * GET /api/v1/ai/matches/creator/:creatorId
 * Returns stored brand matches for a creator (CREATOR or ADMIN).
 */
router.get('/matches/creator/:creatorId', authenticate, requireAI, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const rows = await db.AiMatch.findAll({
      where:   { creatorId: req.params.creatorId },
      order:   [['matchScore', 'DESC']],
      limit,
      include: [{
        model:      db.BrandProfile,
        as:         'brand',
        attributes: ['companyName', 'industry', 'logoUrl', 'location'],
      }],
    });

    res.json({ success: true, data: rows.map((r) => r.toJSON()) });
  } catch (err) { next(err); }
});

/**
 * POST /api/v1/ai/feedback
 * Body: { brandId, creatorId, accepted: boolean }
 * Records explicit brand feedback. Resets engineReady so the next /run picks it up.
 */
router.post('/feedback', authenticate, async (req, res, next) => {
  try {
    const { brandId, creatorId, accepted } = req.body;
    if (!brandId || !creatorId || accepted === undefined) {
      return res.status(400).json({ success: false, message: 'brandId, creatorId, and accepted are required' });
    }

    const [row] = await db.AiMatch.findOrCreate({
      where:    { brandId, creatorId },
      defaults: { matchScore: 0, generatedAt: new Date() },
    });
    await row.update({ feedbackAccepted: Boolean(accepted), feedbackAt: new Date() });

    engineReady = false; // next request will retrain with new signal
    res.json({ success: true, data: row.toJSON() });
  } catch (err) { next(err); }
});

/**
 * GET /api/v1/ai/matches/brand/:brandId/live
 * Bypasses stored results and scores live. Good for testing new profiles.
 */
router.get('/matches/brand/:brandId/live', authenticate, requireAI, async (req, res, next) => {
  try {
    engineReady = false;
    await ensureEngineLoaded();
    const matches = engine.getMatches(req.params.brandId, Number(req.query.limit) || 10);
    res.json({ success: true, data: matches, source: 'live' });
  } catch (err) { next(err); }
});

module.exports = router;
