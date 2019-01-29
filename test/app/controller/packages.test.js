'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const faker = require('faker');

describe('test/app/controller/package.test.js', () => {
  const lessons_package = {
    id: faker.random.number(),
    title: faker.name.title(),
    prize: faker.random.number(),
    description: faker.lorem.text(),
    age_min: faker.random.number(),
    age_max: faker.random.number(),
    total_lessons: faker.random.number(),
    recent_view: faker.random.number(),
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
  };

  it('should POST /packages', () => {
    return app.httpRequest()
      .post('/packages')
      .set(app.auth_header)
      .send(lessons_package)
      .expect(201);
  });

  it('should PUT /packages/:id', () => {
    return app.httpRequest()
      .put(`/packages/${lessons_package.id}`)
      .set(app.auth_header)
      .send(lessons_package)
      .expect(200);
  });

  it('should delete /packages/:id', () => {
    return app.httpRequest()
      .delete(`/packages/${lessons_package.id}`)
      .set(app.auth_header)
      .expect(200);
  });

  it('should post /packages/:id/upsert', () => {
    return app.httpRequest()
      .post(`/packages/${lessons_package.id}/upsert`)
      .set(app.auth_header)
      .send(lessons_package)
      .expect(200);
  });

  it('should get /packages', async () => {
    const res = await app.httpRequest()
      .get('/packages?q=123')
      .expect(200);

    const result = res.body;
    assert(result);
    assert(result.hits);
    assert(result.total);
  });
});
