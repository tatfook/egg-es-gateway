'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const faker = require('faker');

describe('test/app/controller/user.test.js', () => {
  const user = {
    id: faker.random.number(),
    username: faker.internet.userName(),
    nickname: faker.internet.userName(),
    portrait: faker.internet.avatar(),
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    total_projects: faker.random.number(),
    total_fans: faker.random.number(),
    total_follows: faker.random.number(),
    description: faker.lorem.text(),
  };

  it('should POST /users', () => {
    return app.httpRequest()
      .post('/users')
      .set(app.auth_header)
      .send(user)
      .expect(201);
  });

  it('should PUT /users/:id', () => {
    return app.httpRequest()
      .put(`/users/${user.id}`)
      .set(app.auth_header)
      .send(user)
      .expect(200);
  });

  it('should delete /users/:id', () => {
    return app.httpRequest()
      .delete(`/users/${user.id}`)
      .set(app.auth_header)
      .expect(200);
  });

  it('should post /users/:id/upsert', () => {
    return app.httpRequest()
      .post(`/users/${user.id}/upsert`)
      .set(app.auth_header)
      .send(user)
      .expect(200);
  });

  it('should get /users', async () => {
    const res = await app.httpRequest()
      .get('/users?q=123')
      .expect(200);

    const result = res.body;
    assert(result);
    assert(result.hits);
    assert(result.total);
  });
});
