'use strict';

const { Router } = require('express');
const recommender = require('./service');
const db          = require('../../creconnect-backend/src/models');

const router = Router();

/**
 * POST /ai/run
 * Runs the hybrid engine for all brands and stores results in ai_matches.
 * Admin-only in production. Exposed without auth guard here for simplicity
 * — wire your `authorize('ADMIN')` middleware in before mounting.
 */
router.post('/run', async (req, res, next) => {
  try {
    await recommender.loadFromDB(db);
    const result = await recommender.runAndStore(db, Number(req.query.topN) || 20);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

/**
 * GET /ai/matches/brand/:brandId
 * Returns pre-computed top matches for a brand.
 */
router.get('/matches/brand/:brandId', async (req, res, next) => {
  try {
    const matches = await recommender.getMatchesForBrand(db, req.params.brandId, Number(req.query.limit) || 10);
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
});

/**
 * GET /ai/matches/creator/:creatorId
 * Returns top brand matches for a creator.
 */
router.get('/matches/creator/:creatorId', async (req, res, next) => {
  try {
    const matches = await recommender.getMatchesForCreator(db, req.params.creatorId, Number(req.query.limit) || 10);
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
});

/**
 * POST /ai/feedback
 * Body: { brandId, creatorId, accepted: boolean }
 * Records explicit brand feedback on a suggestion.
 */
router.post('/feedback', async (req, res, next) => {
  try {
    const { brandId, creatorId, accepted } = req.body;
    if (!brandId || !creatorId || accepted === undefined) {
      return res.status(400).json({ success: false, message: 'brandId, creatorId, and accepted are required' });
    }
    const row = await recommender.recordFeedback(db, brandId, creatorId, Boolean(accepted));
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

/**
 * GET /ai/matches/brand/:brandId/live
 * Skips the DB cache and runs the engine live for a single brand.
 * Useful for debugging or testing new profiles.
 */
router.get('/matches/brand/:brandId/live', async (req, res, next) => {
  try {
    await recommender.loadFromDB(db);
    const matches = recommender.engine.getMatches(req.params.brandId, Number(req.query.limit) || 10);
    res.json({ success: true, data: matches, source: 'live' });
  } catch (err) { next(err); }
});

module.exports = router;
