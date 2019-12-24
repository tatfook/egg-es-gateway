'use strict';

module.exports = {
    type: 'object',
    title: 'update user',
    properties: {
        nickname: {
            type: 'string',
        },
        portrait: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        total_projects: {
            type: 'integer',
        },
        total_follows: {
            type: 'integer',
        },
        total_fans: {
            type: 'integer',
        },
        updated_at: {
            type: 'string',
            mock: {
                mock: '@date',
            },
        },
    },
    required: ['updated_at'],
};
