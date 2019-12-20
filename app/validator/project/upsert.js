'use strict';

module.exports = {
    type: 'object',
    title: 'upsert project',
    properties: {
        id: {
            type: 'integer',
        },
        field_47: {
            type: 'string',
        },
        video: {
            type: 'string',
        },
        cover: {
            type: 'string',
        },
        username: {
            type: 'string',
        },
        user_portrait: {
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
        world_tag_name: {
            type: 'string',
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
    required: ['created_at'],
};
