import request from 'supertest';
import app from '#src/app.js';

describe('Resume Routes', () => {
  describe('POST /resume/generate — auth guard', () => {
    it('returns 401 without a session token', async () => {
      const response = await request(app)
        .post('/resume/generate')
        .send({ resumeTemplate: 'ats-clean' })
        .expect(401);

      // Auth middleware returns { message: 'Unauthorized' }
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /resume/download-pdf — auth guard', () => {
    it('returns 401 without a session token', async () => {
      const response = await request(app)
        .post('/resume/download-pdf')
        .send({ content: 'Test resume', template: 'ats-clean' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Resume route mounting', () => {
    it('/resume routes exist (not 404)', async () => {
      // 401 (auth required) proves the route is mounted — 404 would mean it isn't
      const gen = await request(app).post('/resume/generate').send({});
      expect(gen.status).not.toBe(404);

      const pdf = await request(app).post('/resume/download-pdf').send({});
      expect(pdf.status).not.toBe(404);
    });
  });
});
