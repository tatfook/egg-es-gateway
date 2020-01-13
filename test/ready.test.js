'use strict';

const { app } = require('egg-mock/bootstrap');
const runMockServer = require('./mock-server/server');

let mockServer;

before(async () => {
    await app.ready();

    const mockServerConfig = app.config.mockServer;
    mockServer = await runMockServer(mockServerConfig);

    app.authHeader = { 'x-api-key': app.config.INTERNAL_API_KEY };
});

after(() => {
    mockServer.close();
});
