'use strict';

const Controller = require('egg').Controller;

const suggestions_rule = {
  prefix: 'string',
};

class baseController extends Controller {
  add_location(payload, data_type, index_only) {
    const { index, type } = this.config.elasticsearch.locations[data_type];
    payload.index = index;
    if (!index_only) { payload.type = type; }
    return payload;
  }

  async index() {
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

  async suggest() {
    this.ctx.validate(suggestions_rule, this.ctx.query);
    const query = {
      body: {
        suggestions: {
          prefix: this.ctx.query.prefix,
          completion: {
            field: 'suggestions',
            size: Number(this.ctx.query.size) || 5,
          },
        },
      },
      index: 'suggestions',
    };
    const result = await this.service.es.client.suggest(query)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.ctx.body = this.wrap_suggestions(result);
  }

  async save_suggestions(...keywords) {
    const tasks = [];
    const already_exist = {};
    for (const keyword of keywords) {
      if (!keyword || already_exist[keyword]) { continue; }
      already_exist[keyword] = true;
      const pinyin = this.ctx.helper.hanzi_to_pinyin(keyword);
      tasks.push(this.service.es.client.create({
        index: 'suggestions',
        type: 'suggestions',
        id: this.ctx.helper.to_sha1(keyword),
        body: {
          keyword,
          pinyin,
          suggestions: [ keyword, pinyin ],
        },
      }).catch(err => {
        if (err.statusCode !== 409) {
          this.ctx.logger.error(err);
        }
      }));
    }
    await Promise.all(tasks).catch();
  }

  wrap_suggestions(result) {
    return result.suggestions[0].options.map(suggestion => {
      suggestion._source.hit = suggestion.text;
      return suggestion._source;
    });
  }

  async show() {
    this.ctx.ensureAdmin();
    const query = { id: this.ctx.params.id };
    const query_with_location = this.add_location(query);
    const res = await this.service.es.client.get(query_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.ctx.body = res._source;
  }

  async create(payload) {
    this.ctx.ensureAdmin();
    const payload_with_location = this.add_location(payload);
    await this.service.es.client.create(payload_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.created();
  }

  async update(payload) {
    this.ctx.ensureAdmin();
    const payload_with_location = this.add_location(payload);
    await this.service.es.client.update(payload_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.updated();
  }

  async upsert(payload) {
    this.ctx.ensureAdmin();
    const payload_with_location = this.add_location(payload);
    await this.service.es.client.index(payload_with_location)
      .catch(err => {
        this.ctx.logger.error(err);
        this.ctx.throw(err.statusCode);
      });
    this.upserted();
  }

  async destroy() {
    this.ctx.ensureAdmin();
    const query = { id: this.ctx.params.id };
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

  get max_expansions() {
    const query_length = this.ctx.query.q;
    let max_expansions;
    switch (true) {
      case query_length > 36:
        max_expansions = 10;
        break;
      case query_length > 12:
        max_expansions = Math.floor(query_length / 4) + 1;
        break;
      case query_length > 3:
        max_expansions = Math.floor(query_length / 3);
        break;
      default:
        max_expansions = 1;
        break;
    }
    return max_expansions;
  }

  sort(DSL = {}, field = this.ctx.query.sort, order = this.ctx.query.order) {
    if (field) {
      DSL.sort = DSL.sort || [];
      DSL.sort.push({
        [field]: { order: order || 'desc' },
      });
    }
    return DSL;
  }

  sort_many(DSL = {}, fields) {
    if (!DSL.sort) {
      DSL = this.sort(
        DSL,
        this.ctx.query.sort,
        this.ctx.query.order
      );
    }
    for (const field of fields) {
      if (Object(field) instanceof String) {
        DSL = this.sort(DSL, field);
      } else if (field instanceof Object) {
        for (const name in field) {
          const order = field[name];
          DSL = this.sort(DSL, field, order);
        }
      }
    }
    return DSL;
  }

  get invisible_DSL() {
    return { term: { visibility: 'private' } };
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

  upserted() {
    this.success('upserted');
  }


  deleted() {
    this.success('deleted');
  }

  moved() {
    this.success('moved');
  }
}

module.exports = baseController;
