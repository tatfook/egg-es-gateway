'use strict';

const Service = require('egg').Service;
const elasticsearch = require('elasticsearch');

let Client;

class EsService extends Service {
  get client() {
    if (!Client) {
      const config = this.config.elasticsearch;
      Client = new elasticsearch.Client({
        host: config.url,
        apiVersion: config.version,
        log: 'info',
      });
    }
    return Client;
  }
}

module.exports = EsService;
