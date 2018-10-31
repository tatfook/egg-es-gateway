'use strict';

const Controller = require('../core/base_controller');

const create_rule = {
  id: 'int',
  username: { type: 'string', min: 4, max: 30 },
  sitename: 'string',
  cover: { type: 'string', required: false, allowEmpty: true },
  display_name: { type: 'string', required: false, allowEmpty: true },
  desc: { type: 'string', required: false, allowEmpty: true },
};

const update_rule = {
  sitename: { type: 'string', required: false },
  cover: { type: 'string', required: false, allowEmpty: true },
  display_name: { type: 'string', required: false, allowEmpty: true },
  desc: { type: 'string', required: false, allowEmpty: true },
};

const upsert_rule = {
  username: { type: 'string', min: 4, max: 30 },
  sitename: 'string',
  cover: { type: 'string', required: false, allowEmpty: true },
  display_name: { type: 'string', required: false, allowEmpty: true },
  desc: { type: 'string', required: false, allowEmpty: true },
};

class SiteController extends Controller {
  async create() {
    this.ctx.validate(create_rule);
    if (!this.ctx.request.body.display_name) {
      this.ctx.request.body.display_name = this.ctx.request.body.sitename;
    }
    const {
      id, username, sitename,
      cover, display_name, desc,
    } = this.ctx.request.body;
    const suggestions = this.get_suggestions();
    const data = {
      username, sitename, cover,
      display_name, desc, suggestions,
    };
    const payload = { id, body: data };
    await super.create(payload);
  }

  async update() {
    this.ctx.validate(update_rule);
    const { sitename, cover, display_name, desc } = this.ctx.request.body;
    const data = { doc: { cover, display_name, desc } };
    if (display_name) {
      if (!sitename) {
        const errMsg = 'sitename is required while updating display_name';
        this.ctx.throw(400, errMsg);
      }
      data.doc.suggestions = this.get_suggestions();
    }
    const payload = { id: this.ctx.params.id, body: data };
    await super.update(payload);
  }

  async upsert() {
    this.ctx.validate(upsert_rule);
    if (!this.ctx.request.body.display_name) {
      this.ctx.request.body.display_name = this.ctx.request.body.sitename;
    }
    const {
      username, sitename, cover, display_name, desc,
    } = this.ctx.request.body;
    const suggestions = this.get_suggestions();
    const data = {
      username, sitename, cover, display_name, desc, suggestions,
    };
    const payload = { id: this.ctx.params.id, body: data };
    await super.upsert(payload);
  }

  get_suggestions() {
    const { sitename, display_name } = this.ctx.request.body;
    const sitename_pinyin = this.ctx.helper.hanzi_to_pinyin(sitename);
    const suggestions = [ sitename, sitename_pinyin ];
    if (display_name !== sitename) {
      const display_name_pinyin = this.ctx.helper.hanzi_to_pinyin(display_name);
      suggestions.push(display_name);
      suggestions.push(display_name_pinyin);
    }
    return suggestions;
  }

  add_location(payload) {
    const data_type = 'site';
    return super.add_location(payload, data_type);
  }

  get_search_DSL() {
    const DSL = { query: {} };
    if (this.ctx.query.q) {
      DSL.query.multi_match = {
        query: this.ctx.query.q,
        fields: [ 'sitename', 'display_name' ],
      };
    }
    this.highlight(DSL, 'sitename', 'display_name');
    this.sort(DSL);
    return this.sort(DSL);
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

module.exports = SiteController;
