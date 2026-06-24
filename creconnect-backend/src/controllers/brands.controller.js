const svc = require('../services/brands.service');
const { ok, paginated } = require('../utils/response');

const getMe = async (req, res, next) => {
  try { ok(res, await svc.getMyProfile(req.user.id)); } catch (e) { next(e); }
};

const updateMe = async (req, res, next) => {
  try { ok(res, await svc.updateMyProfile(req.user.id, req.body), 'Profile updated'); } catch (e) { next(e); }
};

const getStats = async (req, res, next) => {
  try { ok(res, await svc.getStats(req.user.id)); } catch (e) { next(e); }
};

const getMyCampaigns = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getMyCampaigns(req.user.id, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const getMyCollaborations = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getMyCollaborations(req.user.id, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const getMyApplications = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getMyApplications(req.user.id, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const listBrands = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listBrands(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

module.exports = { getMe, updateMe, getStats, getMyCampaigns, getMyCollaborations, getMyApplications, listBrands };
