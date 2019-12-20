/* eslint-disable no-magic-numbers */
'use strict';

const Controller = require('egg').Controller;

const bulk_rule = {
    body: 'array',
};

class baseController extends Controller {
    async bulk() {
        const { ctx, service } = this;
        ctx.validate(bulk_rule);
        ctx.ensureAdmin();
        const { body, type, index } = ctx.getParams();
        const response = await service.es.client.bulk({ body, type, index });
        ctx.body = response;
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
}

module.exports = baseController;
