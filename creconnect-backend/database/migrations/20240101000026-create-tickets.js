'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
      id:              { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      subject:         { type: Sequelize.STRING, allowNull: false },
      description:     { type: Sequelize.TEXT, allowNull: false },
      category:        { type: Sequelize.STRING, defaultValue: 'GENERAL' },
      priority:        { type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'), defaultValue: 'MEDIUM' },
      status:          { type: Sequelize.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'), defaultValue: 'OPEN' },
      reporterId:      { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      assignedAdminId: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      resolvedAt:      { type: Sequelize.DATE },
      createdAt:       { type: Sequelize.DATE, allowNull: false },
      updatedAt:       { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('tickets', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tickets');
  },
};
