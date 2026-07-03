const svc = require('../services/admin.service');
const subscriptionsSvc = require('../services/subscriptions.service');
const { ok, paginated } = require('../utils/response');

const listUsers = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listUsers(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const updateUserStatus = async (req, res, next) => {
  try { ok(res, await svc.updateUserStatus(req.params.id, req.body.status), 'User status updated'); } catch (e) { next(e); }
};

const listCampaigns = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listCampaigns(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const listReports = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.listReports(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const resolveReport = async (req, res, next) => {
  try {
    ok(res, await svc.resolveReport(req.params.id, req.params.action, req.body.resolution));
  } catch (e) { next(e); }
};

const announce = async (req, res, next) => {
  try { ok(res, await svc.announce(req.body.message, req.body.audience || 'ALL'), 'Announcement sent'); } catch (e) { next(e); }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getAuditLogs(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const grantEnterprisePlan = async (req, res, next) => {
  try {
    const { role, campaignLimit, collabLimit } = req.body;
    const sub = await subscriptionsSvc.grantEnterpriseSubscription(req.user.id, req.params.userId, role, { campaignLimit, collabLimit });
    ok(res, sub, 'Enterprise plan granted');
  } catch (e) { next(e); }
};

module.exports = { listUsers, updateUserStatus, listCampaigns, listReports, resolveReport, announce, getAuditLogs, grantEnterprisePlan };
