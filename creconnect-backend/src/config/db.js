const { Sequelize } = require('sequelize');
const { DATABASE_URL, NODE_ENV, IS_PROD } = require('./env');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? (sql) => require('../utils/logger').debug(sql) : false,
  dialectOptions: IS_PROD ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

module.exports = sequelize;
