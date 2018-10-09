'use strict';

const Controller = require('../core/base_controller');

const create_rule = {
  id: 'int',
  title: 'string',
  cover: 'url',
  total_lessons: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  age_min: { type: 'int', required: false },
  age_max: { type: 'int', required: false },
};

const update_rule = {
  cover: { type: 'url', required: false },
  total_lessons: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
  age_min: { type: 'int', required: false },
  age_max: { type: 'int', required: false },
};

class PackageController extends Controller {
  async create() {
    this.ctx.validate(create_rule);
    const { id, title, cover, total_lessons, age_min, age_max } = this.ctx.request.body;
    const pinyin = this.ctx.helper.hanzi_to_pinyin(title);
    const suggestions = [ title, pinyin ];
    const data = { title, cover, total_lessons, age_min, age_max, suggestions };
    const payload = { id, body: data };
    await super.create(payload);
  }

  async update() {
    this.ctx.validate(update_rule);
    const { cover, total_lessons, recent_view, age_min, age_max } = this.ctx.request.body;
    const data = { doc: { cover, total_lessons, recent_view, age_min, age_max } };
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
  }

  add_location(payload) {
    const data_type = 'package';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    const DSL = {
      query: {
        match: {
          title: this.ctx.query.q,
        },
      },
    };
    const highlight_tag = this.config.highlight_tag;
    this.highlight(DSL, highlight_tag, 'title');
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

module.exports = PackageController;
