'use strict';

const { app } = require('egg-mock/bootstrap');
const jwt = require('keepwork-jwt-simple');
const runMockServer = require('./mock-server/server');

let mockServer;

before(async () => {
  await app.ready();

  const mockServerConfig = app.config.mockServer;
  mockServer = await runMockServer(mockServerConfig);

  const secret = app.config.jwt.secret;
  const token = jwt.encode({ roleId: 10 }, secret, 'HS1');
  app.token = `Bearer ${token}`;
});

after(() => {
  mockServer.close();
});
