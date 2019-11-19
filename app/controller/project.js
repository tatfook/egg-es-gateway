'use strict';

const Controller = require('./base');

const create_rule = {
  id: 'int',
  name: 'string',
  username: 'string',
  visibility: [ 'public', 'private' ],
  type: 'string',
  recruiting: 'bool',
  description: { type: 'string', required: false, allowEmpty: true },
  tags: { type: 'array', itemType: 'string', required: false },
  sys_tags: { type: 'array', itemType: 'string', required: false },
  created_at: 'string',
};

const update_rule = {
  name: { type: 'string', required: false },
  visibility: { type: 'enum', values: [ 'public', 'private' ], required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  type: { type: 'string', required: false },
  recruiting: { type: 'boolean', required: false },
  recommended: { type: 'boolean', required: false },
  tags: { type: 'array', itemType: 'string', required: false },
  sys_tags: { type: 'array', itemType: 'string', required: false },
  point: { type: 'number', required: false },
  total_like: { type: 'int', required: false },
  total_view: { type: 'int', required: false },
  total_mark: { type: 'int', required: false },
  total_comment: { type: 'int', required: false },
  recent_like: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
  updated_at: 'string',
};

const upsert_rule = {
  name: 'string',
  username: 'string',
  visibility: [ 'public', 'private' ],
  description: { type: 'string', required: false, allowEmpty: true },
  type: 'string',
  recruiting: 'bool',
  recommended: { type: 'bool', required: false },
  tags: { type: 'array', itemType: 'string', required: false },
  sys_tags: { type: 'array', itemType: 'string', required: false },
  point: { type: 'number', required: false },
  total_like: { type: 'int', required: false },
  total_view: { type: 'int', required: false },
  total_mark: { type: 'int', required: false },
  total_comment: { type: 'int', required: false },
  recent_like: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
  created_at: 'string',
  updated_at: { type: 'string', required: false },
  world_tag_name: { type: 'string', required: false },
};

class ProjectController extends Controller {
  async hots() {
    await this.rank('recent_view');
  }

  async likes() {
    await this.rank('recent_like');
  }

  async create() {
    const { ctx } = this;
    ctx.validate(create_rule, ctx.params);
    const id = ctx.params.id;
    const data = ctx.params.permit(
      'name', 'cover', 'username', 'user_portrait',
      'description', 'visibility', 'type', 'recruiting',
      'created_at', 'updated_at', 'id', 'tags',
      'sys_tags', 'video'
    );
    data.updated_at = data.created_at;
    const payload = { id, body: data };
    await super.create(payload);
    this.save_suggestions(data.name);
  }

  async update() {
    const { ctx } = this;
    ctx.validate(update_rule, ctx.params);
    const id = ctx.params.id;
    const doc = ctx.params.permit(
      'name', 'cover', 'user_portrait', 'visibility',
      'type', 'recruiting', 'tags', 'total_like',
      'total_view', 'total_mark', 'total_comment',
      'recent_like', 'recent_view', 'updated_at',
      'description', 'video', 'recommended', 'sys_tags',
      'point'
    );
    const data = { doc };
    const payload = { id, body: data };
    await super.update(payload);
    if (doc.name) this.save_suggestions(doc.name);
  }

  async upsert() {
    const { ctx } = this;
    ctx.validate(upsert_rule, ctx.params);
    const id = ctx.params.id;
    const data = ctx.params.permit(
      'name', 'cover', 'username', 'user_portrait', 'description',
      'visibility', 'type', 'recruiting', 'tags', 'total_like',
      'total_view', 'total_mark', 'total_comment', 'recent_like',
      'recent_view', 'video', 'id', 'recommended', 'created_at',
      'updated_at', 'sys_tags', 'point', 'world_tag_name'
    );
    data.updated_at = data.updated_at || data.created_at;
    const payload = { id, body: data };
    await super.upsert(payload);
    this.save_suggestions(data.name, data.world_tag_name);
  }

  add_location(payload) {
    const data_type = 'project';
    return super.add_location(payload, data_type);
  }

  get_rank_DSL(field, order) {
    const DSL = this.add_sort_DSL({}, field, order);
    DSL.query = {
      bool: { must_not: this.invisible_DSL },
    };
    return DSL;
  }

  get_search_DSL() {
    const DSL = {};
    this.add_query_DSL(DSL);
    this.add_highlight_DSL(DSL, 'id', 'name', 'username', 'world_tag_name');
    this.add_multi_sort_DSL(DSL);
    console.dir(DSL);
    return DSL;
  }

  add_query_DSL(DSL) {
    DSL.query = { bool: {
      must: this.get_must_query(),
      must_not: this.invisible_DSL,
    } };
    return DSL;
  }

  get_default_should_query() {
    let should;
    const { q } = this.ctx.params;
    if (!q) {
      should = [
        { exists: { field: 'cover' } },
        { exists: { field: 'video' } },
      ];
    }
    return should;
  }

  get_should_bool_query() {
    const { ctx, max_expansions } = this;
    const q = ctx.query.q;
    let should;
    if (q) {
      should = [];
      if (Number(q)) {
        should.push({ term: { id: { value: q, boost: 5 } } });
      }
      should.push(
        { term: { 'name.keyword': { value: q, boost: 3 } } },
        { term: { 'world_tag_name.keyword': { value: q, boost: 3 } } },
        { prefix: { username: { value: q, boost: 2 } } },
        { match_phrase_prefix: {
          name: { query: q, max_expansions, boost: 2 },
        } },
        { match_phrase_prefix: {
          world_tag_name: { query: q, max_expansions, boost: 2 },
        } },
        { wildcard: { name: `*${q}*` } },
        { wildcard: { world_tag_name: `*${q}*` } }
      );

      if (q.includes(' ')) {
        const filtered = ctx.helper.filterSubStr(q, ' ');
        should.push(
          { term: { 'name.keyword': { value: filtered, boost: 3 } } },
          { term: { 'world_tag_name.keyword': { value: filtered, boost: 3 } } },
          { match_phrase_prefix: {
            name: { query: filtered, max_expansions, boost: 2 },
          } },
          { match_phrase_prefix: {
            world_tag_name: { query: filtered, max_expansions, boost: 2 },
          } }
        );
      }
    } else {
      should = this.get_default_should_query();
    }
    return should;
  }

  get_must_query() {
    const must = [];
    const should = this.get_should_bool_query();
    const { type, tags, recruiting, recommended } = this.ctx.query;
    if (should) must.push({ bool: { should } });
    if (type) must.push({ term: { type } });
    if (tags) must.push({ term: { tags } });
    if (recruiting) must.push({ term: { recruiting: true } });
    if (recommended) must.push({ term: { recommended: true } });
    this.add_sys_tags_query(must);
    return must;
  }

  add_sys_tags_query(must) {
    const { ctx } = this;
    const { sys_tags } = this.ctx.query;
    if (sys_tags) {
      try {
        const parsed = ctx.helper.parseQuery(sys_tags);
        for (const sys_tag of parsed) {
          must.push({ term: { sys_tags: sys_tag } });
        }
      } catch (e) {
        ctx.throw(400, 'invalid sys_tags');
      }
    }
  }

  wrap_search_result(result) {
    return {
      hits: result.hits.hits.map(hit => {
        hit._source._score = hit._score;
        hit._source.id = Number(hit._source.id);
        hit._source.highlight = hit.highlight;
        hit._source.suggestions = undefined;
        return hit._source;
      }),
      total: result.hits.total,
    };
  }
}

module.exports = ProjectController;
