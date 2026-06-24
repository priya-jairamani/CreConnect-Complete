'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('brand_profiles', 'instagram', { type: Sequelize.STRING });
    await queryInterface.addColumn('brand_profiles', 'tiktok',    { type: Sequelize.STRING });
    await queryInterface.addColumn('brand_profiles', 'youtube',   { type: Sequelize.STRING });
    await queryInterface.addColumn('brand_profiles', 'linkedin',  { type: Sequelize.STRING });
    await queryInterface.addColumn('brand_profiles', 'facebook',  { type: Sequelize.STRING });
    await queryInterface.addColumn('brand_profiles', 'twitter',   { type: Sequelize.STRING });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('brand_profiles', 'instagram');
    await queryInterface.removeColumn('brand_profiles', 'tiktok');
    await queryInterface.removeColumn('brand_profiles', 'youtube');
    await queryInterface.removeColumn('brand_profiles', 'linkedin');
    await queryInterface.removeColumn('brand_profiles', 'facebook');
    await queryInterface.removeColumn('brand_profiles', 'twitter');
  },
};
