'use strict';

const faker = require('faker');
const _ = require('lodash');
const total = 20;

const visibility = ['private', 'public'];

const pages = _.times(total, n => {
    const page = {
        _index: 'projects',
        _type: 'projects',
        _id: n,
        _score: 1 - n / total,
        _source: {
            id: n,
            title: faker.name.title(),
            url: faker.internet.url(),
            site: faker.internet.domainName(),
            username: faker.internet.userName(),
            visibility: faker.helpers.randomize(visibility),
            content: faker.lorem.text(),
            created_at: faker.date.past(),
            updated_at: faker.date.past(),
        },
    };
    return page;
});

module.exports = pages;
