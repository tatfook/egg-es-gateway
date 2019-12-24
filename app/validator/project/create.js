'use strict';

module.exports = {
    type: 'object',
    title: 'create project',
    properties: {
        id: {
            type: 'integer',
        },
        name: {
            type: 'string',
        },
        username: {
            type: 'string',
        },
        visibility: {
            type: 'string',
            enum: ['public', 'private'],
        },
        type: {
            type: 'string',
        },
        recruiting: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        tags: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        sys_tags: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        created_at: {
            type: 'string',
            mock: {
                mock: '@date',
            },
        },
        updated_at: {
            type: 'string',
            mock: {
                mock: '@date',
            },
        },
    },
    required: [
        'id',
        'name',
        'username',
        'visibility',
        'type',
        'recruiting',
        'created_at',
    ],
};
