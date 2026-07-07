const { CreatorProfile, BrandProfile, User } = require('../models');
const searchSvc = require('./search.service');

async function getDiscover() {
  const [featuredCreators, brandsResult, creatorTotal, brandTotal] = await Promise.all([
    searchSvc.getFeaturedCreators(),
    searchSvc.searchBrands({ limit: 3 }),
    User.count({ where: { role: 'CREATOR', status: 'APPROVED' } }),
    User.count({ where: { role: 'BRAND', status: 'APPROVED' } }),
  ]);

  const toJson = (row) => (row?.toJSON ? row.toJSON() : row);

  return {
    creators: featuredCreators.map(toJson),
    brands: brandsResult.items.map(toJson),
    stats: {
      creators: creatorTotal,
      brands: brandTotal,
    },
  };
}

module.exports = { getDiscover };
