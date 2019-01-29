'use strict';

const Koa = require('koa');
const route = require('./router');
const data = require('./data/index');

module.exports = config => new Promise((resolve, reject) => {
  try {
    const app = new Koa();
    route(app, data);
    const port = config.port || 3000;
    const mockServer = app.listen(port, () => {
      resolve(mockServer);
    });
  } catch (error) {
    reject(error);
  }
});
