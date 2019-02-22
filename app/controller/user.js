'use strict';

const Controller = require('./base');

const create_rule = {
  id: 'int',
  username: { type: 'string', min: 4, max: 30 },
  created_at: 'string',
};

const update_rule = {
  total_projects: { type: 'int', required: false },
  total_fans: { type: 'int', required: false },
  total_follows: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  updated_at: 'string',
};

const upsert_rule = {
  username: { type: 'string', min: 4, max: 30 },
  total_projects: { type: 'int', required: false },
  total_fans: { type: 'int', required: false },
  total_follows: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  created_at: 'string',
  updated_at: { type: 'string', required: false },
};

class UserController extends Controller {
  async create() {
    const { ctx } = this;
    ctx.validate(create_rule, ctx.params);
    const id = ctx.params.id;
    const data = ctx.params.permit(
      'id', 'username', 'portrait', 'nickname',
      'created_at', 'updated_at'
    );
    data.updated_at = data.updated_at || data.created_at;
    data.nickname = data.nickname || data.username;
    const payload = { id, body: data };
    await super.create(payload);
    this.save_suggestions(data.username, data.nickname);
  }

  async update() {
    const { ctx } = this;
    ctx.validate(update_rule, ctx.params);
    const id = ctx.params.id;
    const doc = ctx.params.permit(
      'nickname', 'portrait', 'total_projects', 'total_fans',
      'description', 'total_follows', 'updated_at'
    );
    const data = { doc };
    const payload = { id, body: data };
    await super.update(payload);
    if (doc.nickname) { this.save_suggestions(doc.nickname); }
  }

  async upsert() {
    const { ctx } = this;
    ctx.validate(upsert_rule, ctx.params);
    const id = ctx.params.id;
    const data = ctx.params.permit(
      'id', 'username', 'portrait', 'total_projects', 'total_fans',
      'total_follows', 'description', 'created_at', 'updated_at'
    );
    data.updated_at = data.updated_at || data.created_at;
    data.nickname = data.nickname || data.username;
    const payload = { id, body: data };
    await super.upsert(payload);
    this.save_suggestions(data.username, data.nickname);
  }

  add_location(payload) {
    const data_type = 'user';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    const DSL = {};
    this.add_query_DSL(DSL);
    this.add_highlight_DSL(DSL, 'username', 'nickname');
    this.add_multi_sort_DSL(DSL);
    return DSL;
  }

  add_query_DSL(DSL) {
    DSL.query = { bool: {
      should: this.get_should_query(),
    } };
    return DSL;
  }

  get_should_query() {
    const { ctx, max_expansions } = this;
    const q = ctx.query.q;
    let should;
    if (q) {
      should = [
        { term: { 'username.keyword': { value: q, boost: 3 } } },
        { prefix: { username: { value: q, boost: 2 } } },
        { multi_match: {
          fields: [ 'username', 'nickname' ], query: q,
          type: 'phrase_prefix', max_expansions,
        } },
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

module.exports = UserController;
