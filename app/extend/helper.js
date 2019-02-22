'use strict';

const pinyin = require('pinyin');
const crypto = require('crypto');

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
  to_sha1(str) {
    const hasher = crypto.createHash('sha1');
    hasher.update(str);
    return hasher.digest('hex');
  },
  parseQuery(query) {
    return query.split('|');
  },
  filterSubStr(str, subStr) {
    const splited = str.split(subStr);
    let filtered = '';
    splited.forEach(v => {
      filtered += v;
    });
    return filtered;
  },
};
