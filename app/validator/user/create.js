'use strict';

module.exports = {
    type: 'object',
    title: 'create user',
    properties: {
        id: {
            type: 'integer',
        },
        username: {
            type: 'string',
            minLength: 4,
            maxLength: 30,
        },
        nickname: {
            type: 'string',
        },
        portrait: {
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
