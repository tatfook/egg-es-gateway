'use strict';

const Service = require('egg').Service;

class PageService extends Service {
    get invisible_DSL() {
        return { term: { visibility: 'private' } };
    }

    async isPageExist(url) {
        const payload = {
            body: {
                query: {
                    term: { 'url.keyword': url },
                },
            },
        };
        const payload_with_location = this.add_location(payload);
        const result = await this.service.es.client
            .search(payload_with_location)
            .catch(() => {
                return;
            });
        return result.hits.total > 0;
    }

    add_location(payload) {
        return this.ctx.service.dsl.add_location(payload, 'page');
    }

    get_site_DSL(DSL = {}) {
        const { sitename, username } = this.ctx.getParams();
        DSL.query = {
            bool: {
                must: [
                    { term: { 'username.keyword': username } },
                    { term: { 'site.keyword': sitename } },
                ],
            },
        };
        return DSL;
    }

    get_page_DSL(DSL = {}) {
        const url = this.ctx.getParams().id; // use url as id, not the document id
        DSL.query = {
            term: { 'url.keyword': url },
        };
        return DSL;
    }

    get_update_visibility_DSL() {
        const DSL = this.get_site_DSL();
        const { visibility } = this.ctx.getParams();
        DSL.script = {
            source: `ctx._source.visibility = "${visibility}";`,
            lang: 'painless',
        };
        return DSL;
    }

    get_update_folder_DSL() {
        const DSL = this.get_site_DSL();
        const { folder, new_folder } = this.ctx.getParams();
        DSL.query.bool.must.push({
            match_phrase_prefix: {
                url: folder,
            },
        });
        // 文件名和目录名同名的情况过滤掉
        DSL.query.bool.must_not = [
            {
                term: {
                    'url.keyword': folder,
                },
            },
        ];
        DSL.script = {
            source: `ctx._source.url = ctx._source.url.replace("${folder}", "${new_folder}")`,
            lang: 'painless',
        };
        return DSL;
    }

    get_delete_folder_DSL() {
        const DSL = this.get_site_DSL();
        const { folderpath } = this.ctx.getParams();
        DSL.query.bool.must.push({
            match_phrase_prefix: {
                url: folderpath,
            },
        });
        // 文件名和目录名同名的情况过滤掉
        DSL.query.bool.must_not = [
            {
                term: {
                    'url.keyword': folderpath,
                },
            },
        ];
        return DSL;
    }

    get_search_DSL() {
        let DSL = {};
        DSL = this.add_query_DSL(DSL);
        DSL = this.add_source_DSL(DSL);
        DSL = this.ctx.service.dsl.add_highlight_DSL(DSL, [
            'title',
            'url',
            'content',
        ]);
        DSL = this.ctx.service.dsl.add_multi_sort_DSL(DSL);
        return DSL;
    }

    add_query_DSL(DSL = {}) {
        DSL.query = {
            bool: {
                should: this.get_should_query(),
                must_not: this.invisible_DSL,
            },
        };
        return DSL;
    }

    add_source_DSL(DSL = {}) {
        DSL._source = {
            includes: ['url', 'title', 'lite_content', 'username', 'site'],
        };
        return DSL;
    }

    get_should_query() {
        const { ctx } = this;
        const q = ctx.query.q;
        if (q) {
            const max_expansions = ctx.service.dsl.max_expansions();
            const should = [
                { term: { 'title.keyword': { value: q, boost: 3 } } },
                { match_phrase: { content: { query: q } } },
                {
                    match_phrase_prefix: {
                        title: { query: q, max_expansions },
                    },
                },
                { match_phrase_prefix: { url: { query: q, max_expansions } } },
            ];

            if (q.includes(' ')) {
                const filtered = ctx.helper.filterSubStr(q, ' ');
                should.push({ match_phrase: { content: { query: filtered } } });
            }
            return should;
        }
    }

    wrap_search_result(result) {
        return {
            hits: result.hits.hits.map(hit => {
                hit._source._score = hit._score;
                hit._source.highlight = hit.highlight;
                hit._source.id = undefined;
                // eslint-disable-next-line no-magic-numbers
                hit._source.content = hit._source.lite_content || '';
                return hit._source;
            }),
            total: result.hits.total,
        };
    }
}

module.exports = PageService;
