'use strict';

const Controller = require('../core/base_controller');

const create_rule = {
  title: 'string',
  cover: 'url',
  total_lessons: 'int',
  description: { type: 'string', required: false, allowEmpty: true },
  age_min: { type: 'int', required: false },
  age_max: { type: 'int', required: false },
};

const update_rule = {
  cover: { type: 'url', required: false },
  total_lessons: { type: 'int', required: false },
  recent_view: { type: 'int', required: false },
};

class PackageController extends Controller {
  async create() {
    this.ctx.validate(create_rule);
    const { title, cover, age_min, age_max } = this.ctx.request.body;
    const pinyin = this.ctx.helper.hanzi_to_pinyin(title);
    const suggestions = [ title, pinyin ];
    const data = { title, cover, age_min, age_max, suggestions };
    const payload = { id: title, body: data };
    await super.create(payload);
  }

  async update() {
    this.ctx.validate(update_rule);
    const { cover, total_lessons, recent_view } = this.ctx.request.body;
    const data = { doc: { cover, total_lessons, recent_view } };
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
  }

  add_location(payload) {
    const data_type = 'package';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    return {
      query: {
        fuzzy: {
          title: {
            value: this.ctx.query.q,
            fuzziness: 'AUTO',
          },
        },
      },
      highlight: {
        fields: {
          title: {},
        },
        pre_tags: '<span>',
        post_tags: '</span>',
      },
    };
  }

  wrap_search_result(result) {
    return result.hits.hits.map(hit => {
      hit._source._score = hit._score;
      hit._source.highlight = hit.highlight;
      hit._source.suggestions = undefined;
      return hit._source;
    });
  }
}

module.exports = PackageController;
