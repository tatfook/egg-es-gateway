'use strict';

const pinyin = require('pinyin');

module.exports = {
  hanzi_to_pinyin(han) {
    return pinyin(han, { style: pinyin.STYLE_NORMAL }).join('');
  },
  paginate(query) {
    const size = Number(query.per_page) || 20;
    const page = Number(query.page) || 1;
    const from = (page - 1) * size;
    return [ from, size ];
  },
};
