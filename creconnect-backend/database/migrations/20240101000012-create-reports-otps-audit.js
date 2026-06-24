'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      reporterId:     { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      reportedUserId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      violationType:  { type: Sequelize.STRING, allowNull: false },
      description:    { type: Sequelize.TEXT, allowNull: false },
      status:         { type: Sequelize.ENUM('OPEN','RESOLVED','DISMISSED'), defaultValue: 'OPEN' },
      resolution:     { type: Sequelize.TEXT },
      resolvedAt:     { type: Sequelize.DATE },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('otps', {
      id:        { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      email:     { type: Sequelize.STRING, allowNull: false },
      code:      { type: Sequelize.STRING(6), allowNull: false },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      used:      { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('otps', ['email']);

    await queryInterface.createTable('audit_logs', {
      id:        { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      userId:    { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      action:    { type: Sequelize.STRING, allowNull: false },
      entity:    { type: Sequelize.STRING },
      entityId:  { type: Sequelize.STRING },
      meta:      { type: Sequelize.JSONB },
      ip:        { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('otps');
    await queryInterface.dropTable('reports');
  },
};
