'use strict';

const Controller = require('../core/base_controller');

const search_rule = {
  q: 'string',
};

const create_rule = {
  username: { type: 'string', min: 4, max: 30 },
  portrait: 'url',
};

const update_rule = {
  total_projects: { type: 'int', required: false },
  total_fans: { type: 'int', required: false },
};

class UserController extends Controller {
  async index() {
    this.ctx.validate(search_rule, this.ctx.query);
    const [ from, size ] = this.ctx.helper.paginate(this.ctx.query);
    const query = { from, size, body: this.get_search_DSL() };
    const query_with_location = this.add_location(query);
    const result = await this.service.es.client.search(query_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.ctx.body = this.wrap_search_result(result);
  }

  async show() {
    const query = this.ctx.params;
    const query_with_location = this.add_location(query);
    const res = await this.service.es.client.get(query_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.ctx.body = res._source;
  }

  async create() {
    this.ctx.validate(create_rule);
    const { username, portrait } = this.ctx.request.body;
    const pinyin = this.ctx.helper.hanzi_to_pinyin(username);
    const suggestions = [ username, pinyin ];
    const data = { username, portrait, suggestions };
    const payload = { id: username, body: data };
    const payload_with_location = this.add_location(payload);

    await this.service.es.client.create(payload_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.created();
  }

  async update() {
    this.ctx.validate(update_rule);
    const { total_projects, total_fans } = this.ctx.request.body;
    const data = { doc: { total_projects, total_fans } };
    const payload = { id: this.ctx.params.id, body: data };
    const payload_with_location = this.add_location(payload);

    await this.service.es.client.update(payload_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.updated();
  }

  async destroy() {
    const query = this.ctx.params;
    const query_with_location = this.add_location(query);
    await this.service.es.client.delete(query_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.deleted();
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
    return result.hits.hits.map(hit => {
      hit._source._score = hit._score;
      hit._source.suggestions = undefined;
      return hit._source;
    });
  }
}

module.exports = UserController;
