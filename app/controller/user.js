'use strict';

const Controller = require('../core/base');

const create_rule = {
  id: 'int',
  username: { type: 'string', min: 4, max: 30 },
  created_time: 'string',
};

const update_rule = {
  total_projects: { type: 'int', required: false },
  total_fans: { type: 'int', required: false },
  total_follows: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  updated_time: 'string',
};

const upsert_rule = {
  username: { type: 'string', min: 4, max: 30 },
  total_projects: { type: 'int', required: false },
  total_fans: { type: 'int', required: false },
  total_follows: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  created_time: 'string',
  updated_time: { type: 'string', required: false },
};

class UserController extends Controller {
  async create() {
    this.ctx.validate(create_rule);
    const { id, username, nickname, portrait, created_time } = this.ctx.request.body;
    const data = { username, portrait, created_time };
    data.updated_time = created_time;
    data.nickname = nickname || username;
    const payload = { id, body: data };
    await super.create(payload);
    this.save_suggestions(username, nickname);
  }

  async update() {
    this.ctx.validate(update_rule);
    const {
      nickname, portrait, total_projects, total_fans,
      description, total_follows, updated_time,
    } = this.ctx.request.body;
    const data = { doc: {
      nickname, portrait, total_projects, total_fans,
      description, total_follows, updated_time,
    } };
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
    if (nickname) { this.save_suggestions(nickname); }
  }

  async upsert() {
    this.ctx.validate(upsert_rule);
    const {
      username, nickname, portrait, total_projects, total_fans,
      total_follows, description, created_time, updated_time,
    } = this.ctx.request.body;
    const data = {
      username, portrait, total_projects, total_fans,
      total_follows, description, created_time,
    };
    data.updated_time = updated_time || created_time;
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
    return this.sort_many(DSL, [ '_score', 'updated_time' ]);
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
