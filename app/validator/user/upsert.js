'use strict';

module.exports = {
    type: 'object',
    title: 'upsert user',
    properties: {
        id: {
            type: 'integer',
        },
        username: {
            type: 'string',
            minLength: 4,
            maxLength: 30,
        },
        portrait: {
            type: 'string',
        },
        total_projects: {
            type: 'string',
        },
        total_fans: {
            type: 'string',
        },
        total_follows: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        created_at: {
            type: 'string',
        },
        updated_at: {
            type: 'string',
        },
    },
    required: ['id', 'username', 'created_at'],
};
