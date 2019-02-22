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

const delete_site_rule = {
  sitename: 'string',
  username: 'string',
};

const update_site_visibility_rule = {
  sitename: 'string',
  username: 'string',
  visibility: [ 'public', 'private' ],
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

  async destroy_site() {
    const { ctx, service } = this;
    ctx.ensureAdmin();
    ctx.validate(delete_site_rule, ctx.params);
    const query = { body: this.get_site_DSL() };
    const query_with_location = this.add_location(query);
    const response = await service.es.client
      .deleteByQuery(query_with_location)
      .catch(err => this.error(err));
    ctx.body = response;
  }

  async update_visibility() {
    const { ctx, service } = this;
    ctx.ensureAdmin();
    ctx.validate(update_site_visibility_rule, ctx.params);
    const query = { body: this.get_update_visibility_DSL() };
    const query_with_location = this.add_location(query);
    const response = await service.es.client
      .updateByQuery(query_with_location)
      .catch(err => this.error(err));
    ctx.body = response;
  }

  get_site_DSL() {
    const DSL = {};
    this.add_site_query_DSL(DSL);
    return DSL;
  }

  get_update_visibility_DSL() {
    const DSL = this.get_site_DSL();
    this.add_update_visibility_DSL(DSL);
    return DSL;
  }

  add_update_visibility_DSL(DSL) {
    const { ctx } = this;
    DSL.script = {
      source: `ctx._source.visibility = "${ctx.params.visibility}"`,
      lang: 'painless',
    };
    return DSL;
  }

  add_site_query_DSL(DSL) {
    const { ctx } = this;
    const site = ctx.params.sitename;
    const username = ctx.params.username;
    DSL.query = {
      bool: {
        must: [
          { term: { username } },
          { term: { site } },
        ],
      },
    };
    return DSL;
  }

  get_search_DSL() {
    const DSL = {};
    this.add_query_DSL(DSL);
    this.add_highlight_DSL(DSL, 'title', 'url', 'content');
    this.add_multi_sort_DSL(DSL);
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

      if (q.includes(' ')) {
        const filtered = ctx.helper.filterSubStr(q, ' ');
        should.push({ match_phrase: { content: { query: filtered } } });
      }
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
