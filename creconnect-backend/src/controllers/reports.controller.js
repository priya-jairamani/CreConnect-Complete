const svc = require('../services/reports.service');
const { created } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    created(res, await svc.create(req.user.id, req.body), 'Report submitted');
  } catch (e) { next(e); }
};

module.exports = { create };
