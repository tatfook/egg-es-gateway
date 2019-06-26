'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');

const suggestions_rule = {
  prefix: 'string',
};

const bulk_rule = {
  body: 'array',
};

const score_field = '_score';
const updated_at_field = 'updated_at';
const DESC_ORDER = 'desc';

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

  async search(DSL = this.get_search_DSL()) {
    const { ctx, service } = this;
    const [ from, size ] = ctx.helper.paginate(ctx.query);
    const query = { from, size, body: DSL };
    const query_with_location = this.add_location(query);
    const result = await service.es.client.search(query_with_location)
      .catch(err => this.error(err));
    ctx.body = this.wrap_search_result(result);
  }

  async show() {
    const { ctx, service } = this;
    ctx.ensureAdmin();
    const query = { id: ctx.params.id };
    const query_with_location = this.add_location(query);
    const res = await service.es.client.get(query_with_location)
      .catch(err => this.error(err));
    ctx.body = res._source;
  }

  async create(payload) {
    const { ctx, service } = this;
    ctx.ensureAdmin();
    const payload_with_location = this.add_location(payload);
    await service.es.client.create(payload_with_location)
      .catch(err => this.error(err));
    this.created();
  }

  async update(payload) {
    const { ctx, service } = this;
    ctx.ensureAdmin();
    const payload_with_location = this.add_location(payload);
    await service.es.client.update(payload_with_location)
      .catch(err => this.error(err));
    this.updated();
  }

  async upsert(payload) {
    const { ctx, service } = this;
    ctx.ensureAdmin();
    const payload_with_location = this.add_location(payload);
    await service.es.client.index(payload_with_location)
      .catch(err => this.error(err));
    this.upserted();
  }

  async destroy() {
    const { ctx, service } = this;
    ctx.ensureAdmin();
    const query = { id: ctx.params.id };
    const query_with_location = this.add_location(query);
    await service.es.client.delete(query_with_location)
      .catch(err => this.error(err));
    this.deleted();
  }

  async bulk() {
    const { ctx, service } = this;
    ctx.validate(bulk_rule);
    ctx.ensureAdmin();
    const params = {
      body: ctx.params.body,
      type: ctx.params.type,
      index: ctx.params.index,
    };
    const response = await service.es.client.bulk(params)
      .catch(err => this.error(err));
    ctx.body = response;
  }

  add_highlight_DSL(DSL, ... fields) {
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
    const { ctx } = this;
    const query_length = ctx.query.q;
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

  // method to add sorting condition into search DSL
  add_sort_DSL(DSL = {}, field = this.ctx.query.sort, order = this.ctx.query.order) {
    if (field) {
      DSL.sort = DSL.sort || [];
      DSL.sort.push({
        [field]: { order: order || DESC_ORDER },
      });
    }
    return DSL;
  }

  preset_sort_DSL(DSL = {}, fields = []) {
    const { sort, order } = this.ctx.params;
    if (_.isEmpty(DSL.sort)) {
      this.add_fields_to_sort(DSL, fields);
      DSL = this.add_sort_DSL(DSL, sort, order);
    }
  }

  add_fields_to_sort(DSL = {}, fields = []) {
    fields.forEach(field => {
      if (Object(field) instanceof String) {
        DSL = this.add_sort_DSL(DSL, field);
      } else if (field instanceof Object) {
        for (const name in field) {
          const order = field[name];
          DSL = this.add_sort_DSL(DSL, field, order);
        }
      }
    });
  }

  set_default_sort_if_empty(DSL, fields) {
    const { ctx } = this;
    if (_.isEmpty(fields)) {
      if (ctx.query.q) fields.push(score_field);
      fields.push(updated_at_field);
    }
  }

  add_multi_sort_DSL(DSL = {}, fields = []) {
    this.preset_sort_DSL(DSL);
    this.set_default_sort_if_empty(DSL, fields);
    this.add_fields_to_sort(DSL, fields);
    return DSL;
  }

  get invisible_DSL() {
    return { term: { visibility: 'private' } };
  }

  // api for ranking such as hot, latest, etc
  async rank(field, order = DESC_ORDER) {
    const DSL = this.get_rank_DSL(field, order);
    await this.search(DSL);
  }

  get_rank_DSL(field, order) {
    const DSL = this.add_sort_DSL({}, field, order);
    return DSL;
  }

  // api for query words suggestion
  async suggest() {
    const { ctx, service } = this;
    ctx.validate(suggestions_rule, ctx.query);
    const query = {
      body: {
        suggestions: {
          prefix: ctx.query.prefix,
          completion: {
            field: 'suggestions',
            size: Number(ctx.query.size) || 5,
          },
        },
      },
      index: 'suggestions',
    };
    const result = await service.es.client.suggest(query)
      .catch(err => this.error(err));
    ctx.body = this.wrap_suggestions(result);
  }

  async save_suggestions(...keywords) {
    const { ctx, service } = this;
    const tasks = [];
    const already_exist = {};
    for (const keyword of keywords) {
      if (!keyword || already_exist[keyword]) { continue; }
      already_exist[keyword] = true;
      const pinyin = ctx.helper.hanzi_to_pinyin(keyword);
      tasks.push(service.es.client.create({
        index: 'suggestions',
        type: 'suggestions',
        id: ctx.helper.to_sha1(keyword),
        body: {
          keyword,
          pinyin,
          suggestions: [ keyword, pinyin ],
        },
      }).catch(err => {
        if (err.statusCode !== 409) {
          ctx.logger.error(err);
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

  success(action = 'success') {
    const { ctx } = this;
    ctx.body = {};
    ctx.body[action] = true;
  }

  created() {
    const { ctx } = this;
    ctx.status = 201;
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

  error(err) {
    const { ctx } = this;
    ctx.logger.error(err);
    ctx.throw(err.statusCode);
  }
}

module.exports = baseController;
