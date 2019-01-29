'use strict';

const faker = require('faker');
const _ = require('lodash');

const number_limit = { min: 0, max: 1000 };
const types = [ 'website', 'paracraft' ];
const total = 20;

const projects = _.times(total, n => {
  const project = {
    _index: 'projects',
    _type: 'projects',
    _id: n,
    _score: (1 - n / total),
    _source: {
      name: faker.commerce.productName(),
      cover: faker.image.avatar(),
      username: faker.finance.accountName(),
      user_portrait: faker.image.avatar(),
      visibility: 'public',
      type: faker.helpers.randomize(types),
      recruiting: faker.random.boolean(),
      total_like: faker.random.number(number_limit),
      total_view: faker.random.number(number_limit),
      total_comment: faker.random.number(number_limit),
      recent_view: faker.random.number(number_limit),
      id: n,
      created_at: faker.date.past(),
      updated_at: faker.date.past(),
    },
  };
  return project;
});

module.exports = projects;
