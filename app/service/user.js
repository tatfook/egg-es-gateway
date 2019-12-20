'use strict';

const Service = require('egg').Service;

class UserService extends Service {
    add_location(payload) {
        const data_type = 'user';
        return this.ctx.service.dsl.add_location(payload, data_type);
    }

    get_search_DSL() {
        let DSL = {};
        DSL = this.add_query_DSL(DSL);
        DSL = this.ctx.service.dsl.add_highlight_DSL(
            DSL,
            'username',
            'nickname'
        );
        DSL = this.ctx.service.dsl.add_multi_sort_DSL(DSL);
        return DSL;
    }

    add_query_DSL(DSL) {
        DSL.query = {
            bool: {
                should: this.get_should_query(),
            },
        };
        return DSL;
    }

    get_should_query() {
        const { ctx } = this;
        const q = ctx.query.q;
        let should;
        if (q) {
            const max_expansions = ctx.service.dsl.max_expansions();
            should = [
                { term: { 'username.keyword': { value: q, boost: 3 } } },
                { prefix: { username: { value: q, boost: 2 } } },
                {
                    multi_match: {
                        fields: ['username', 'nickname'],
                        query: q,
                        type: 'phrase_prefix',
                        max_expansions,
                    },
                },
                { wildcard: { username: `*${q}*` } },
                { wildcard: { nickname: `*${q}*` } },
            ];
        }
        return should;
    }

    wrap_search_result(result) {
        return {
            hits: result.hits.hits.map(hit => {
                hit._source.id = Number(hit._id);
                hit._source._score = hit._score;
                hit._source.suggestions = undefined;
                return hit._source;
            }),
            total: result.hits.total,
        };
    }
}

module.exports = UserService;
