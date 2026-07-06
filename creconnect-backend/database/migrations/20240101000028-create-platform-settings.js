'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('platform_settings', {
      id:        { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      key:       { type: Sequelize.STRING, allowNull: false, unique: true },
      value:     { type: Sequelize.JSONB, allowNull: false },
      updatedBy: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('platform_settings');
  },
};
