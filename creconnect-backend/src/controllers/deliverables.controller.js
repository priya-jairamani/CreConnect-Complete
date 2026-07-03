const svc = require('../services/deliverables.service');
const { ok, created } = require('../utils/response');

const list = async (req, res, next) => {
  try { ok(res, await svc.list(req.params.collabId, req.user.id)); } catch (e) { next(e); }
};

const submit = async (req, res, next) => {
  try { created(res, await svc.submit(req.params.collabId, req.user.id, req.body), 'Deliverable submitted'); } catch (e) { next(e); }
};

const respond = async (req, res, next) => {
  try { ok(res, await svc.respond(req.params.deliverableId, req.user.id, req.params.action, req.body.feedback), 'Deliverable reviewed'); } catch (e) { next(e); }
};

module.exports = { list, submit, respond };
