'use strict';

const Controller = require('./base');

const create_rule = {
    id: 'int',
    username: { type: 'string', min: 4, max: 30 },
    sitename: 'string',
    cover: { type: 'string', required: false, allowEmpty: true },
    display_name: { type: 'string', required: false, allowEmpty: true },
    description: { type: 'string', required: false, allowEmpty: true },
    created_at: 'string',
};

const update_rule = {
    sitename: { type: 'string', required: false },
    cover: { type: 'string', required: false, allowEmpty: true },
    display_name: { type: 'string', required: false, allowEmpty: true },
    description: { type: 'string', required: false, allowEmpty: true },
    updated_at: 'string',
};

const upsert_rule = {
    username: { type: 'string', min: 4, max: 30 },
    sitename: 'string',
    cover: { type: 'string', required: false, allowEmpty: true },
    display_name: { type: 'string', required: false, allowEmpty: true },
    description: { type: 'string', required: false, allowEmpty: true },
    created_at: 'string',
    updated_at: { type: 'string', required: false },
};

class SiteController extends Controller {
    async create() {
        this.ctx.validate(create_rule);
        if (!this.ctx.request.body.display_name) {
            this.ctx.request.body.display_name = this.ctx.request.body.sitename;
        }
        const {
            id,
            username,
            sitename,
            cover,
            display_name,
            description,
            created_at,
        } = this.ctx.request.body;
        const data = {
            username,
            sitename,
            cover,
            display_name,
            description,
            created_at,
        };
        data.updated_at = created_at;
        const payload = { id, body: data };
        await super.create(payload);
        this.save_suggestions(sitename, display_name);
    }

    async update() {
        this.ctx.validate(update_rule);
        const { cover, display_name, description } = this.ctx.request.body;
        const data = { doc: { cover, display_name, description } };
        const payload = { id: this.ctx.params.id, body: data };
        await super.update(payload);
        if (display_name) {
            this.save_suggestions(display_name);
        }
    }

    async upsert() {
        this.ctx.validate(upsert_rule);
        if (!this.ctx.request.body.display_name) {
            this.ctx.request.body.display_name = this.ctx.request.body.sitename;
        }
        const {
            username,
            sitename,
            cover,
            display_name,
            description,
            created_at,
            updated_at,
        } = this.ctx.request.body;
        const data = {
            username,
            sitename,
            cover,
            display_name,
            description,
            created_at,
        };
        data.updated_at = updated_at || created_at;
        const payload = { id: this.ctx.params.id, body: data };
        await super.upsert(payload);
        this.save_suggestions(sitename, display_name);
    }

    add_location(payload) {
        const data_type = 'site';
        return super.add_location(payload, data_type);
    }

    get_search_DSL() {
        const DSL = { query: {} };
        if (this.ctx.query.q) {
            DSL.query.multi_match = {
                query: this.ctx.query.q,
                fields: [ 'sitename', 'display_name' ],
            };
        }
        this.add_highlight_DSL(DSL, 'sitename', 'display_name');
        this.add_sort_DSL(DSL);
        return this.add_sort_DSL(DSL);
    }

    wrap_search_result(result) {
        return {
            hits: result.hits.hits.map(hit => {
                hit._source._score = hit._score;
                hit._source.highlight = hit.highlight;
                hit._source.suggestions = undefined;
                return hit._source;
            }),
            total: result.hits.total,
        };
    }
}

module.exports = SiteController;
