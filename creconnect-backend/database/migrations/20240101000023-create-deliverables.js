'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deliverables', {
      id:              { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      collaborationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'collaborations', key: 'id' }, onDelete: 'CASCADE' },
      submittedBy:     { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      note:            { type: Sequelize.TEXT, allowNull: false },
      link:            { type: Sequelize.STRING },
      status:          { type: Sequelize.ENUM('SUBMITTED', 'APPROVED', 'REVISION_REQUESTED'), defaultValue: 'SUBMITTED' },
      feedback:        { type: Sequelize.TEXT },
      createdAt:       { type: Sequelize.DATE, allowNull: false },
      updatedAt:       { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('deliverables', ['collaborationId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('deliverables');
  },
};
