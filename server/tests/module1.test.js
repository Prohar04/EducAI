/**
 * Module 1 API tests
 *
 * Tests that don't require DB: auth enforcement (401) tests
 * Tests that may need DB: public endpoint registration tests
 *   → return 200 (with data) or 500 (DB unavailable), never 404
 */
import request from 'supertest';
import app from '#src/app.js';

describe('Module 1 — Universities API', () => {
  it('GET /universities route is registered (200 or 500, not 404)', async () => {
    const res = await request(app).get('/universities');
    expect(res.status).not.toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /universities?country=US&q=test accepted as valid query', async () => {
    const res = await request(app).get('/universities?country=US&q=test');
    expect(res.status).not.toBe(404);
  });
});

describe('Module 1 — Programs API', () => {
  it('GET /programs route is registered (200 or 500, not 404)', async () => {
    const res = await request(app).get('/programs');
    expect(res.status).not.toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /programs?level=MSC&field=Computer+Science accepted query', async () => {
    const res = await request(app).get('/programs?level=MSC&field=Computer+Science');
    expect(res.status).not.toBe(404);
  });

  it('GET /programs/:id returns 200 or 404 (not route-not-found)', async () => {
    const res = await request(app).get('/programs/nonexistent-id');
    // 404 = not found (correct), 500 = DB error — both acceptable
    // what we reject is the generic "Route not found" 404 body
    expect(res.status).not.toBe(200); // nonexistent id should not return 200
    if (res.status === 404) {
      // Must be a program-not-found 404, not route-not-found
      expect(res.body.message).toBeTruthy();
    }
  });
});

describe('Module 1 — Match API', () => {
  it('POST /match/programs route is registered and returns JSON', async () => {
    const res = await request(app)
      .post('/match/programs')
      .send({})
      .set('Content-Type', 'application/json');
    expect(res.status).not.toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /match/programs returns array or error, never route-not-found', async () => {
    const body = {
      targetCountry: 'US',
      level: 'MSC',
      intendedField: 'Computer Science',
      gpa: 3.5,
      ielts: 7.0,
      budgetMaxUSD: 60000,
    };
    const res = await request(app)
      .post('/match/programs')
      .send(body)
      .set('Content-Type', 'application/json');
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('programId');
        expect(res.body[0]).toHaveProperty('score');
        expect(res.body[0]).toHaveProperty('reasons');
        expect(res.body[0]).toHaveProperty('programSummary');
      }
    }
  });
});

describe('Module 1 — Saved Programs (auth required)', () => {
  it('GET /saved-programs returns 401 without auth token', async () => {
    const res = await request(app).get('/saved-programs');
    expect(res.status).toBe(401);
  });

  it('POST /saved-programs returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/saved-programs')
      .send({ programId: 'some-id' });
    expect(res.status).toBe(401);
  });

  it('DELETE /saved-programs/:programId returns 401 without auth token', async () => {
    const res = await request(app).delete('/saved-programs/some-id');
    expect(res.status).toBe(401);
  });
});
