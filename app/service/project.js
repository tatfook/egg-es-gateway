'use strict';

const Service = require('egg').Service;

class ProjectService extends Service {
    get invisible_DSL() {
        return { term: { visibility: 'private' } };
    }

    add_location(payload) {
        const data_type = 'project';
        return this.ctx.service.dsl.add_location(payload, data_type);
    }

    get_rank_DSL(field, order) {
        const DSL = this.ctx.service.dsl.add_sort_DSL({}, field, order);
        DSL.query = {
            bool: { must_not: this.invisible_DSL },
        };
        return DSL;
    }

    get_search_DSL() {
        let DSL = {};
        DSL = this.add_query_DSL(DSL);
        DSL = this.ctx.service.dsl.add_highlight_DSL(
            DSL,
            'id',
            'name',
            'username',
            'world_tag_name'
        );
        DSL = this.ctx.service.dsl.add_multi_sort_DSL(DSL);
        return DSL;
    }

    add_query_DSL(DSL) {
        DSL.query = {
            bool: {
                must: this.get_must_query(),
                must_not: this.invisible_DSL,
            },
        };
        return DSL;
    }

    get_default_should_query() {
        let should;
        const { q } = this.ctx.getParams();
        if (!q) {
            should = [
                { exists: { field: 'cover' } },
                { exists: { field: 'video' } },
            ];
        }
        return should;
    }

    get_should_bool_query() {
        const { ctx } = this;
        const q = ctx.query.q;
        let should;
        if (q) {
            const max_expansions = ctx.service.dsl.max_expansions();
            should = [];
            if (Number(q)) {
                should.push({ term: { id: { value: q, boost: 5 } } });
            }
            should.push(
                { term: { 'name.keyword': { value: q, boost: 3 } } },
                { term: { 'world_tag_name.keyword': { value: q, boost: 3 } } },
                { prefix: { username: { value: q, boost: 2 } } },
                {
                    match_phrase_prefix: {
                        name: { query: q, max_expansions, boost: 2 },
                    },
                },
                {
                    match_phrase_prefix: {
                        world_tag_name: { query: q, max_expansions, boost: 2 },
                    },
                },
                { wildcard: { name: `*${q}*` } },
                { wildcard: { world_tag_name: `*${q}*` } }
            );

            if (q.includes(' ')) {
                const filtered = ctx.helper.filterSubStr(q, ' ');
                should.push(
                    { term: { 'name.keyword': { value: filtered, boost: 3 } } },
                    {
                        term: {
                            'world_tag_name.keyword': {
                                value: filtered,
                                boost: 3,
                            },
                        },
                    },
                    {
                        match_phrase_prefix: {
                            name: { query: filtered, max_expansions, boost: 2 },
                        },
                    },
                    {
                        match_phrase_prefix: {
                            world_tag_name: {
                                query: filtered,
                                max_expansions,
                                boost: 2,
                            },
                        },
                    }
                );
            }
        } else {
            should = this.get_default_should_query();
        }
        return should;
    }

    get_must_query() {
        const must = [];
        const should = this.get_should_bool_query();
        const { type, tags, recruiting, recommended } = this.ctx.getParams();
        if (should) must.push({ bool: { should } });
        if (type) must.push({ term: { type } });
        if (tags) must.push({ term: { tags } });
        if (recruiting) must.push({ term: { recruiting: true } });
        if (recommended) must.push({ term: { recommended: true } });
        this.add_sys_tags_query(must);
        return must;
    }

    add_sys_tags_query(must) {
        const { ctx } = this;
        const { sys_tags } = ctx.getParams();
        if (sys_tags) {
            try {
                const parsed = ctx.helper.parseQuery(sys_tags);
                for (const sys_tag of parsed) {
                    must.push({ term: { sys_tags: sys_tag } });
                }
            } catch (e) {
                ctx.throw(400, 'invalid sys_tags');
            }
        }
    }

    wrap_search_result(result) {
        return {
            hits: result.hits.hits.map(hit => {
                hit._source._score = hit._score;
                hit._source.id = Number(hit._source.id);
                hit._source.highlight = hit.highlight;
                hit._source.suggestions = undefined;
                return hit._source;
            }),
            total: result.hits.total,
        };
    }
}

module.exports = ProjectService;
