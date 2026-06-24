const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app  = require('../src/app');
const { sequelize, User, BrandProfile, CreatorProfile } = require('../src/models');

let brandToken, creatorToken, campaignId;

const BRAND_EMAIL   = 'brand_camp_test@test.com';
const CREATOR_EMAIL = 'creator_camp_test@test.com';

beforeAll(async () => {
  await sequelize.authenticate();
  const hash = await bcrypt.hash('TestPass@1', 12);

  await User.destroy({ where: { email: [BRAND_EMAIL, CREATOR_EMAIL] }, cascade: true });

  const brandUser = await User.create(
    { email: BRAND_EMAIL, passwordHash: hash, role: 'BRAND', status: 'APPROVED', emailVerified: true,
      brandProfile: { companyName: 'Test Brand', contactName: 'Test', industry: 'Tech' } },
    { include: [{ model: BrandProfile, as: 'brandProfile' }] }
  );

  const creatorUser = await User.create(
    { email: CREATOR_EMAIL, passwordHash: hash, role: 'CREATOR', status: 'APPROVED', emailVerified: true,
      creatorProfile: { username: 'test_creator_camp', displayName: 'Test Creator' } },
    { include: [{ model: CreatorProfile, as: 'creatorProfile' }] }
  );

  const [bl, cl] = await Promise.all([
    request(app).post('/api/v1/auth/login').send({ email: BRAND_EMAIL,   password: 'TestPass@1' }),
    request(app).post('/api/v1/auth/login').send({ email: CREATOR_EMAIL, password: 'TestPass@1' }),
  ]);

  brandToken   = bl.body.data.accessToken;
  creatorToken = cl.body.data.accessToken;
});

afterAll(async () => {
  await User.destroy({ where: { email: [BRAND_EMAIL, CREATOR_EMAIL] }, cascade: true });
  await sequelize.close();
});

describe('Campaign CRUD', () => {
  it('brand can create a campaign', async () => {
    const res = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${brandToken}`)
      .send({
        title: 'Test Campaign', description: 'A test campaign',
        objective: 'AWARENESS', niche: 'TECH', platforms: ['INSTAGRAM'],
        budgetType: 'FIXED', budgetPKR: 50000,
        reels: 2, posts: 1, stories: 3, videos: 0, livestreams: 0,
        status: 'PUBLISHED',
      });
    expect(res.status).toBe(201);
    campaignId = res.body.data.id;
  });

  it('returns campaign by id', async () => {
    const res = await request(app)
      .get(`/api/v1/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${brandToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Test Campaign');
  });

  it('creator can apply to campaign', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${campaignId}/apply`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ note: 'I am a great fit!' });
    expect([201, 409]).toContain(res.status);
  });

  it('brand can delete campaign', async () => {
    const res = await request(app)
      .delete(`/api/v1/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${brandToken}`);
    expect(res.status).toBe(200);
  });
});
