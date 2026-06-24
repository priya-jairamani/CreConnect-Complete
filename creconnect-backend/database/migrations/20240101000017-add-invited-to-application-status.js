'use strict';

module.exports = {
  async up(queryInterface) {
    // PostgreSQL: add new value to existing ENUM type
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_applications_status" ADD VALUE IF NOT EXISTS 'INVITED';`
    );
  },
  async down() {
    // PostgreSQL does not support removing enum values
  },
};
