'use strict';

const Service = require('egg').Service;
const elasticsearch = require('elasticsearch');

let Client;

class EsService extends Service {
  get client() {
    return Client;
  }
}

module.exports = app => {
  const config = app.config.elasticsearch;
  Client = new elasticsearch.Client({
    host: config.url,
    apiVersion: config.version,
    log: config.log || 'info',
  });
  return EsService;
};
