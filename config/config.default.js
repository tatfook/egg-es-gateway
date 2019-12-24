'use strict';

const error_handler = require('./error_handler');

module.exports = () => {
    const config = (exports = {});

    // add your config here
    config.middleware = ['jwt'];

    // error handler
    config.onerror = error_handler;

    config.bodyParser = {
        enable: true,
        jsonLimit: '10mb',
        formLimit: '10mb',
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

    config.ajv = {
        keyword: 'validator',
        removeAdditional: true,
    };

    return config;
};
