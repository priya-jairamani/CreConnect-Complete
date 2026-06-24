const svc = require('../services/creators.service');
const { ok, created, paginated } = require('../utils/response');

const getMe = async (req, res, next) => {
  try { ok(res, await svc.getMyProfile(req.user.id)); } catch (e) { next(e); }
};

const updateMe = async (req, res, next) => {
  try { ok(res, await svc.updateMyProfile(req.user.id, req.body), 'Profile updated'); } catch (e) { next(e); }
};

const getStats = async (req, res, next) => {
  try { ok(res, await svc.getStats(req.user.id)); } catch (e) { next(e); }
};

const getCollaborations = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getMyCollaborations(req.user.id, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const getOffers = async (req, res, next) => {
  try { ok(res, await svc.getMyOffers(req.user.id)); } catch (e) { next(e); }
};

const addPlatform = async (req, res, next) => {
  try { created(res, await svc.addPlatform(req.user.id, req.body)); } catch (e) { next(e); }
};

const removePlatform = async (req, res, next) => {
  try {
    await svc.removePlatform(req.user.id, req.params.id);
    ok(res, {}, 'Platform removed');
  } catch (e) { next(e); }
};

const getPublicProfile = async (req, res, next) => {
  try { ok(res, await svc.getPublicProfile(req.params.username)); } catch (e) { next(e); }
};

const getApplications = async (req, res, next) => {
  try { ok(res, await svc.getMyApplications(req.user.id)); } catch (e) { next(e); }
};

const getMedia    = async (req, res, next) => {
  try { ok(res, await svc.getMedia(req.user.id, req.query)); } catch (e) { next(e); }
};
const addMedia    = async (req, res, next) => {
  try { created(res, await svc.addMedia(req.user.id, req.body)); } catch (e) { next(e); }
};
const updateMedia = async (req, res, next) => {
  try { ok(res, await svc.updateMedia(req.user.id, req.params.id, req.body), 'Updated'); } catch (e) { next(e); }
};
const deleteMedia = async (req, res, next) => {
  try { await svc.deleteMedia(req.user.id, req.params.id); ok(res, {}, 'Deleted'); } catch (e) { next(e); }
};
const setFeatured = async (req, res, next) => {
  try { ok(res, await svc.setFeatured(req.user.id, req.params.id, req.body.isFeatured)); } catch (e) { next(e); }
};
const reorderMedia = async (req, res, next) => {
  try { await svc.reorderMedia(req.user.id, req.body.orderedIds); ok(res, {}, 'Reordered'); } catch (e) { next(e); }
};

module.exports = { getMe, updateMe, getStats, getCollaborations, getOffers, getApplications, addPlatform, removePlatform, getPublicProfile, getMedia, addMedia, updateMedia, deleteMedia, setFeatured, reorderMedia };
