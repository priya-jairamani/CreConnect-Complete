const svc = require('../services/campaigns.service');
const { ok, created, paginated } = require('../utils/response');

const create = async (req, res, next) => {
  try { created(res, await svc.create(req.user.id, req.body), 'Campaign created'); } catch (e) { next(e); }
};

const list = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.list(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { ok(res, await svc.getById(req.params.id)); } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { ok(res, await svc.update(req.params.id, req.user.id, req.body), 'Campaign updated'); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await svc.remove(req.params.id, req.user.id);
    ok(res, {}, 'Campaign deleted');
  } catch (e) { next(e); }
};

const apply = async (req, res, next) => {
  try { created(res, await svc.apply(req.params.id, req.user.id, req.body.note)); } catch (e) { next(e); }
};

const getApplications = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getApplications(req.params.id, req.user.id, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const respondToApplication = async (req, res, next) => {
  try {
    const result = await svc.respondToApplication(req.params.appId, req.params.action, req.user.id);
    ok(res, result, 'Application updated');
  } catch (e) { next(e); }
};

const withdrawApplication = async (req, res, next) => {
  try {
    const result = await svc.withdrawApplication(req.params.appId, req.user.id);
    ok(res, result, 'Application withdrawn');
  } catch (e) { next(e); }
};

const inviteCreator = async (req, res, next) => {
  try {
    const app = await svc.inviteCreator(req.params.id, req.user.id, req.body.creatorId);
    ok(res, app, 'Invitation sent');
  } catch (e) { next(e); }
};

const creatorRespondToInvitation = async (req, res, next) => {
  try {
    const result = await svc.creatorRespondToInvitation(req.params.appId, req.params.action, req.user.id);
    ok(res, result, 'Response recorded');
  } catch (e) { next(e); }
};

module.exports = { create, list, getById, update, remove, apply, getApplications, respondToApplication, withdrawApplication, inviteCreator, creatorRespondToInvitation };
