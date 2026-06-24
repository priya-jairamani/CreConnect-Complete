const svc = require('../services/analytics.service');
const { ok } = require('../utils/response');

const brand = async (req, res, next) => {
  try { ok(res, await svc.brandAnalytics(req.user.id)); } catch (e) { next(e); }
};

const creator = async (req, res, next) => {
  try { ok(res, await svc.creatorAnalytics(req.user.id)); } catch (e) { next(e); }
};

const admin = async (req, res, next) => {
  try { ok(res, await svc.adminAnalytics()); } catch (e) { next(e); }
};

module.exports = { brand, creator, admin };
