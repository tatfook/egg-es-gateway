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
    this.ctx.validate(create_rule);
    const { id, username, nickname, portrait, created_at } = this.ctx.request.body;
    const data = { username, portrait, created_at };
    data.updated_at = created_at;
    data.nickname = nickname || username;
    const payload = { id, body: data };
    await super.create(payload);
    this.save_suggestions(username, nickname);
  }

  async update() {
    this.ctx.validate(update_rule);
    const {
      nickname, portrait, total_projects, total_fans,
      description, total_follows, updated_at,
    } = this.ctx.request.body;
    const data = { doc: {
      nickname, portrait, total_projects, total_fans,
      description, total_follows, updated_at,
    } };
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
    if (nickname) { this.save_suggestions(nickname); }
  }

  async upsert() {
    this.ctx.validate(upsert_rule);
    const {
      username, nickname, portrait, total_projects, total_fans,
      total_follows, description, created_at, updated_at,
    } = this.ctx.request.body;
    const data = {
      username, portrait, total_projects, total_fans,
      total_follows, description, created_at,
    };
    data.updated_at = updated_at || created_at;
    data.nickname = nickname || username;
    const payload = { id: this.ctx.params.id, body: data };
    await super.upsert(payload);
    this.save_suggestions(username, nickname);
  }

  add_location(payload) {
    const data_type = 'user';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    const DSL = {
      query: {
        bool: {},
      },
    };
    if (this.ctx.query.q) {
      const max_expansions = this.max_expansions;
      DSL.query.bool.should = [
        { term: { 'username.keyword': { value: this.ctx.query.q, boost: 3 } } },
        { prefix: { username: { value: this.ctx.query.q, boost: 2 } } },
        { multi_match: {
          fields: [ 'username', 'nickname' ], query: this.ctx.query.q,
          type: 'phrase_prefix', max_expansions,
        } },
        { wildcard: { username: `*${this.ctx.query.q}*` } },
        { wildcard: { nickname: `*${this.ctx.query.q}*` } },
      ];
    }
    return this.add_multi_sort_DSL(DSL, [ '_score', 'updated_at' ]);
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
