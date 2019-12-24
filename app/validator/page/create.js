'use strict';

module.exports = {
    type: 'object',
    title: 'create page',
    additionalProperties: false,
    properties: {
        url: { type: 'string', mock: { mock: '@url' } },
        site: { type: 'string', mock: { mock: '@word' } },
        username: { type: 'string', mock: { mock: '@word' } },
        title: { type: 'string' },
        visibility: {
            type: 'string',
            enum: ['public', 'private'],
            default: 'public',
        },
        content: { type: 'string' },
        created_at: { type: 'string', mock: { mock: '@date' } },
        updated_at: { type: 'string', mock: { mock: '@date' } },
    },
    required: [
        'url',
        'site',
        'username',
        'title',
        'visibility',
        'created_at',
        'content',
    ],
};
