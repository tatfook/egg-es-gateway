'use strict';

const { app } = require('egg-mock/bootstrap');

describe('app/test/controller/base.test.js', async () => {
  it('should POST /bulk', () => {
    const body = [
      { create: { _id: 15 } },
      { username: 'test', title: 'test' },
      { delete: { _id: 13 } },
    ];
    const type = 'pages';
    const index = 'pages';
    return app.httpRequest()
      .post('/bulk')
      .set({ Authorization: app.token })
      .send({ body, index, type })
      .expect(200);
  });
});
