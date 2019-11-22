'use strict';

const faker = require('faker');
const _ = require('lodash');

const number_limit = { min: 0, max: 1000 };
const total = 20;

const packages = _.times(total, n => {
    const lesson = {
        _index: 'packages',
        _type: 'packages',
        _id: n,
        _score: 1 - n / total,
        _source: {
            id: n,
            title: faker.name.title(),
            prize: faker.random.number({ min: 0, max: 100 }),
            description: faker.lorem.text(),
            age_min: faker.random.number({ min: 0, max: 4 }),
            age_max: faker.random.number({ min: 4, max: 100 }),
            total_lessons: faker.random.number({ min: 1, max: 20 }),
            recent_view: faker.random.number(number_limit),
            created_at: faker.date.past(),
            updated_at: faker.date.past(),
        },
    };
    return lesson;
});

module.exports = packages;
