'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('deliverables', 'type', {
      type: Sequelize.ENUM('REEL', 'POST', 'STORY', 'VIDEO', 'LIVESTREAM'),
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('deliverables', 'type');
  },
};
