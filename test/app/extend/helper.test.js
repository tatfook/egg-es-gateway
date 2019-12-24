'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const _ = require('lodash');

let helper;

before(async () => {
    await app.ready();
    const ctx = app.mockContext();
    helper = ctx.helper;
});

describe('test/app/extend/helper.test.js', () => {
    it('hanzi_to_pinyin', () => {
        const hanzi = '汉字';
        const expected = 'hanzi';
        assert(helper.hanzi_to_pinyin(hanzi) === expected);
    });

    it('paginate', () => {
        const query = {
            per_page: 10,
            page: 2,
        };
        const expected = [10, 10];
        assert(_.isEqual(helper.paginate(query), expected));
    });

    it('to_sha1', () => {
        const str = 'hello';
        assert(helper.to_sha1(str));
    });
});
