'use strict';

const Controller = require('../core/base_controller');

const create_rule = {
  id: 'int',
  name: 'string',
  username: 'string',
  visibility: [ 'public', 'private' ],
  type: 'string',
  recruiting: 'bool',
  created_time: 'string',
  tags: { type: 'array', itemType: 'string', required: false },
};

const update_rule = {
  name: { type: 'string', required: false },
  visibility: { type: 'enum', values: [ 'public', 'private' ], required: false },
  type: { type: 'string', required: false },
  recruiting: { type: 'boolean', required: false },
  tags: { type: 'array', itemType: 'string', required: false },
  updated_time: 'string',
  total_like: { type: 'int', required: false },
  total_view: { type: 'int', required: false },
  total_mark: { type: 'int', required: false },
  total_comment: { type: 'int', required: false },
  recent_like: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
};

const upsert_rule = {
  name: 'string',
  username: 'string',
  visibility: [ 'public', 'private' ],
  type: 'string',
  recruiting: 'bool',
  created_time: 'string',
  updated_time: { type: 'string', required: false },
  tags: { type: 'array', itemType: 'string', required: false },
  total_like: { type: 'int', required: false },
  total_view: { type: 'int', required: false },
  total_mark: { type: 'int', required: false },
  total_comment: { type: 'int', required: false },
  recent_like: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
};

class ProjectController extends Controller {
  async hots() {
    await this.rank('recent_view');
  }

  async likes() {
    await this.rank('recent_like');
  }

  async create() {
    this.ctx.validate(create_rule);
    const {
      id, name, cover, username, user_portrait,
      visibility, type, recruiting, created_time, tags,
    } = this.ctx.request.body;
    const suggestions = this.get_suggestions();
    const data = {
      name, cover, username, user_portrait, visibility,
      type, recruiting, created_time, tags, suggestions,
    };
    const payload = { id, body: data };
    await super.create(payload);
  }

  async update() {
    this.ctx.validate(update_rule);
    const {
      name, cover, user_portrait, visibility,
      type, recruiting, tags, total_like,
      total_view, total_mark, total_comment,
      recent_like, recent_view,
    } = this.ctx.request.body;
    const data = { doc: {
      name, cover, user_portrait, visibility,
      type, recruiting, tags, total_like,
      total_view, total_mark, total_comment,
      recent_like, recent_view,
    } };
    if (name) {
      data.doc.suggestions = this.get_suggestions();
    }
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
  }

  async upsert() {
    this.ctx.validate(upsert_rule);
    const {
      name, cover, username, user_portrait,
      visibility, type, recruiting, created_time, tags,
      total_like, total_view, total_mark, total_comment,
      recent_like, recent_view,
    } = this.ctx.request.body;
    const suggestions = this.get_suggestions();
    const data = {
      name, cover, username, user_portrait, visibility,
      type, recruiting, created_time, tags, suggestions,
      total_like, total_view, total_mark, total_comment,
      recent_like, recent_view,
    };
    const payload = { id: this.ctx.params.id, body: data };
    await super.upsert(payload);
  }

  get_suggestions() {
    const { name } = this.ctx.request.body;
    const pinyin = this.ctx.helper.hanzi_to_pinyin(name);
    const suggestions = [ name, pinyin ];
    return suggestions;
  }

  add_location(payload) {
    const data_type = 'project';
    return super.add_location(payload, data_type);
  }

  get_rank_DSL(field, order) {
    const DSL = this.sort({}, field, order);
    DSL.query = {
      bool: { must_not: { term: { visibility: 'private' } } },
    };
    return DSL;
  }

  get_search_DSL() {
    const DSL = {
      query: {
        bool: {
          must: [],
          must_not: { term: { visibility: 'private' } },
        },
      },
    };
    if (this.ctx.query.q) {
      DSL.query.bool.must.push({ match: { name: this.ctx.query.q } });
    }
    if (this.ctx.query.type) {
      DSL.query.bool.must.push({ term: { type: this.ctx.query.type } });
    }
    if (this.ctx.query.tags) {
      DSL.query.bool.must.push({ term: { tags: this.ctx.query.tags } });
    }
    if (this.ctx.query.recruiting) {
      DSL.query.bool.must.push({ term: { recruiting: true } });
    }
    this.highlight(DSL, 'name');
    this.sort(DSL);
    return DSL;
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

module.exports = ProjectController;
