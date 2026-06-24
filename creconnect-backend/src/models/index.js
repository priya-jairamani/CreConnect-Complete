const fs   = require('fs');
const path = require('path');
const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const db = {};

// Auto-load every model file in this directory (except index.js)
fs.readdirSync(__dirname)
  .filter((f) => f !== 'index.js' && f.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Wire up all associations
Object.values(db).forEach((model) => {
  if (typeof model.associate === 'function') model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize  = require('sequelize');

module.exports = db;
