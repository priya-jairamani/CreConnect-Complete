const svc = require('../services/collaborations.service');
const { ok } = require('../utils/response');

const getDetail = async (req, res, next) => {
  try {
    ok(res, await svc.getDetail(req.params.collabId, req.user.id));
  } catch (e) { next(e); }
};

module.exports = { getDetail };
