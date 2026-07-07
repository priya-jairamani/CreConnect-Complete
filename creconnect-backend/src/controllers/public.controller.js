const svc = require('../services/public.service');
const { ok } = require('../utils/response');

const getDiscover = async (req, res, next) => {
  try {
    ok(res, await svc.getDiscover());
  } catch (e) { next(e); }
};

module.exports = { getDiscover };
