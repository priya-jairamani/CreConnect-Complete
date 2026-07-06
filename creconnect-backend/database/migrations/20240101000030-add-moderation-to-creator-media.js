'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_creator_media_moderationStatus" AS ENUM ('PENDING','APPROVED','REJECTED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryInterface.addColumn('creator_media', 'moderationStatus', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'APPROVED',
      allowNull: false,
    });

    // Existing portfolio items stay visible; only new uploads go to PENDING via app code.
    await queryInterface.sequelize.query(`
      UPDATE creator_media SET "moderationStatus" = 'APPROVED' WHERE "moderationStatus" IS NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('creator_media', 'moderationStatus');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_creator_media_moderationStatus";');
  },
};
