const request = require('supertest');
const app = require('../server');

describe('Task Manager API', () => {
  test('GET / returns API status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Task Manager API');
  });

  test('AI description endpoint requires authentication', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Prepare practical submission' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authentication required');
  });
});
