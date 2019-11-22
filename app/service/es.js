'use strict';

const Service = require('egg').Service;
const elasticsearch = require('elasticsearch');

module.exports = app => {
    const config = app.config.elasticsearch;
    const Client = new elasticsearch.Client({
        host: config.url,
        apiVersion: config.version,
        log: config.log || 'info',
    });

    class EsService extends Service {
        get client() {
            return Client;
        }
    }

    return EsService;
};
