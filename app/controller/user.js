'use strict';

const Controller = require('../core/base_controller');

const create_rule = {
  id: 'int',
  username: { type: 'string', min: 4, max: 30 },
  portrait: 'url',
};

const update_rule = {
  portrait: { type: 'url', required: false },
  total_projects: { type: 'int', required: false },
  total_fans: { type: 'int', required: false },
};

class UserController extends Controller {
  async create() {
    this.ctx.validate(create_rule);
    const { id, username, portrait } = this.ctx.request.body;
    const pinyin = this.ctx.helper.hanzi_to_pinyin(username);
    const suggestions = [ username, pinyin ];
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

  add_location(payload) {
    const data_type = 'user';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    return {
      query: {
        fuzzy: {
          username: {
            value: this.ctx.query.q,
            fuzziness: 'AUTO',
          },
        },
      },
    };
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
