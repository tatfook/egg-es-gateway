'use strict';

const Router = require('koa-router');

module.exports = (app, data) => {
  const router = new Router();

  router.post('/:index/:type/_search', ctx => {
    const { index } = ctx.params;
    const hits = data[index] || [];
    const total = hits.length;
    ctx.body = { total, hits };
  });

  router.post('/_bulk', ctx => {
    ctx.body = { success: true };
  });

  router.post('/:index/:type/_bulk', ctx => {
    ctx.body = { success: true };
  });

  router.all('/:index/:type', ctx => {
    ctx.body = { success: true };
  });

  router.all('/:index/:type:/:_id', ctx => {
    ctx.body = { success: true };
  });

  app.use(router.routes()).use(router.allowedMethods());
};
