const svc = require('../services/payments.service');
const { ok, created, paginated } = require('../utils/response');

const createEscrow = async (req, res, next) => {
  try { created(res, await svc.createEscrow(req.params.collabId, req.user.id), 'Escrow created'); } catch (e) { next(e); }
};

const releasePayment = async (req, res, next) => {
  try { ok(res, await svc.releasePayment(req.params.paymentId, req.user.id), 'Payment released'); } catch (e) { next(e); }
};

const getHistory = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getHistory(req.user.id, req.user.role, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

module.exports = { createEscrow, releasePayment, getHistory };
