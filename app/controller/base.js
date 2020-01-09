/* eslint-disable no-magic-numbers */
'use strict';

const Controller = require('egg').Controller;

class baseController extends Controller {
    async bulk() {
        const { ctx, service } = this;
        ctx.ensureAdmin();
        const { body, type, index } = ctx.getParams();
        const response = await service.es.client.bulk({ body, type, index });
        ctx.body = response;
    }

    async clearIndexData() {
        const { ctx, service } = this;
        ctx.ensureAdmin();
        const { index } = ctx.getParams();
        const query = {
            body: ctx.service.dsl.get_query_all_DSL(),
        };
        const resourceService = service[index]; // page, project, user
        const query_with_location = resourceService.add_location(query);
        ctx.body = await service.es.client.deleteByQuery(query_with_location);
        this.deleted();
    }

    success(action = 'success') {
        const { ctx } = this;
        ctx.body = {};
        ctx.body[action] = true;
    }

    created() {
        const { ctx } = this;
        ctx.status = 201;
        this.success('created');
    }

    updated() {
        this.success('updated');
    }

    upserted() {
        this.success('upserted');
    }

    deleted() {
        this.success('deleted');
    }

    moved() {
        this.success('moved');
    }

    notFound(msg) {
        msg = msg || 'resource not found';
        const { ctx } = this;
        ctx.status = 404;
        ctx.body = {
            found: false,
            msg,
        };
    }
}

module.exports = baseController;
