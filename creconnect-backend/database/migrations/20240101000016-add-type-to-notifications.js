'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notifications', 'type', {
      type:         Sequelize.STRING(50),
      allowNull:    false,
      defaultValue: 'SYSTEM',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('notifications', 'type');
  },
};
