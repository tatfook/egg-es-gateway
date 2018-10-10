'use strict';

const Controller = require('egg').Controller;

const search_rule = {
  q: 'string',
};

class Base_controllerController extends Controller {
  add_location(payload, data_type) {
    const { index, type } = this.config.elasticsearch.locations[data_type];
    payload.index = index;
    payload.type = type;
    return payload;
  }

  async index() {
    this.ctx.validate(search_rule, this.ctx.query);
    await this.search();
  }

  async rank(field, order = 'desc') {
    const DSL = this.get_rank_DSL(field, order);
    await this.search(DSL);
  }

  async search(DSL = this.get_search_DSL()) {
    const [ from, size ] = this.ctx.helper.paginate(this.ctx.query);
    const query = { from, size, body: DSL };
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

  async create(payload) {
    const payload_with_location = this.add_location(payload);
    await this.service.es.client.create(payload_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.created();
  }

  async update(payload) {
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

  highlight(DSL, ... fields) {
    const tag = this.config.highlight_tag;
    if (fields.length > 0) {
      DSL.highlight = {
        fields: {},
        pre_tags: `<${tag}>`,
        post_tags: `</${tag}>`,
      };
      for (const field of fields) {
        DSL.highlight.fields[field] = {};
      }
    }
    return DSL;
  }

  sort(DSL = {}, field = this.ctx.query.sort, order = this.ctx.query.order) {
    if (field) {
      DSL.sort = [{
        [field]: { order: order || 'desc' },
      }];
    }
    return DSL;
  }

  get_rank_DSL(field, order) {
    const DSL = this.sort({}, field, order);
    return DSL;
  }

  success(action = 'success') {
    this.ctx.body = {};
    this.ctx.body[action] = true;
  }

  created() {
    this.ctx.status = 201;
    this.success('created');
  }

  updated() {
    this.success('updated');
  }

  deleted() {
    this.success('deleted');
  }

  moved() {
    this.success('moved');
  }
}

module.exports = Base_controllerController;
