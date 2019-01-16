'use strict';

const Controller = require('./base');

const create_rule = {
  id: 'int',
  name: 'string',
  username: 'string',
  visibility: [ 'public', 'private' ],
  type: 'string',
  recruiting: 'bool',
  description: { type: 'string', required: false, allowEmpty: true },
  tags: { type: 'array', itemType: 'string', required: false },
  created_at: 'string',
};

const update_rule = {
  name: { type: 'string', required: false },
  visibility: { type: 'enum', values: [ 'public', 'private' ], required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  type: { type: 'string', required: false },
  recruiting: { type: 'boolean', required: false },
  recommended: { type: 'boolean', required: false },
  tags: { type: 'array', itemType: 'string', required: false },
  total_like: { type: 'int', required: false },
  total_view: { type: 'int', required: false },
  total_mark: { type: 'int', required: false },
  total_comment: { type: 'int', required: false },
  recent_like: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
  updated_at: 'string',
};

const upsert_rule = {
  name: 'string',
  username: 'string',
  visibility: [ 'public', 'private' ],
  description: { type: 'string', required: false, allowEmpty: true },
  type: 'string',
  recruiting: 'bool',
  recommended: 'bool',
  tags: { type: 'array', itemType: 'string', required: false },
  total_like: { type: 'int', required: false },
  total_view: { type: 'int', required: false },
  total_mark: { type: 'int', required: false },
  total_comment: { type: 'int', required: false },
  recent_like: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
  created_at: 'string',
  updated_at: { type: 'string', required: false },
};

class ProjectController extends Controller {
  async hots() {
    await this.rank('recent_view');
  }

  async likes() {
    await this.rank('recent_like');
  }

  async create() {
    this.ctx.validate(create_rule);
    const {
      id, name, cover, username, user_portrait, description,
      visibility, type, recruiting, created_at, tags, video,
    } = this.ctx.request.body;
    const data = {
      name, cover, username, user_portrait, description,
      visibility, type, recruiting, created_at, tags,
      video, id,
    };
    data.updated_at = created_at;
    const payload = { id, body: data };
    await super.create(payload);
    this.save_suggestions(name);
  }

  async update() {
    this.ctx.validate(update_rule);
    const {
      name, cover, user_portrait, visibility,
      type, recruiting, tags, total_like,
      total_view, total_mark, total_comment,
      recent_like, recent_view, updated_at,
      description, video, recommended,
    } = this.ctx.request.body;
    const data = { doc: {
      name, cover, user_portrait, visibility,
      type, recruiting, tags, total_like,
      total_view, total_mark, total_comment,
      recent_like, recent_view, updated_at,
      description, video, recommended,
    } };
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
    if (name) this.save_suggestions(name);
  }

  async upsert() {
    this.ctx.validate(upsert_rule);
    const id = this.ctx.params.id;
    const {
      name, cover, username, user_portrait, description,
      visibility, type, recruiting, created_at,
      updated_at, tags, total_like, total_view,
      total_mark, total_comment, recent_like, recent_view,
      video, recommended,
    } = this.ctx.request.body;
    const data = {
      name, cover, username, user_portrait, description,
      visibility, type, recruiting, created_at, tags,
      total_like, total_view, total_mark, total_comment,
      recent_like, recent_view, video, id, recommended,
    };
    data.updated_at = updated_at || created_at;
    const payload = { id, body: data };
    await super.upsert(payload);
    this.save_suggestions(name);
  }

  add_location(payload) {
    const data_type = 'project';
    return super.add_location(payload, data_type);
  }

  get_rank_DSL(field, order) {
    const DSL = this.add_sort_DSL({}, field, order);
    DSL.query = {
      bool: { must_not: this.invisible_DSL },
    };
    return DSL;
  }

  get_search_DSL() {
    const DSL = {
      query: {
        bool: {
          must: [],
          must_not: this.invisible_DSL,
        },
      },
    };
    if (this.ctx.query.q) {
      const max_expansions = this.max_expansions;
      const match_condition = {
        bool: {
          should: [
            { term: { 'name.keyword': { value: this.ctx.query.q, boost: 3 } } },
            { prefix: { username: { value: this.ctx.query.q, boost: 2 } } },
            { match_phrase_prefix: {
              name: { query: this.ctx.query.q, max_expansions, boost: 2 },
            } },
            { wildcard: { name: `*${this.ctx.query.q}*` } },
          ],
        },
      };
      if (Number(this.ctx.query.q)) {
        const id_query = { term: { id: { value: this.ctx.query.q, boost: 5 } } };
        match_condition.bool.should = [ id_query ].concat(match_condition.bool.should);
      }
      DSL.query.bool.must.push(match_condition);
    }
    if (this.ctx.query.type) {
      DSL.query.bool.must.push({ term: { type: this.ctx.query.type } });
    }
    if (this.ctx.query.tags) {
      DSL.query.bool.must.push({ term: { tags: this.ctx.query.tags } });
    }
    if (this.ctx.query.recruiting) {
      DSL.query.bool.must.push({ term: { recruiting: true } });
    }
    if (this.ctx.query.recommended) {
      DSL.query.bool.must.push({ term: { recommended: true } });
    }
    this.add_highlight_DSL(DSL, 'id', 'name', 'username');
    this.add_multi_sort_DSL(DSL, [ '_score', 'updated_at' ]);
    return DSL;
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

module.exports = ProjectController;
