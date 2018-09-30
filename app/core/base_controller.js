'use strict';

const Controller = require('egg').Controller;

class Base_controllerController extends Controller {
  add_location(payload, data_type) {
    const { index, type } = this.config.elasticsearch.locations[data_type];
    payload.index = index;
    payload.type = type;
    return payload;
  }

  success(action = 'success') {
    this.ctx.body = {};
    this.ctx.body[action] = true;
  }

  created() {
    this.ctx.status = 201;
    this.success('created');
  }

  updated() {
    this.success('updated');
  }

  deleted() {
    this.success('deleted');
  }

  moved() {
    this.success('moved');
  }
}

module.exports = Base_controllerController;
