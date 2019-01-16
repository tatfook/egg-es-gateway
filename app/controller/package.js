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
    this.ctx.validate(create_rule);
    const {
      id, title, cover, total_lessons,
      prize, description, age_min, age_max,
      created_at, updated_at,
    } = this.ctx.request.body;
    const data = {
      title, cover, total_lessons, prize,
      description, age_min, age_max, created_at,
    };
    data.updated_at = updated_at || created_at;
    const payload = { id, body: data };
    await super.create(payload);
    this.save_suggestions(title);
  }

  async update() {
    this.ctx.validate(update_rule);
    const {
      title, cover, total_lessons, prize,
      description, recent_view, age_min, age_max,
      updated_at,
    } = this.ctx.request.body;
    const data = { doc: {
      title, cover, total_lessons, prize,
      description, recent_view, age_min, age_max,
      updated_at,
    } };
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
    if (title) { this.save_suggestions(title); }
  }

  async upsert() {
    this.ctx.validate(upsert_rule);
    const {
      title, cover, total_lessons, prize,
      description, age_min, age_max,
      recent_view, created_at, updated_at,
    } = this.ctx.request.body;
    const data = {
      title, cover, total_lessons, description, prize,
      age_min, age_max, recent_view, created_at,
    };
    data.updated_at = updated_at || created_at;
    const payload = { id: this.ctx.params.id, body: data };
    await super.upsert(payload);
    this.save_suggestions(title);
  }

  add_location(payload) {
    const data_type = 'package';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    const DSL = {
      query: {
        bool: {
        },
      },
    };
    if (this.ctx.query.q) {
      const max_expansions = this.max_expansions;
      DSL.query.bool.should = [
        { term: { 'title.keyword': { value: this.ctx.query.q, boost: 3 } } },
        { prefix: { username: { value: this.ctx.query.q, boost: 2 } } },
        { multi_match: {
          fields: [ 'title', 'description' ], query: this.ctx.query.q,
          type: 'phrase_prefix', max_expansions,
        } },
        { wildcard: { title: `*${this.ctx.query.q}*` } },
      ];
    }
    this.add_highlight_DSL(DSL, 'title', 'description');
    return this.add_multi_sort_DSL(DSL, [ '_score', 'updated_at' ]);
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
