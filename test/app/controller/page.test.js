'use strict';

const { app } = require('egg-mock/bootstrap');

describe('test/app/controller/page.test.js', () => {
  const username = 'test';
  const sitename = 'test';
  it('should PUT /sites/:username/:sitename/visibility', () => {
    const visibility = 'private';
    return app.httpRequest()
      .put(`/sites/${username}/${sitename}/visibility`)
      .set({ Authorization: app.token })
      .send({ visibility })
      .expect(200);
  });

  it('should DELETE /sites/:username/:sitename', () => {
    return app.httpRequest()
      .delete(`/sites/${username}/${sitename}`)
      .set({ Authorization: app.token })
      .expect(200);
  });
});
