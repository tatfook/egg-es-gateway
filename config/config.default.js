'use strict';

const error_handler = require('./error_handler');

module.exports = () => {
  const config = exports = {};

  // add your config here
  config.middleware = [];

  // error handler
  config.onerror = error_handler;

  config.bodyParser = {
    jsonLimit: '10mb',
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  return config;
};
