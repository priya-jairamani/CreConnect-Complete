const svc = require('../services/search.service');
const { paginated } = require('../utils/response');

const creators = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.searchCreators(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const brands = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.searchBrands(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const campaigns = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.searchCampaigns(req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

module.exports = { creators, brands, campaigns };
