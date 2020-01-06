'use strict';

module.exports = {
    type: 'object',
    title: 'update page',
    additionalProperties: false,
    properties: {
        title: { type: 'string' },
        visibility: {
            type: 'string',
            enum: ['public', 'private'],
        },
        content: { type: 'string' },
        lite_content: { type: 'string', description: '简化版content' },
        updated_at: { type: 'string', mock: { mock: '@date' } },
    },
    required: ['updated_at'],
};
