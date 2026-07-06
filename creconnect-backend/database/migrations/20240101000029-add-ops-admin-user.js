'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

/** Live admin account — admin@creconnect.com reads/writes the real database. */
module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@creconnect.com' LIMIT 1`
    );
    if (existing.length) return;

    const now = new Date();
    const userId = uuid();
    const profileId = uuid();
    const hash = bcrypt.hashSync('Admin@12345', 12);

    await queryInterface.bulkInsert('users', [{
      id: userId,
      email: 'admin@creconnect.com',
      passwordHash: hash,
      role: 'ADMIN',
      status: 'APPROVED',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    }]);

    await queryInterface.bulkInsert('admin_profiles', [{
      id: profileId,
      userId,
      name: 'Operations Admin',
      createdAt: now,
      updatedAt: now,
    }]);
  },

  async down(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@creconnect.com' LIMIT 1`
    );
    if (!rows.length) return;
    const userId = rows[0].id;
    await queryInterface.bulkDelete('admin_profiles', { userId });
    await queryInterface.bulkDelete('users', { id: userId });
  },
};
