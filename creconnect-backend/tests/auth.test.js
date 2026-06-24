const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await User.destroy({ where: { email: { [require('sequelize').Op.like]: '%_test@%' } } });
  await sequelize.close();
});

describe('GET /api/v1/auth/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/auth/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
});

describe('POST /api/v1/auth/register', () => {
  const email = 'creator_test@test.com';

  it('registers a creator successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email,
      password: 'TestPass@1',
      role: 'CREATOR',
      username: 'testcreator99',
      displayName: 'Test Creator',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 409 on duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email,
      password: 'TestPass@1',
      role: 'CREATOR',
      username: 'testcreator100',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 401 with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
