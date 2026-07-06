'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const hash = (pw) => bcrypt.hashSync(pw, 12);
    const now  = new Date();

    const adminId   = uuid();
    const opsAdminId = uuid();
    const brandId   = uuid();
    const creatorId = uuid();

    const adminProfileId   = uuid();
    const opsAdminProfileId = uuid();
    const brandProfileId   = uuid();
    const creatorProfileId = uuid();

    await queryInterface.bulkInsert('users', [
      {
        id: opsAdminId, email: 'admin@creconnect.com',
        passwordHash: hash('Admin@12345'),
        role: 'ADMIN', status: 'APPROVED', emailVerified: true, createdAt: now, updatedAt: now,
      },
      {
        id: adminId, email: process.env.ADMIN_EMAIL || 'admin@creconnect.pk',
        passwordHash: hash(process.env.ADMIN_PASSWORD || 'Admin@12345'),
        role: 'ADMIN', status: 'APPROVED', emailVerified: true, createdAt: now, updatedAt: now,
      },
      {
        id: brandId, email: 'brand@creconnect.pk',
        passwordHash: hash('Brand@12345'),
        role: 'BRAND', status: 'APPROVED', emailVerified: true, createdAt: now, updatedAt: now,
      },
      {
        id: creatorId, email: 'creator@creconnect.pk',
        passwordHash: hash('Creator@12345'),
        role: 'CREATOR', status: 'APPROVED', emailVerified: true, createdAt: now, updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('admin_profiles', [
      {
        id: opsAdminProfileId, userId: opsAdminId, name: 'Operations Admin', createdAt: now, updatedAt: now,
      },
      {
        id: adminProfileId, userId: adminId, name: 'Legacy Admin', createdAt: now, updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('brand_profiles', [{
      id: brandProfileId, userId: brandId,
      companyName: 'Demo Brand Co.', contactName: 'Ali Khan',
      industry: 'Fashion', brandSize: 'STARTUP', isVerified: true,
      createdAt: now, updatedAt: now,
    }]);

    await queryInterface.bulkInsert('creator_profiles', [{
      id: creatorProfileId, userId: creatorId,
      username: 'demo_creator', displayName: 'Demo Creator',
      bio: 'Fashion & lifestyle content creator based in Lahore.',
      niche: 'FASHION', followerCount: 45000, engagementRate: 3.8,
      rating: 4.5, isVerified: true, totalViews: 0, totalReach: 0,
      createdAt: now, updatedAt: now,
    }]);

    await queryInterface.bulkInsert('social_platforms', [
      {
        id: uuid(), creatorId: creatorProfileId,
        name: 'INSTAGRAM', handle: '@demo_creator', followerCount: 30000, isConnected: true,
        createdAt: now, updatedAt: now,
      },
      {
        id: uuid(), creatorId: creatorProfileId,
        name: 'TIKTOK', handle: '@demo_creator', followerCount: 15000, isConnected: true,
        createdAt: now, updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('social_platforms', null, {});
    await queryInterface.bulkDelete('creator_profiles', null, {});
    await queryInterface.bulkDelete('brand_profiles', null, {});
    await queryInterface.bulkDelete('admin_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
