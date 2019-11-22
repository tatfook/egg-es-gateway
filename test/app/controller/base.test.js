'use strict';

const { app } = require('egg-mock/bootstrap');

describe('test/app/test/controller/base.test.js', () => {
    it('should POST /bulk', () => {
        const body = [
            { create: { _id: 15 } },
            { username: 'test', title: 'test' },
            { delete: { _id: 13 } },
        ];
        const type = 'pages';
        const index = 'pages';
        return app
            .httpRequest()
            .post('/bulk')
            .set(app.auth_header)
            .send({ body, index, type })
            .expect(200);
    });
});
