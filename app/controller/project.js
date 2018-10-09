'use strict';

const Controller = require('../core/base_controller');

const create_rule = {
  id: 'int',
  name: 'string',
  cover: 'url',
  username: 'string',
  user_portrait: 'url',
  visibility: [ 'public', 'private' ],
  type: 'string',
  recruiting: 'bool',
  created_time: 'datetime',
};

const update_rule = {
  cover: { type: 'url', required: false },
  user_portrait: { type: 'url', required: false },
  total_like: { type: 'int', required: false },
  total_view: { type: 'int', required: false },
  total_mark: { type: 'int', required: false },
  total_comment: { type: 'int', required: false },
  recent_search: { type: 'int', required: false },
  recent_like: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
};

class ProjectController extends Controller {
  async create() {
    this.ctx.validate(create_rule);
    const {
      id, name, cover, username, user_portrait,
      visibility, type, recruiting, created_time,
    } = this.ctx.request.body;
    const pinyin = this.ctx.helper.hanzi_to_pinyin(name);
    const suggestions = [ name, pinyin ];
    const data = {
      name, cover, username, user_portrait, visibility,
      type, recruiting, created_time, suggestions,
    };
    const payload = { id, body: data };
    await super.create(payload);
  }

  async update() {
    this.ctx.validate(update_rule);
    const {
      cover, user_portrait, total_like,
      total_view, total_mark, total_comment,
      recent_search, recent_like, recent_view,
    } = this.ctx.request.body;
    const data = { doc: {
      cover, user_portrait, total_like,
      total_view, total_mark, total_comment,
      recent_search, recent_like, recent_view,
    } };
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
  }

  add_location(payload) {
    const data_type = 'project';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    const DSL = {
      query: {
        match: {
          name: this.ctx.query.q,
        },
      },
    };
    const highlight_tag = this.config.highlight_tag;
    this.highlight(DSL, highlight_tag, 'name');
    this.sort(DSL);
    return DSL;
  }

  wrap_search_result(result) {
    return {
      hits: result.hits.hits.map(hit => {
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
