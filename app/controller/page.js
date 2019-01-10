'use strict';

const Controller = require('../core/base');

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

  add_location(payload) {
    const data_type = 'page';
    return super.add_location(payload, data_type);
  }
}

module.exports = PagesController;
