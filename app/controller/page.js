'use strict';

const Controller = require('./base');

const create_rule = {
  id: 'string',
  url: 'string',
  site: 'string',
  username: 'string',
  title: 'string',
  visibility: [ 'public', 'private' ],
  content: 'string',
  created_at: 'string',
};

const update_rule = {
  url: { type: 'string', required: false, allowEmpty: true },
  title: { type: 'string', required: false, allowEmpty: true },
  visibility: {
    type: 'enum',
    values: [ 'public', 'private' ],
    required: false,
  },
  content: { type: 'string', required: false, allowEmpty: true },
  updated_at: 'string',
};

class PagesController extends Controller {
  async create() {
    const { ctx } = this;
    ctx.validate(create_rule, ctx.params);
    const id = ctx.params.id;
    const body = ctx.params.permit(
      'id', 'url', 'site', 'username', 'title', 'visibility',
      'content', 'created_at', 'updated_at'
    );
    body.updated_at = body.updated_at || body.created_at;
    const payload = { id, body };
    await super.create(payload);
    this.save_suggestions(body.title);
  }

  async update() {
    const { ctx } = this;
    ctx.validate(update_rule, ctx.params);
    const id = ctx.params.id;
    const doc = ctx.params.permit(
      'url', 'title', 'visibility', 'content', 'updated_at'
    );
    const body = { doc };
    const payload = { id, body };
    await super.update(payload);
    if (doc.title) this.save_suggestions(doc.title);
  }

  get_search_DSL() {
    const DSL = {};
    this.add_query_DSL(DSL);
    this.add_highlight_DSL(DSL, 'title', 'url', 'content');
    this.add_multi_sort_DSL(DSL, [ '_score', 'updated_at' ]);
    return DSL;
  }

  add_query_DSL(DSL = {}) {
    DSL.query = { bool: {
      should: this.get_should_query(),
      must_not: this.invisible_DSL,
    } };
    return DSL;
  }

  get_should_query() {
    const { ctx, max_expansions } = this;
    const q = ctx.query.q;
    if (q) {
      const should = [
        { term: { 'title.keyword': { value: q, boost: 3 } } },
        { match_phrase: { content: { query: q } } },
        { match_phrase_prefix: { title: { query: q, max_expansions } } },
        { match_phrase_prefix: { url: { query: q, max_expansions } } },
      ];
      return should;
    }
  }

  wrap_search_result(result) {
    return {
      hits: result.hits.hits.map(hit => {
        hit._source._score = hit._score;
        hit._source.highlight = hit.highlight;
        hit._source.id = undefined;
        return hit._source;
      }),
      total: result.hits.total,
    };
  }

  add_location(payload) {
    const data_type = 'page';
    return super.add_location(payload, data_type);
  }

  async index() {
    if (!this.ctx.params.q) {
      this.ctx.body = {
        total: 0,
        hits: [],
      };
      return;
    }
    await this.search();
  }
}

module.exports = PagesController;
