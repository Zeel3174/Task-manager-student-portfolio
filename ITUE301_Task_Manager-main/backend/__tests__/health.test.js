const request = require('supertest');
const app = require('../server');
test('GET / returns API status', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toContain('Task Manager API');
});
