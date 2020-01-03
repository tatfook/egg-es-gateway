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
        // 安全删除，删除不存在的不报错
        async safeDelete(DSL) {
            try {
                return await this.client.delete(DSL);
            } catch (error) {
                const notFound =
                    error.statusCode === 404 &&
                    error.body &&
                    error.body.found === false;
                if (notFound) {
                    return {};
                }
                throw error;
            }
        }
    }

    return EsService;
};
