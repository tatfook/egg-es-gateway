'use strict';

const Controller = require('./base');

const create_rule = {
  id: 'int',
  title: 'string',
  prize: { type: 'int', required: false },
  total_lessons: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  age_min: { type: 'int', required: false },
  age_max: { type: 'int', required: false },
  created_at: 'string',
  updated_at: { type: 'string', required: false },
};

const update_rule = {
  title: { type: 'string', required: false },
  prize: { type: 'int', required: false },
  total_lessons: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  recent_view: { type: 'int', required: false },
  age_min: { type: 'int', required: false },
  age_max: { type: 'int', required: false },
  updated_at: 'string',
};

const upsert_rule = {
  title: 'string',
  prize: { type: 'int', required: false },
  total_lessons: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  age_min: { type: 'int', required: false },
  age_max: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
  created_at: 'string',
  updated_at: { type: 'string', required: false },
};

class PackageController extends Controller {
  async hots() {
    await this.rank('recent_view');
  }

  async create() {
    const { ctx } = this;
    ctx.validate(create_rule, ctx.params);
    const id = ctx.params.id;
    const data = ctx.params.permit(
      'id', 'title', 'cover', 'total_lessons', 'prize',
      'description', 'age_min', 'age_max', 'created_at'
    );
    data.updated_at = data.updated_at || data.created_at;
    const payload = { id, body: data };
    await super.create(payload);
    this.save_suggestions(data.title);
  }

  async update() {
    const { ctx } = this;
    ctx.validate(update_rule, ctx.params);
    const id = ctx.params.id;
    const doc = ctx.params.permit(
      'title', 'cover', 'total_lessons', 'prize',
      'description', 'recent_view', 'age_min', 'age_max',
      'updated_at'
    );
    const data = { doc };
    const payload = { id, body: data };
    await super.update(payload);
    if (doc.title) { this.save_suggestions(doc.title); }
  }

  async upsert() {
    const { ctx } = this;
    ctx.validate(upsert_rule, ctx.params);
    const id = ctx.params.id;
    const data = ctx.params.permit(
      'title', 'cover', 'total_lessons', 'description', 'prize',
      'age_min', 'age_max', 'recent_view', 'created_at'
    );
    data.updated_at = data.updated_at || data.created_at;
    const payload = { id, body: data };
    await super.upsert(payload);
    this.save_suggestions(data.title);
  }

  add_location(payload) {
    const data_type = 'package';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    const DSL = {};
    this.add_query_DSL(DSL);
    this.add_highlight_DSL(DSL, 'title', 'description');
    this.add_multi_sort_DSL(DSL, [ '_score', 'updated_at' ]);
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
        { term: { 'title.keyword': { value: this.ctx.query.q, boost: 3 } } },
        { prefix: { username: { value: this.ctx.query.q, boost: 2 } } },
        { multi_match: {
          fields: [ 'title', 'description' ], query: this.ctx.query.q,
          type: 'phrase_prefix', max_expansions,
        } },
        { wildcard: { title: `*${this.ctx.query.q}*` } },
      ];
    }
    return should;
  }

  wrap_search_result(result) {
    return {
      hits: result.hits.hits.map(hit => {
        hit._source.id = Number(hit._id);
        hit._source._score = hit._score;
        hit._source.highlight = hit.highlight;
        hit._source.suggestions = undefined;
        return hit._source;
      }),
      total: result.hits.total,
    };
  }
}

module.exports = PackageController;
