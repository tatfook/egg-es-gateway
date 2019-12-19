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
        updated_at: { type: 'string', mock: { mock: '@date' } },
    },
    required: ['updated_at'],
};
