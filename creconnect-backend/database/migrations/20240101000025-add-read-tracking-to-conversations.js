'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'creatorReadAt', { type: Sequelize.DATE });
    await queryInterface.addColumn('conversations', 'brandReadAt', { type: Sequelize.DATE });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('conversations', 'creatorReadAt');
    await queryInterface.removeColumn('conversations', 'brandReadAt');
  },
};
