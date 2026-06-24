'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('brand_profiles', {
      id:          { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      userId:      { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      companyName: { type: Sequelize.STRING, allowNull: false },
      contactName: { type: Sequelize.STRING, allowNull: false },
      industry:    { type: Sequelize.STRING, allowNull: false },
      website:     { type: Sequelize.STRING },
      logoUrl:     { type: Sequelize.STRING },
      location:    { type: Sequelize.STRING },
      brandSize:   { type: Sequelize.ENUM('STARTUP','GROWING','ENTERPRISE') },
      isVerified:  { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt:   { type: Sequelize.DATE, allowNull: false },
      updatedAt:   { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('brand_profiles');
  },
};
