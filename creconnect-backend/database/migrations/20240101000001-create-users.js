'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_users_role"   AS ENUM ('CREATOR','BRAND','ADMIN');
        CREATE TYPE "enum_users_status" AS ENUM ('PENDING','APPROVED','REJECTED','SUSPENDED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryInterface.createTable('users', {
      id:            { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      email:         { type: Sequelize.STRING, allowNull: false, unique: true },
      passwordHash:  { type: Sequelize.STRING, allowNull: false },
      role:          { type: Sequelize.ENUM('CREATOR','BRAND','ADMIN'), allowNull: false },
      status:        { type: Sequelize.ENUM('PENDING','APPROVED','REJECTED','SUSPENDED'), defaultValue: 'PENDING' },
      emailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
      emailToken:    { type: Sequelize.STRING },
      resetToken:    { type: Sequelize.STRING },
      resetTokenExp: { type: Sequelize.DATE },
      createdAt:     { type: Sequelize.DATE, allowNull: false },
      updatedAt:     { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
