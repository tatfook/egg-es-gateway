'use strict';

const faker = require('faker');
const _ = require('lodash');
const total = 20;

const users = _.times(total, n => {
    const user = {
        _index: 'projects',
        _type: 'projects',
        _id: n,
        _score: 1 - n / total,
        _source: {
            id: n,
            username: faker.internet.userName(),
            nickname: faker.internet.userName(),
            portrait: faker.internet.avatar(),
            created_at: faker.date.past(),
            updated_at: faker.date.past(),
            total_projects: faker.random.number(),
            total_fans: faker.random.number(),
            total_follows: faker.random.number(),
            description: faker.lorem.text(),
        },
    };
    return user;
});

module.exports = users;
