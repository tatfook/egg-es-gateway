'use strict';

const Controller = require('../core/base_controller');

const create_rule = {
  id: 'int',
  title: 'string',
  cover: 'string',
  total_lessons: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  age_min: { type: 'int', required: false },
  age_max: { type: 'int', required: false },
};

const update_rule = {
  title: { type: 'string', required: false },
  cover: { type: 'string', required: false },
  total_lessons: { type: 'int', required: false },
  description: { type: 'string', required: false, allowEmpty: true },
  recent_view: { type: 'int', required: false },
  age_min: { type: 'int', required: false },
  age_max: { type: 'int', required: false },
};

class PackageController extends Controller {
  async hots() {
    await this.rank('recent_view');
  }

  async create() {
    this.ctx.validate(create_rule);
    const {
      id, title, cover, total_lessons,
      description, age_min, age_max,
    } = this.ctx.request.body;
    const suggestions = this.get_suggestions();
    const data = {
      title, cover, total_lessons,
      description, age_min, age_max, suggestions,
    };
    const payload = { id, body: data };
    await super.create(payload);
  }

  async update() {
    this.ctx.validate(update_rule);
    const {
      title, cover, total_lessons,
      description, recent_view, age_min, age_max,
    } = this.ctx.request.body;
    const data = { doc: {
      title, cover, total_lessons,
      description, recent_view, age_min, age_max,
    } };
    if (title) {
      data.doc.suggestions = this.get_suggestions();
    }
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
  }

  get_suggestions() {
    const { title } = this.ctx.request.body;
    const pinyin = this.ctx.helper.hanzi_to_pinyin(title);
    const suggestions = [ title, pinyin ];
    return suggestions;
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
    this.highlight(DSL, 'title');
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
