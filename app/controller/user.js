'use strict';

const Controller = require('../core/base_controller');

const create_rule = {
  id: 'int',
  username: { type: 'string', min: 4, max: 30 },
};

const update_rule = {
  portrait: { type: 'string', required: false },
  total_projects: { type: 'int', required: false },
  total_fans: { type: 'int', required: false },
};

const upsert_rule = {
  username: { type: 'string', min: 4, max: 30 },
  total_projects: { type: 'int', required: false },
  total_fans: { type: 'int', required: false },
};

class UserController extends Controller {
  async create() {
    this.ctx.validate(create_rule);
    const { id, username, portrait } = this.ctx.request.body;
    const suggestions = this.get_suggestions();
    const data = { username, portrait, suggestions };
    const payload = { id, body: data };
    await super.create(payload);
  }

  async update() {
    this.ctx.validate(update_rule);
    const { portrait, total_projects, total_fans } = this.ctx.request.body;
    const data = { doc: { portrait, total_projects, total_fans } };
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
  }

  async upsert() {
    this.ctx.validate(upsert_rule);
    const { username, portrait, total_projects, total_fans } = this.ctx.request.body;
    const suggestions = this.get_suggestions();
    const data = { username, portrait, total_projects, total_fans, suggestions };
    const payload = { id: this.ctx.params.id, body: data };
    await super.upsert(payload);
  }

  get_suggestions() {
    const { username } = this.ctx.request.body;
    const pinyin = this.ctx.helper.hanzi_to_pinyin(username);
    const suggestions = [ username, pinyin ];
    return suggestions;
  }

  add_location(payload) {
    const data_type = 'user';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    const DSL = {
      query: {
        fuzzy: {
          username: {
            value: this.ctx.query.q,
            fuzziness: 'AUTO',
          },
        },
      },
    };
    return this.sort(DSL);
  }

  wrap_search_result(result) {
    return {
      hits: result.hits.hits.map(hit => {
        hit._source._score = hit._score;
        hit._source.suggestions = undefined;
        return hit._source;
      }),
      total: result.hits.total,
    };
  }
}

module.exports = UserController;
