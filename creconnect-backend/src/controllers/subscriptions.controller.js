const svc = require('../services/subscriptions.service');
const { ok, created } = require('../utils/response');

const getMyPlan = async (req, res, next) => {
  try { ok(res, await svc.getMyPlanSummary(req.user.id, req.user.role)); } catch (e) { next(e); }
};

const listPlans = async (req, res, next) => {
  try { ok(res, svc.listPlans(req.user.role)); } catch (e) { next(e); }
};

const checkout = async (req, res, next) => {
  try { created(res, await svc.createCheckoutSession(req.user.id, req.user.role, req.body.tier), 'Redirecting to checkout'); } catch (e) { next(e); }
};

const billingPortal = async (req, res, next) => {
  try { ok(res, await svc.createBillingPortalSession(req.user.id)); } catch (e) { next(e); }
};

module.exports = { getMyPlan, listPlans, checkout, billingPortal };
