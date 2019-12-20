'use strict';

module.exports = {
    type: 'object',
    title: 'update project',
    properties: {
        name: {
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
        recommended: {
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
        point: {
            type: 'number',
        },
        total_like: {
            type: 'integer',
        },
        total_view: {
            type: 'integer',
        },
        total_mark: {
            type: 'integer',
        },
        total_comment: {
            type: 'integer',
        },
        recent_like: {
            type: 'integer',
        },
        recent_view: {
            type: 'integer',
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
    required: ['updated_at'],
};
