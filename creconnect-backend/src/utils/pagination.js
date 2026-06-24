function parsePagination(query, defaultLimit = 20) {
  const page   = Math.max(1, parseInt(query.page, 10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;  // Sequelize uses offset, not skip
  return { page, limit, offset };
}

module.exports = { parsePagination };
