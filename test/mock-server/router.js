'use strict';

const Router = require('koa-router');

module.exports = (app, data) => {
    const router = new Router();

    const OK = ctx => {
        ctx.body = { success: true };
    };

    router.post('/:index/:type/_search', ctx => {
        const { index } = ctx.params;
        const resources = data[index] || [];
        ctx.body = {
            timeout: false,
            hits: {
                hits: resources,
                total: resources.length,
            },
        };
    });

    router
        .all('/:index/:type', OK)
        .all('/:index/:type/:whatever', OK)
        .all('/:index/:type/:whatever1/:whatever2', OK);

    app.use(router.routes()).use(router.allowedMethods());
};
